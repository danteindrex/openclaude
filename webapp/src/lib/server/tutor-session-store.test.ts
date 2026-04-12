import { expect, test } from "bun:test";

import {
  createTutorSession,
  resetTutorStoreForTests,
  updateTutorSessionFolder,
} from "@/lib/server/tutor-session-store";

test("folder updates stay attached to the same session", () => {
  resetTutorStoreForTests();
  const session = createTutorSession("C:/work/a");
  const updated = updateTutorSessionFolder(session.id, "C:/work/b");
  expect(updated?.activeFolder).toBe("C:/work/b");
});
