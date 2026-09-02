import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

export async function POST(request) {
  await requireSession();
  const baseUrl =
    process.env.TRADES_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TRADES_API_BASE_URL;
  if (!baseUrl)
    return NextResponse.json(
      { message: "TRADES_API_BASE_URL is not configured.", data: [] },
      { status: 503 },
    );

  try {

    const payload = await request.json();
    console.log("[trades/trends/monthly] payload", JSON.stringify(payload));
    
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/trades/trends/monthly`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    // console.log("[trades/trends/monthly] response", response.status, JSON.stringify(data));
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Unable to connect to the trade trends API.",
        data: [],
      },
      { status: 502 },
    );
  }
}
