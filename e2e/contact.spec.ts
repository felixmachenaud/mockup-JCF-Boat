import { expect, test } from "@playwright/test";

test.describe("POST /api/contact", () => {
  test("refuse une origine étrangère", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: {
        origin: "https://evil.example",
        "x-forwarded-for": "203.0.113.10",
      },
      data: {
        type: "message",
        name: "Marie Dupont",
        email: "marie@example.com",
        message: "Bonjour, je voudrais des informations.",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("refuse un payload invalide", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.11" },
      data: { type: "message", name: "A", email: "bad", message: "x" },
    });
    expect(res.status()).toBe(400);
  });

  test("accepte le honeypot sans envoyer de mail", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.12" },
      data: {
        type: "message",
        name: "Bot Spam",
        email: "bot@example.com",
        website: "http://spam.test",
        message: "Ceci est un message de spam assez long.",
      },
    });
    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  test("refuse une date de réservation passée", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.13" },
      data: {
        type: "booking",
        name: "Marie Dupont",
        email: "marie@example.com",
        phone: "0601020304",
        boatName: "MANA 23",
        date: "2020-01-01",
        period: "Journée",
        passengers: 4,
        notes: "",
      },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/date/i);
  });

  test("envoie une demande de message (SMTP dry-run)", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": "203.0.113.14" },
      data: {
        type: "message",
        name: "Marie Dupont",
        email: "marie@example.com",
        phone: "0601020304",
        website: "",
        message: "Bonjour, je voudrais des informations sur la location.",
      },
    });
    expect(res.status(), await res.text()).toBe(200);
  });
});

test("le formulaire homepage contact aboutit", async ({ page }) => {
  await page.goto("/#contact");
  await page.locator("#contact-name").fill("Marie Dupont");
  await page.locator("#contact-email").fill("e2e-home@example.com");
  await page.locator("#contact-message").fill(
    "Bonjour, je voudrais des informations sur la location à Cassis.",
  );
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(
    page.getByText("Message envoyé. Nous vous recontactons rapidement."),
  ).toBeVisible();
});
