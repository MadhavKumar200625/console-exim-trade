import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getUserDetails, getUsage } from "@/lib/userDb";

export async function GET() {
  const session = await requireSession();
  const [profile, usage] = await Promise.all([
    getUserDetails(session.masterId, session.userId),
    getUsage(session.masterId),
  ]);

  return NextResponse.json({
    ...profile,
    usage,
    session,
  });
}
