import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

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

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/trades/filters`,
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

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Unable to connect to trades filters API.",
        data: null,
      },
      { status: 502 },
    );
  }
}
