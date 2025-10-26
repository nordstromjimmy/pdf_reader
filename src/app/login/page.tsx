"use client";
import { useState } from "react";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & {
      password: HTMLInputElement;
    };
    const password = form.password.value;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Inloggning misslyckades");
      setBusy(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    window.location.href = next;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-12 text-slate-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md space-y-4"
      >
        <input
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Ange lösenord"
          disabled={busy}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
        >
          {busy && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          <span>{busy ? "Loggar in…" : "Logga in"}</span>
        </button>

        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
