import { getTutorSessionSnapshot } from "@/lib/server/tutor-session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VLLM_BASE_URL = process.env.VLLM_BASE_URL ?? "http://localhost:8000";

function formatEvent(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = getTutorSessionSnapshot(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  // Build messages array from session history, excluding empty/streaming placeholders
  const historyMessages = session.messages
    .filter((m) => m.text && m.text.trim().length > 0)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));

  const messages = [
    { role: "system", content: "You are ElimuBot, a helpful AI tutor. Answer clearly and concisely." },
    ...historyMessages,
    { role: "user", content: message },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let controllerClosed = false;
      const safeEnqueue = (data: unknown) => {
        if (controllerClosed) return;
        controller.enqueue(encoder.encode(formatEvent(data)));
      };
      const safeClose = () => {
        if (controllerClosed) return;
        controllerClosed = true;
        controller.close();
      };

      safeEnqueue({ type: "system", text: "stream-ready" });

      try {
        const vllmRes = await fetch(`${VLLM_BASE_URL}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            stream: true,
            max_tokens: 512,
            temperature: 0.7,
          }),
        });

        if (!vllmRes.ok || !vllmRes.body) {
          const errText = await vllmRes.text().catch(() => "vLLM request failed");
          safeEnqueue({ type: "error", message: errText });
          safeClose();
          return;
        }

        const reader = vllmRes.body.getReader();
        const dec = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          fullText += chunk;
          safeEnqueue({ type: "text-delta", text: chunk });
        }

        safeEnqueue({ type: "done", fullText });
      } catch (err) {
        safeEnqueue({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to reach vLLM backend",
        });
      } finally {
        safeClose();
      }
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

