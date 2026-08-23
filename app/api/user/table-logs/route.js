import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { userDbTableLog } from "@/lib/tableLog";

export async function GET() {
  await requireSession();
  return NextResponse.json({ tables: userDbTableLog });
}
