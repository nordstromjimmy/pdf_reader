import { NextResponse } from "next/server";
import { clearCookie, COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const c = clearCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: c.value,
    maxAge: c.maxAge,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res;
}
