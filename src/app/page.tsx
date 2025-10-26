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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            PDF&nbsp;<span className="text-slate-500">granskare</span>
          </h1>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:shadow-md hover:opacity-95 active:scale-[0.98] cursor-pointer"
          >
            <span>Logga ut</span>
          </button>
        </div>

        {/* Upload card */}
        <form
          onSubmit={upload}
          className="group mb-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ladda upp PDF
          </label>

          {/* Nicely styled input */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition group-hover:border-slate-300">
            <input
              name="pdf"
              type="file"
              accept="application/pdf"
              required
              disabled={busy}
              className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              <span>Ladda upp</span>
            </button>
          </div>
        </form>

        {/* Ask card */}
        <form
          onSubmit={ask}
          className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ställ en fråga om filen
          </label>
          <input
            name="question"
            placeholder="Skriv en fråga.."
            disabled={busy}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="mt-4 flex items-center justify-end">
            <button
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              <span>Fråga</span>
            </button>
          </div>
        </form>

        {/* Global spinner under cards (optional visual) */}
        {busy && (
          <div className="mt-6 flex justify-center">
            <span
              className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin"
              aria-label="Laddar"
            />
          </div>
        )}

        {/* Answer */}
        {!busy && answer && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-sm font-medium text-slate-500">Svar</div>
            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap leading-relaxed text-slate-800">
              {answer}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
