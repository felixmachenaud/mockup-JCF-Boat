import { NextResponse } from "next/server";
import {
  assertContentLength,
  assertSameOrigin,
  genericServerError,
  getClientIp,
} from "@/lib/admin-request";
import {
  contactPayloadSchema,
  isBookingDateAllowed,
} from "@/lib/contact-schema";
import { formatMailRows, sendMail } from "@/lib/mail";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { verifyTurnstileToken } from "@/lib/turnstile";

const MAX_BODY_BYTES = 20_000;

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const lengthError = assertContentLength(req, MAX_BODY_BYTES);
  if (lengthError) return lengthError;

  pruneRateLimits();
  const ip = getClientIp(req);
  const limited = await rateLimit(`contact:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    logSecurityEvent("contact.blocked", { reason: "rate_limit", ip });
    return NextResponse.json(
      { error: "Trop de messages envoyés. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = contactPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Merci de vérifier les champs du formulaire." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot rempli → succès silencieux
  if (data.website) {
    logSecurityEvent("contact.blocked", { reason: "honeypot", ip });
    return NextResponse.json({ ok: true });
  }

  const captcha = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!captcha.ok) {
    logSecurityEvent("contact.blocked", { reason: "turnstile", ip });
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  // Per-email soft limit
  const emailKey = data.email.toLowerCase();
  const emailLimited = await rateLimit(`contact-email:${emailKey}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!emailLimited.ok) {
    logSecurityEvent("contact.blocked", { reason: "email_rate", ip });
    return NextResponse.json(
      { error: "Trop de messages pour cette adresse. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimited.retryAfterSec) },
      },
    );
  }

  if (data.type === "booking") {
    if (!isBookingDateAllowed(data.date)) {
      return NextResponse.json(
        { error: "La date de réservation doit être aujourd'hui ou ultérieure." },
        { status: 400 },
      );
    }
  }

  try {
    if (data.type === "message") {
      const rows: Array<[string, string]> = [
        ["Nom", data.name],
        ["Email", data.email],
        ["Téléphone", data.phone || "—"],
        ["Message", data.message],
      ];
      const { text, html } = formatMailRows(rows);
      await sendMail({
        subject: `[JCF Boat] Message de ${data.name}`,
        text,
        html,
        replyTo: data.email,
      });
    } else {
      const rows: Array<[string, string]> = [
        ["Nom", data.name],
        ["Email", data.email],
        ["Téléphone", data.phone || "—"],
        ["Bateau", data.boatName],
        ["Date", data.date],
        ["Créneau", data.period],
        ["Passagers", String(data.passengers)],
        ["Notes / informations", data.notes || "—"],
      ];
      const { text, html } = formatMailRows(rows);
      await sendMail({
        subject: `[JCF Boat] Réservation ${data.boatName} — ${data.date}`,
        text,
        html,
        replyTo: data.email,
      });
    }

    logSecurityEvent("contact.submit", { type: data.type, ip });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return genericServerError("[contact]", err);
  }
}
