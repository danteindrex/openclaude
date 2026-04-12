import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "bun:test";

import { POST } from "@/app/api/tutor/sessions/[sessionId]/folder/route";
import { createTutorSession, resetTutorStoreForTests } from "@/lib/server/tutor-session-store";

test("folder route rejects missing folders", async () => {
  resetTutorStoreForTests();
  const session = createTutorSession(process.cwd());

  const response = await POST(
    new Request("http://localhost/api/tutor/folder", {
      method: "POST",
      body: JSON.stringify({ folderPath: "Z:/definitely-missing-folder" }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ sessionId: session.id }) },
  );

  expect(response.status).toBe(400);
});

test("folder route accepts existing folders", async () => {
  resetTutorStoreForTests();
  const session = createTutorSession(process.cwd());
  const folderPath = join(process.cwd(), "webapp", ".tmp-folder-test");
  mkdirSync(folderPath, { recursive: true });

  const response = await POST(
    new Request("http://localhost/api/tutor/folder", {
      method: "POST",
      body: JSON.stringify({ folderPath }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ sessionId: session.id }) },
  );

  expect(response.status).toBe(200);
  rmSync(folderPath, { recursive: true, force: true });
});
