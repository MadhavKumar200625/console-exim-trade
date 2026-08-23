import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getRecentDownloads, getUsage } from "@/lib/userDb";

export async function GET() {
  const session = await requireSession();
  const [usage, downloads] = await Promise.all([
    getUsage(session.masterId),
    getRecentDownloads(session.masterId, session.userId, 100),
  ]);

  return NextResponse.json({ usage, downloads: downloads.downloads });
}

export async function POST(request) {
  const session = await requireSession();
  const payload = await request.json();
  const { logDownload } = await import("@/lib/userDb");
  const count = Number(payload.count || payload.rows?.length || payload.pagination?.limit || 0);
  const result = await logDownload(session.masterId, session.userId, payload, count);
  return NextResponse.json(result);
}
