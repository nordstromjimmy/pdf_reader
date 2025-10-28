import type OpenAI from "openai";

export async function deleteVectorStoreCompat(client: any, id: string) {
  const vs = (client as any).vectorStores;
  if (!vs) throw new Error("vectorStores API missing");
  if (typeof vs.del === "function") return vs.del(id);
  if (typeof vs.delete === "function") return vs.delete(id);
  if (typeof (vs as any)["delete"] === "function")
    return (vs as any)["delete"](id);
  throw new Error("This SDK version has no vectorStores.delete/del");
}

export async function wipeStoreAndFiles(client: any, vectorStoreId: string) {
  try {
    // Detach and delete files
    const files = await client.vectorStores.files.list(vectorStoreId, {
      limit: 100,
    });
    for (const f of files.data ?? []) {
      try {
        await client.vectorStores.files.del(vectorStoreId, f.id);
      } catch {}
      try {
        await client.files.del(f.id);
      } catch {}
    }
  } catch {
    // best-effort
  }
  try {
    await deleteVectorStoreCompat(client, vectorStoreId);
  } catch {
    // best-effort
  }
}
