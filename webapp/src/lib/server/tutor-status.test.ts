import { expect, mock, test } from "bun:test";

mock.module("@/lib/grpc/client", () => ({
  waitForAgentClientReady: () => Promise.resolve(true),
}));

test("returns runtime readiness and model metadata", async () => {
  const originalFetch = global.fetch;
  const originalModel = process.env.OPENAI_MODEL;
  process.env.OPENAI_MODEL = "gemma4:e2b";
  global.fetch = mock(() =>
    Promise.resolve({ ok: true } as Response),
  ) as typeof global.fetch;

  const { getTutorRuntimeStatus } = await import("@/lib/server/tutor-status");
  const status = await getTutorRuntimeStatus();

  expect(status.grpcReady).toBe(true);
  expect(status.ollamaReady).toBe(true);
  expect(status.model).toBe("gemma4:e2b");

  global.fetch = originalFetch;
  process.env.OPENAI_MODEL = originalModel;
});
