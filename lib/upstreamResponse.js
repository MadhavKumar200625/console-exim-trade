import "server-only";
import { NextResponse } from "next/server";

export function upstreamJson(data, init) {
  return NextResponse.json(data, init);
}
