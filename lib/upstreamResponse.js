import { NextResponse } from "next/server";

export function upstreamJson(data, init, endpoint) {
  const response = NextResponse.json(data, init);
  response.headers.set("x-upstream-endpoint", endpoint);
  return response;
}
