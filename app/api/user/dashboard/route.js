import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getRecentDownloads, getUsage, getWorkspaceItems } from "@/lib/userDb";

export async function GET() {
  const session = await requireSession();
  const [usage, downloads, workspace] = await Promise.all([
    getUsage(session.masterId),
    getRecentDownloads(session.masterId, session.userId, 4),
    getWorkspaceItems(session.masterId, session.userId),
  ]);

  return NextResponse.json({
    usage,
    downloads: downloads.downloads,
    favorites: workspace.workspaces.slice(0, 4),
  });
}
