import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const correct = process.env.APP_PASSWORD!;

  if (!password || password !== correct) {
    return NextResponse.json({ error: "Fel lösenord" }, { status: 401 });
  }
  const { name, value, maxAge } = createSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
