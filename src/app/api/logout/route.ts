import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { clearCookie } from "@/lib/session";
import {
  getActiveVectorStoreId,
  setActiveVectorStoreId,
} from "@/lib/activeStore";
import { wipeStoreAndFiles } from "@/lib/vectorStoreHelpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.nextUrl.protocol === "https:";

  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie(isHttps));

  // Wipe current store (best-effort)
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const id = getActiveVectorStoreId();
  if (id) {
    try {
      await wipeStoreAndFiles(client, id);
    } catch {}
    setActiveVectorStoreId(null);
  }

  return res;
}
