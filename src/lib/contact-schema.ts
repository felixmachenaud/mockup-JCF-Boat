import { z } from "zod";

const baseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(40).default(""),
  website: z.string().default(""), // honeypot
  turnstileToken: z.string().max(2048).optional(),
});

export const messageSchema = baseSchema.extend({
  type: z.literal("message"),
  message: z.string().trim().min(10).max(3000),
});

export const bookingSchema = baseSchema.extend({
  type: z.literal("booking"),
  phone: z.string().trim().min(8).max(40),
  boatName: z.string().trim().min(2).max(120),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  period: z.string().trim().min(2).max(120),
  passengers: z.coerce.number().int().min(1).max(20),
  notes: z.string().trim().max(2000).default(""),
});

export const contactPayloadSchema = z.discriminatedUnion("type", [
  messageSchema,
  bookingSchema,
]);

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export function parisTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isBookingDateAllowed(date: string): boolean {
  return date >= parisTodayISO();
}
