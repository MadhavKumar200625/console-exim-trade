import { NextResponse } from "next/server";

function demoResponse(message) {
  return NextResponse.json({
    message,
    data: [],
  });
}

export async function POST(request) {
  const payload = await request.json();
  console.log("POST /api/trades/search payload:", payload);
  const baseUrl =
    process.env.TRADES_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TRADES_API_BASE_URL;

  if (!baseUrl) {
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

    console.log("POST /api/trades/search response status:", response);

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

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
