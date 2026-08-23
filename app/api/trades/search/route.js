import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { logSearch } from "@/lib/userDb";

function demoResponse(message) {
  return NextResponse.json({
    message,
    data: [],
  });
}

export async function POST(request) {
  const session = await requireSession();
  const payload = await request.json();
  const baseUrl =
    process.env.TRADES_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TRADES_API_BASE_URL;

  if (!baseUrl) {
    await logSearch(session.masterId, session.userId, payload, payload.Table_Name || "global");
    return demoResponse("TRADES_API_BASE_URL is not configured.");
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/trades/search`,
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
    await logSearch(session.masterId, session.userId, payload, payload.Table_Name || "global");

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Unable to connect to trades API.",
        data: [],
      },
      { status: 502 },
    );
  }
}
