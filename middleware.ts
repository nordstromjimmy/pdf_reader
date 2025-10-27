import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = "pdfqa_auth";

// Public paths that should be reachable without auth
const PUBLIC_PATHS = new Set([
  "/login",
  "/api/login",
  "/api/logout",
  "/favicon.ico",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next.js assets & explicitly public routes
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/")
  ) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Auth-Guard", "public");
    return res;
  }

  // Edge-safe: only check if cookie exists (no Node crypto here)
  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);

  if (!hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Auth-Guard", "protected");
  return res;
}

// Cover everything except Next’s static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
