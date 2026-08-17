"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/turnstile-widget";

const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-sky-300/60 focus:ring-2 focus:ring-sky-400/30";

const labelClass = "mb-1.5 block text-xs font-medium tracking-wide text-white/65";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

export function ContactMessageForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onToken = useCallback((token: string | null) => setTurnstileToken(token), []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message",
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          message: String(fd.get("message") || ""),
          website: String(fd.get("website") || ""),
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Envoi impossible. Réessayez ou appelez-nous.");
        return;
      }

      form.reset();
      setTurnstileToken(null);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Envoi impossible. Réessayez ou appelez-nous.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium tracking-[0.2em] text-white/70 uppercase">
          Messagerie
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">Envoyez-nous un message</h3>
        <p className="mt-1 text-sm text-white/65">
          Décrivez votre projet — nous vous répondons rapidement par email ou téléphone.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Nom *
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="vous@email.fr"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          Téléphone
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={fieldClass}
          placeholder="06 …"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className={`${fieldClass} min-h-[7rem] resize-y rounded-2xl`}
          placeholder="Dates souhaitées, nombre de personnes, questions…"
        />
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
        aria-hidden="true"
      />

      {turnstileSiteKey ? (
        <TurnstileWidget siteKey={turnstileSiteKey} onToken={onToken} />
      ) : null}

      <p className="text-xs leading-relaxed text-white/50">
        Vos données servent uniquement à traiter votre demande (conservation ≤ 24 mois).
        Voir la{" "}
        <Link
          href="/politique-de-confidentialite"
          className="underline decoration-white/30 underline-offset-2 hover:text-white/80"
        >
          politique de confidentialité
        </Link>
        .
      </p>

      {status === "success" && (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Message envoyé. Nous vous recontactons rapidement.
        </p>
      )}
      {status === "error" && error && (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading" || (Boolean(turnstileSiteKey) && !turnstileToken)}
        className="w-full sm:w-auto"
      >
        {status === "loading" ? "Envoi…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
