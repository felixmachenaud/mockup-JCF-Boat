"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ demoHint }: { demoHint?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(j.error || "Connexion échouée");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50/60 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-sky-200 bg-white p-8 shadow-sm"
      >
        <p className="text-xs font-medium tracking-[0.2em] text-sky-600 uppercase">
          JCF Boat
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Administration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Accès réservé — gérez la flotte, les avis et les calanques.
        </p>

        {demoHint && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Mode démo : mot de passe <code className="font-mono">jcf-admin</code>
          </p>
        )}

        <label className="mt-6 block text-xs font-medium text-slate-600">
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            required
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-sky-500 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
