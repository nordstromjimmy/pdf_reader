import { NextRequest, NextResponse } from "next/server";
import { clearCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";

  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie(isHttps)); // maxAge:0 + expires:past + same flags
  return res;
}
