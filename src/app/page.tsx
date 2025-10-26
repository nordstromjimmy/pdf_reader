"use client";
import { useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const data = new FormData(f);
    setBusy(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setAnswer(`Fel vid uppladdning: ${json.error || "okänt fel"}`);
        setBusy(false);
        return;
      }
      setAnswer("Filen uppladdad, ställ en fråga");
    } catch (err: any) {
      setAnswer(`Fel vid uppladdning: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function ask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget as any).question.value;
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAnswer(`Fel vid fråga: ${json.error || "okänt fel"}`);
        return;
      }
      setAnswer(json.answer);
    } catch (err: any) {
      setAnswer(`Fel vid fråga: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 grid grid-cols-1 items-center">
          <div /> {/* left spacer */}
          <h1 className="justify-start text-2xl font-semibold">
            PDF granskare
          </h1>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="justify-self-end px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 cursor-pointer"
          >
            Logga ut
          </button>
        </div>

        <form
          onSubmit={upload}
          className="p-4 bg-white rounded-2xl shadow mb-6 space-y-3"
        >
          <label className="block text-sm font-medium">Ladda upp PDF</label>
          <input
            name="pdf"
            type="file"
            accept="application/pdf"
            required
            className="block w-full rounded border p-2"
            disabled={busy}
          />
          <button
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer"
          >
            Ladda upp
          </button>
        </form>

        <form
          onSubmit={ask}
          className="p-4 bg-white rounded-2xl shadow space-y-3"
        >
          <label className="block text-sm font-medium">
            Ställ en fråga om filen
          </label>
          <input
            name="question"
            placeholder=""
            className="w-full rounded border p-2"
            disabled={busy}
          />
          <button
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer"
          >
            Fråga
          </button>
        </form>

        {busy && (
          <div className="mt-4 flex justify-center">
            <span
              className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-black animate-spin"
              aria-label="Laddar"
            />
          </div>
        )}

        {!busy && answer && (
          <pre className="mt-4 whitespace-pre-wrap bg-white p-4 rounded-2xl shadow">
            {answer}
          </pre>
        )}
      </div>
    </main>
  );
}
