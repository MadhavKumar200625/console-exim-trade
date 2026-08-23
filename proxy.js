import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/logout",
  "/_next",
  "/favicon.ico",
];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("console_session")?.value);

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublic(pathname) || pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/)) {
    return NextResponse.next();
  }

  if (!hasSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
