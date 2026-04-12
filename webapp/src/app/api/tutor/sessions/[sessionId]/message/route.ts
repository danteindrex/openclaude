import { spawn } from "node:child_process";
import path from "node:path";
import { mapServerMessage } from "@/lib/server/tutor-event-map";
import { getTutorSessionSnapshot } from "@/lib/server/tutor-session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (!getTutorSessionSnapshot(sessionId)) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const session = getTutorSessionSnapshot(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let controllerClosed = false;
      const safeEnqueue = (data: unknown) => {
        if (controllerClosed) {
          return;
        }
        controller.enqueue(encoder.encode(formatEvent(data)));
      };

      const safeClose = () => {
        if (controllerClosed) {
          return;
        }
        controllerClosed = true;
        controller.close();
      };

      safeEnqueue({ type: "system", text: "stream-ready" });

      const repoRoot = process.cwd().endsWith(`${path.sep}webapp`)
        ? path.resolve(process.cwd(), "..")
        : process.cwd();
      const bunExecutable = process.env.BUN_EXECUTABLE || "bun";
      const child = spawn(
        bunExecutable,
        ["run", "scripts/tutor-grpc-proxy.ts"],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            TUTOR_GRPC_REQUEST_JSON: JSON.stringify({
              message,
              sessionId,
              workingDirectory: session.activeFolder,
              model: session.model,
            }),
          },
          stdio: ["ignore", "pipe", "pipe"],
          shell: process.platform === "win32",
        },
      );

      let stdoutBuffer = "";
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        stdoutBuffer += chunk;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          try {
            const payload = JSON.parse(line) as {
              serverMessage?: unknown;
              error?: string;
            };

            if (payload.serverMessage) {
              const mapped = mapServerMessage(sessionId, payload.serverMessage);
              if (mapped) {
                safeEnqueue(mapped);
              }
              continue;
            }

            if (payload.error) {
              safeEnqueue({
                type: "error",
                sessionId,
                message: payload.error,
              });
            }
          } catch (error) {
            safeEnqueue({
              type: "error",
              sessionId,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to parse tutor bridge output",
            });
          }
        }
      });

      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk: string) => {
        const messageText = chunk.trim();
        if (!messageText) {
          return;
        }
        safeEnqueue({
          type: "system",
          sessionId,
          text: messageText,
        });
      });

      child.on("error", (error) => {
        safeEnqueue({
          type: "error",
          sessionId,
          message: error.message,
        });
        safeClose();
      });

      child.on("close", () => {
        if (stdoutBuffer.trim()) {
          try {
            const payload = JSON.parse(stdoutBuffer) as {
              serverMessage?: unknown;
              error?: string;
            };
            if (payload.serverMessage) {
              const mapped = mapServerMessage(sessionId, payload.serverMessage);
              if (mapped) {
                safeEnqueue(mapped);
              }
            } else if (payload.error) {
              safeEnqueue({
                type: "error",
                sessionId,
                message: payload.error,
              });
            }
          } catch {
            // ignore trailing partial payloads on shutdown
          }
        }
        safeClose();
      });
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
