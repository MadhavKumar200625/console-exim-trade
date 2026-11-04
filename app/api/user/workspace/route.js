import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { deleteWorkspaceItem, getWorkspaceItems, saveSearch } from "@/lib/userDb";

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

export async function DELETE(request) {
  const session = await requireSession();
  const { id } = await request.json();
  const workspaceId = Number(id);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    return NextResponse.json({ message: "Invalid workspace id." }, { status: 400 });
  }

  const result = await deleteWorkspaceItem(session.masterId, session.userId, workspaceId);
  if (!result.deleted) {
    return NextResponse.json({ message: "Workspace could not be deleted." }, { status: 404 });
  }
  return NextResponse.json(result);
}
