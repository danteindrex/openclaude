import { expect, mock, test } from "bun:test";

mock.module("@/lib/server/tutor-status", () => ({
  getTutorRuntimeStatus: () =>
    Promise.resolve({
      grpcReady: true,
      ollamaReady: true,
      model: "gemma4:e2b",
      grpcHost: "localhost",
      grpcPort: "50051",
    }),
}));

test("status route returns runtime readiness payload", async () => {
  const { GET } = await import("@/app/api/tutor/status/route");
  const response = await GET();
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload.model).toBe("gemma4:e2b");
});
