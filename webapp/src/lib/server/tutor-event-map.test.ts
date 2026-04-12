import { expect, test } from "bun:test";

import { mapServerMessage } from "@/lib/server/tutor-event-map";

test("maps tool results into browser activity events", () => {
  expect(
    mapServerMessage("s1", {
      tool_result: { tool_name: "Bash", output: "ok", is_error: false },
    }),
  ).toEqual({
    type: "tool-result",
    sessionId: "s1",
    toolName: "Bash",
    output: "ok",
    isError: false,
  });
});
