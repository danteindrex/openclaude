import { NextResponse } from "next/server";

import { getTutorRuntimeStatus } from "@/lib/server/tutor-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTutorRuntimeStatus());
}
