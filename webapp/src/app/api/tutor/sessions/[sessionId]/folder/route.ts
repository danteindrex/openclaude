import { stat } from "node:fs/promises";

import { NextResponse } from "next/server";

import {
  getTutorSessionSnapshot,
  updateTutorSessionFolder,
} from "@/lib/server/tutor-session-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const body = await request.json().catch(() => ({}));
  const folderPath = typeof body.folderPath === "string" ? body.folderPath.trim() : "";

  if (!folderPath) {
    return NextResponse.json({ error: "folderPath is required" }, { status: 400 });
  }

  if (!getTutorSessionSnapshot(sessionId)) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const details = await stat(folderPath);
    if (!details.isDirectory()) {
      return NextResponse.json({ error: "Path is not a directory" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Folder not accessible" },
      { status: 400 },
    );
  }

  const session = updateTutorSessionFolder(sessionId, folderPath);
  return NextResponse.json(session);
}
