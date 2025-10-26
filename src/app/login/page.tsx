"use client";
import { useState } from "react";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form as any).password.value;
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-2xl shadow space-y-4"
      >
        <div>
          <input
            name="password"
            type="password"
            className="w-full text-black rounded border p-2"
            placeholder="Ange lösenord"
            disabled={busy}
            required
          />
        </div>
        <button
          disabled={busy}
          className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer"
        >
          {busy ? "Loggar in…" : "Logga in"}
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
