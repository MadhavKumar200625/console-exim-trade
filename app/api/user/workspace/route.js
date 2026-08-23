import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getWorkspaceItems, saveSearch } from "@/lib/userDb";

export async function GET() {
  const session = await requireSession();
  const data = await getWorkspaceItems(session.masterId, session.userId);
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await requireSession();
  const payload = await request.json();
  const data = await saveSearch(session.masterId, session.userId, payload);
  return NextResponse.json(data);
}
