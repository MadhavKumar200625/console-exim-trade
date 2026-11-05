import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { recordSearchUsage } from "@/lib/userDb";
import { upstreamJson } from "@/lib/upstreamResponse";

function demoResponse(message) {
  return NextResponse.json({
    message,
    data: [],
  });
}

export async function POST(request) {
  const session = await requireSession();
  const payload = await request.json();
  const baseUrl = process.env.TRADES_API_BASE_URL;

  if (!baseUrl) {
    await recordSearchUsage(session.masterId, session.userId, payload.Table_Name || "global");
    return demoResponse("TRADES_API_BASE_URL is not configured.");
  }
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/v1/trades/search`;

  try {
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    await recordSearchUsage(session.masterId, session.userId, payload.Table_Name || "global");
    return upstreamJson(data, { status: response.status });
  } catch (error) {
    return upstreamJson(
      {
        message: "Unable to connect to trades API.",
        data: [],
      },
      { status: 502 },
    );
  }
}
