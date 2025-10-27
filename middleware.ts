import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifySessionCookie, COOKIE_NAME } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/favicon.ico"];
function isPublic(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (PUBLIC_PATHS.includes(p)) return true;
  if (p.startsWith("/_next/")) return true;
  if (p.startsWith("/assets/")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  if (isPublic(req)) {
    const res = NextResponse.next();
    res.headers.set("X-Auth-Guard", "public");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const ok = verifySessionCookie(token);

  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Auth-Guard", "protected");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/:path*"] };
