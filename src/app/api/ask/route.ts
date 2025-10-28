import { getActiveVectorStoreId } from "@/lib/activeStore";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = "gpt-4.1-mini";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const vectorStoreId = getActiveVectorStoreId();
    if (!question)
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "Ingen fil uppladdad. Ladda upp en PDF först." },
        { status: 400 }
      );
    }

    const resp = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: "system",
          content:
            "Du är en hjälpsam assistent. Svara ALLTID på svenska. Använd endast information från de bifogade filerna. Var kortfattad och ge steg-för-steg när det passar. Om något saknas i underlaget, säg det tydligt.",
        },
        { role: "user", content: question },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
        } as any,
      ],
      max_output_tokens: 1200,
    });

    let answer = "";
    if (Array.isArray((resp as any).output)) {
      for (const item of (resp as any).output) {
        if (item.type === "output_text") {
          answer += item.text?.value ?? item.text ?? "";
        }
      }
    }
    // Fallback: messages/content shape
    if (!answer && Array.isArray((resp as any).output_text)) {
      answer = (resp as any).output_text.join("");
    }
    if (!answer && typeof (resp as any).output_text === "string") {
      answer = (resp as any).output_text;
    }

    return NextResponse.json({ answer: answer || "(no text in response)" });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Ask failed" },
      { status: 500 }
    );
  }
}
