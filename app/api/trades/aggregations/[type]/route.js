import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { upstreamJson } from "@/lib/upstreamResponse";

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
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/v1/trades/aggregations/${type}`;

  try {
    const payload = await request.json();
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return upstreamJson(data, { status: response.status }, endpoint);
  } catch (error) {
    return upstreamJson(
      { message: error.message || "Unable to connect to the trade aggregation API.", data: [] },
      { status: 502 },
      endpoint,
    );
  }
}
