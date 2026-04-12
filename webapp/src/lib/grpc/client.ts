import * as grpc from "@grpc/grpc-js";

import { openclaudeProto } from "@/lib/grpc/proto";

type ServerMessage = any;
const grpcDebugEnabled = process.env.GRPC_DEBUG === "1";

function logGrpcDebug(message: string, details?: Record<string, unknown>) {
  if (!grpcDebugEnabled) {
    return;
  }

  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[webapp grpc] ${message}${payload}`);
}

export type AgentStream = {
  sendPrompt: (request: {
    message: string;
    sessionId: string;
    workingDirectory: string;
    model?: string | null;
  }) => void;
  sendReply: (promptId: string, reply: string) => void;
  close: () => void;
};

export function createAgentClient() {
  const host = process.env.GRPC_HOST ?? "localhost";
  const port = process.env.GRPC_PORT ?? "50051";
  logGrpcDebug("create client", { host, port });

  return new openclaudeProto.openclaude.v1.AgentService(
    `${host}:${port}`,
    grpc.credentials.createInsecure(),
  );
}

export function waitForAgentClientReady(deadlineMs = 1500): Promise<boolean> {
  const client = createAgentClient();
  const deadlineAt = Date.now() + deadlineMs;

  return new Promise((resolve) => {
    client.waitForReady(deadlineAt, (error: Error | null) => {
      logGrpcDebug("waitForReady resolved", {
        deadlineMs,
        ok: !error,
        error: error?.message,
      });
      client.close();
      resolve(!error);
    });
  });
}

function getGrpcReadyDeadlineMs(defaultMs: number): number {
  const configured = Number.parseInt(process.env.GRPC_READY_TIMEOUT_MS ?? "", 10);
  return Number.isFinite(configured) && configured > 0 ? configured : defaultMs;
}

export function openAgentStream(handlers: {
  onMessage: (message: ServerMessage) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}): AgentStream {
  const client = createAgentClient();
  const readyDeadlineMs = getGrpcReadyDeadlineMs(30000);
  let call: grpc.ClientDuplexStream<any, any> | null = null;
  let closed = false;
  let channelReady = false;
  const queuedWrites: Array<Record<string, unknown>> = [];

  const closeClient = () => {
    if (closed) {
      return;
    }

    closed = true;
    client.close();
  };

  const drainQueue = () => {
    if (!call || !channelReady || closed) {
      return;
    }

    for (const message of queuedWrites.splice(0)) {
      call.write(message);
    }
  };

  const ensureCall = () => {
    if (call || closed) {
      return call;
    }

    logGrpcDebug("opening Chat stream");
    const nextCall = client.Chat();
    call = nextCall;
    nextCall.on("data", handlers.onMessage);
    nextCall.on("error", (error: Error) => {
      logGrpcDebug("stream error", { error: error.message });
      handlers.onError(error);
    });
    nextCall.on("end", () => {
      logGrpcDebug("stream end");
      handlers.onClose();
      closeClient();
    });
    nextCall.on("close", () => {
      logGrpcDebug("stream close");
      handlers.onClose();
      closeClient();
    });
    return nextCall;
  };

  logGrpcDebug("waitForReady start", { readyDeadlineMs });
  client.waitForReady(Date.now() + readyDeadlineMs, (error: Error | null) => {
    if (error) {
      logGrpcDebug("waitForReady error", { error: error.message, readyDeadlineMs });
      handlers.onError(error);
      closeClient();
      return;
    }

    logGrpcDebug("waitForReady success");
    channelReady = true;
    ensureCall();
    drainQueue();
  });

  const writeOrQueue = (message: Record<string, unknown>) => {
    if (closed) {
      return;
    }

    logGrpcDebug("queue write", {
      kind: Object.keys(message)[0] ?? "unknown",
      queuedBefore: queuedWrites.length,
    });
    queuedWrites.push(message);
    drainQueue();
  };

  return {
    sendPrompt(request) {
      writeOrQueue({
        request: {
          message: request.message,
          working_directory: request.workingDirectory,
          model: request.model ?? undefined,
          session_id: request.sessionId,
        },
      });
    },
    sendReply(promptId, reply) {
      writeOrQueue({
        input: {
          prompt_id: promptId,
          reply,
        },
      });
    },
    close() {
      try {
        if (call && channelReady && !closed) {
          call.write({
            cancel: {
              reason: "client_closed",
            },
          });
        } else if (!closed) {
          queuedWrites.push({
            cancel: {
              reason: "client_closed",
            },
          });
        }
      } catch {
        // ignore
      }

      try {
        call?.end();
      } catch {
        // ignore
      }
      closeClient();
    },
  };
}
