import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertContentLength,
  assertSameOrigin,
  genericServerError,
  getClientIp,
} from "@/lib/admin-request";
import { formatMailRows, sendMail } from "@/lib/mail";
import { pruneRateLimits, rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 20_000;

const baseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).default(""),
  website: z.string().default(""), // honeypot
});

const messageSchema = baseSchema.extend({
  type: z.literal("message"),
  message: z.string().trim().min(10).max(3000),
});

const bookingSchema = baseSchema.extend({
  type: z.literal("booking"),
  phone: z.string().trim().min(8).max(40),
  boatName: z.string().trim().min(2).max(120),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  period: z.enum(["matinee", "apres-midi"]),
  passengers: z.coerce.number().int().min(1).max(20),
  notes: z.string().trim().max(2000).default(""),
});

const payloadSchema = z.discriminatedUnion("type", [messageSchema, bookingSchema]);

export async function POST(req: Request) {
  const originError = assertSameOrigin(req);
  if (originError) return originError;

  const lengthError = assertContentLength(req, MAX_BODY_BYTES);
  if (lengthError) return lengthError;

  pruneRateLimits();
  const ip = getClientIp(req);
  const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
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

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Merci de vérifier les champs du formulaire." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot rempli → succès silencieux
  if (data.website) {
    return NextResponse.json({ ok: true });
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
      const periodLabel = data.period === "matinee" ? "Matinée" : "Après-midi";
      const rows: Array<[string, string]> = [
        ["Nom", data.name],
        ["Email", data.email],
        ["Téléphone", data.phone || "—"],
        ["Bateau", data.boatName],
        ["Date", data.date],
        ["Créneau", periodLabel],
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    return genericServerError("[contact]", err);
  }
}
