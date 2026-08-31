import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

const allowedTypes = new Set(["importers", "suppliers"]);

export async function POST(request, { params }) {
  await requireSession();
  const { type } = await params;

  if (!allowedTypes.has(type)) {
    return NextResponse.json({ message: "Unknown aggregation type." }, { status: 404 });
  }

  const baseUrl =
    process.env.TRADES_API_BASE_URL ||
    process.env.NEXT_PUBLIC_TRADES_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "TRADES_API_BASE_URL is not configured.", data: [] },
      { status: 503 },
    );
  }

  try {
    const payload = await request.json();
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/trades/aggregations/${type}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Unable to connect to the trade aggregation API.", data: [] },
      { status: 502 },
    );
  }
}
