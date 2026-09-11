import { describe, expect, it } from "vitest";
import {
  contactPayloadSchema,
  isBookingDateAllowed,
  parisTodayISO,
} from "@/lib/contact-schema";

const validMessage = {
  type: "message" as const,
  name: "Marie Dupont",
  email: "marie@example.com",
  phone: "0601020304",
  website: "",
  message: "Bonjour, je voudrais des infos sur la flotte.",
};

const validBooking = {
  type: "booking" as const,
  name: "Marie Dupont",
  email: "marie@example.com",
  phone: "0601020304",
  website: "",
  boatName: "MANA 23",
  date: "2099-06-15",
  period: "Journée",
  passengers: 4,
  notes: "",
};

describe("contactPayloadSchema", () => {
  it("accepte un message valide", () => {
    const parsed = contactPayloadSchema.safeParse(validMessage);
    expect(parsed.success).toBe(true);
  });

  it("accepte une demande de réservation valide", () => {
    const parsed = contactPayloadSchema.safeParse(validBooking);
    expect(parsed.success).toBe(true);
  });

  it("refuse un nom trop court", () => {
    const parsed = contactPayloadSchema.safeParse({
      ...validMessage,
      name: "A",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse un email invalide", () => {
    const parsed = contactPayloadSchema.safeParse({
      ...validMessage,
      email: "pas-un-email",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse un message trop court", () => {
    const parsed = contactPayloadSchema.safeParse({
      ...validMessage,
      message: "Hi",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse une date de booking mal formée", () => {
    const parsed = contactPayloadSchema.safeParse({
      ...validBooking,
      date: "15/06/2026",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse un booking sans téléphone assez long", () => {
    const parsed = contactPayloadSchema.safeParse({
      ...validBooking,
      phone: "12",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("isBookingDateAllowed", () => {
  it("accepte aujourd'hui (timezone Paris) et une date future", () => {
    expect(isBookingDateAllowed(parisTodayISO())).toBe(true);
    expect(isBookingDateAllowed("2099-01-01")).toBe(true);
  });

  it("refuse une date passée", () => {
    expect(isBookingDateAllowed("2020-01-01")).toBe(false);
  });
});
