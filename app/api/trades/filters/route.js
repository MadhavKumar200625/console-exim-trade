import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { upstreamJson } from "@/lib/upstreamResponse";

function demoResponse(message) {
  return NextResponse.json({
    message,
    data: null,
  });
}

export async function POST(request) {
  await requireSession();
  const payload = await request.json();
  const baseUrl =
    process.env.TRADES_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TRADES_API_BASE_URL;

  if (!baseUrl) {
    return demoResponse("TRADES_API_BASE_URL is not configured.");
  }
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/v1/trades/filters`;

  try {
    console.log(payload)
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

    return upstreamJson(data, { status: response.status }, endpoint);
  } catch (error) {
    return upstreamJson(
      {
        message: error.message || "Unable to connect to trades filters API.",
        data: null,
      },
      { status: 502 },
      endpoint,
    );
  }
}
