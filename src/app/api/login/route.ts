import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, commonCookieAttrs } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Fel lösenord" }, { status: 401 });
  }

  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";

  const cookie = createSessionCookie(isHttps);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie);
  return res;
}
