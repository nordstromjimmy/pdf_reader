import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySessionCookie, COOKIE_NAME } from "@/lib/session";

// Undanta login-sidan, login/logout-API, Next.js assets och favicon
const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/favicon.ico"];
function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  if (isPublic(req)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const ok = verifySessionCookie(token);
  if (ok) return NextResponse.next();

  // Skicka vidare till login med redirect
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"], // skydda allt utom undantagen ovan
};
