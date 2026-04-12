import { expect, test } from "bun:test";

test("tutor screen module loads", async () => {
  const module = await import("@/components/screens/tutor-screen");
  expect(typeof module.TutorScreen).toBe("function");
});
