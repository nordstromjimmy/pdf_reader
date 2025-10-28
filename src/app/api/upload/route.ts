import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, basename } from "path";
import {
  getActiveVectorStoreId,
  setActiveVectorStoreId,
} from "@/lib/activeStore";
import { wipeStoreAndFiles } from "@/lib/vectorStoreHelpers";

export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function safeName(name?: string) {
  return (name ? basename(name) : "doc.pdf").replace(/[^\w.\-]/g, "_");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("pdf") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1) Remove any previous store (so only this PDF is searchable)
    const oldId = getActiveVectorStoreId();
    if (oldId) {
      try {
        await wipeStoreAndFiles(client, oldId);
      } catch {}
      setActiveVectorStoreId(null);
    }

    // 2) Create a fresh store
    const vs = await client.vectorStores.create({ name: "pdf-qa-single" });
    setActiveVectorStoreId(vs.id);

    // 3) Save to tmp and upload
    const dir = await mkdtemp(join(tmpdir(), "upload-"));
    const tmpPath = join(dir, safeName(file.name));
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpPath, buf);

    const uploaded = await client.files.create({
      file: fs.createReadStream(tmpPath) as any,
      purpose: "assistants",
    });

    // 4) Attach and index
    const batch = await client.vectorStores.fileBatches.createAndPoll(vs.id, {
      file_ids: [uploaded.id],
    });

    return NextResponse.json({
      status: batch.status,
      vectorStoreId: vs.id,
      fileId: uploaded.id,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Upload failed" },
      { status: 500 }
    );
  }
}
