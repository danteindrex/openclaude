import { NextResponse } from "next/server";

import { createTutorSession } from "@/lib/server/tutor-session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const activeFolder =
    typeof body.activeFolder === "string" && body.activeFolder.trim().length > 0
      ? body.activeFolder.trim()
      : process.cwd();

  const session = createTutorSession(activeFolder);
  return NextResponse.json(session, { status: 201 });
}
