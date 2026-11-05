import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { upstreamJson } from "@/lib/upstreamResponse";
import { getTradeSuggestions } from "@/lib/tradeSuggestions";

export async function POST(request) {
  await requireSession();
  const payload = await request.json();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "hscode";
  const baseUrl = process.env.TRADES_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ suggestions: [], message: "TRADES_API_BASE_URL is not configured." }, { status: 503 });
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/v1/trades/search`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const companyField = payload?.filters?.Exporter_Name !== undefined ? "Exporter_Name" : "Importer_Name";
    const suggestions = response.ok ? getTradeSuggestions(data, query, type, companyField) : [];

    return upstreamJson({ suggestions }, { status: response.status });
  } catch (error) {
    return upstreamJson(
      { suggestions: [], message: "Unable to load search suggestions." },
      { status: 502 },
    );
  }
}
