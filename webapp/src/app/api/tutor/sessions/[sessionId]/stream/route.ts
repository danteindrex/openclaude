import {
  getTutorSessionSnapshot,
  subscribeToTutorSession,
} from "@/lib/server/tutor-session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatEvent(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = getTutorSessionSnapshot(sessionId);

  if (!session) {
    return new Response(formatEvent({ type: "error", message: "Session not found" }), {
      status: 404,
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  }

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(formatEvent({ type: "system", text: "stream-ready" })));
      unsubscribe = subscribeToTutorSession(sessionId, (event) => {
        controller.enqueue(encoder.encode(formatEvent(event)));
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);
    },
    cancel() {
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
