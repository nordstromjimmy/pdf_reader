// app/api/upload/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultHeaders: { "OpenAI-Beta": "assistants=v2" },
});

async function getOrCreateVectorStore() {
  const existing = process.env.VECTOR_STORE_ID;
  if (existing) return existing;
  const vs = await client.vectorStores.create({ name: "pdf-qa-store" });
  return vs.id;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("pdf") as File | null;
  if (!file)
    return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

  const vectorStoreId = await getOrCreateVectorStore();

  // 1) Upload the web File directly (no fs, no tmp paths)
  const uploaded = await client.files.create({
    file,
    purpose: "assistants",
  });

  // 2) Create + poll a batch
  const batch = await client.vectorStores.fileBatches.createAndPoll(
    vectorStoreId,
    { file_ids: [uploaded.id] }
  );

  return new Response(
    JSON.stringify({
      status: batch.status,
      vectorStoreId,
      fileId: uploaded.id,
    }),
    { headers: { "content-type": "application/json" } }
  );
}
