import { Socket } from "node:net";

async function canReachGrpcSocket(host: string, port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(1500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

export async function getTutorRuntimeStatus() {
  const ollamaBaseUrl = process.env.OPENAI_BASE_URL ?? "http://localhost:11434/v1";
  const tagsUrl = ollamaBaseUrl.replace(/\/v1\/?$/, "") + "/api/tags";
  const grpcHost = process.env.GRPC_HOST ?? "localhost";
  const grpcPort = Number.parseInt(process.env.GRPC_PORT ?? "50051", 10);

  const [grpcSocketReady, ollamaReady] = await Promise.all([
    canReachGrpcSocket(grpcHost, grpcPort),
    fetch(tagsUrl, { signal: AbortSignal.timeout(1500) }).then((response) => response.ok).catch(() => false),
  ]);

  return {
    grpcReady: grpcSocketReady,
    grpcSocketReachable: grpcSocketReady,
    ollamaReady,
    model: process.env.OPENAI_MODEL ?? null,
    grpcHost,
    grpcPort: String(grpcPort),
  };
}
