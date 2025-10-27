import { NextResponse } from "next/server";
import { clearCookie, COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie());
  return res;
}
