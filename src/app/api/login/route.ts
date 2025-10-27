import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Fel lösenord" }, { status: 401 });
  }
  const cookie = createSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie);
  return res;
}
