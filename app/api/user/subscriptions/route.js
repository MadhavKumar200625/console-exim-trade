import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getSubscriptions } from "@/lib/userDb";

export async function GET() {
  const session = await requireSession();
  const data = await getSubscriptions(session.masterId);
  return NextResponse.json(data);
}
