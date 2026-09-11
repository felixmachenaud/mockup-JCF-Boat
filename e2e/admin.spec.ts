import { expect, test, type APIRequestContext } from "@playwright/test";
import { DEFAULT_CONTENT } from "../src/lib/site-content";

const password = "e2e-admin-password";

async function login(request: APIRequestContext) {
  const res = await request.post("/api/admin/login", {
    data: { password },
  });
  expect(res.status(), await res.text()).toBe(200);
}

test.describe("admin login + CMS save", () => {
  test("refuse un mauvais mot de passe puis connecte via l'UI", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();

    await page.locator('form input[type="password"]').fill("mauvais");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Identifiants incorrects")).toBeVisible();

    await page.locator('form input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("heading", { name: "Panneau admin" })).toBeVisible();
  });

  test("POST /api/admin/save renvoie 409 si la version est périmée", async ({
    request,
  }) => {
    await login(request);

    const conflict = await request.post("/api/admin/save", {
      data: { expectedVersion: 999_999, content: DEFAULT_CONTENT },
    });
    expect(conflict.status()).toBe(409);
    const conflictBody = (await conflict.json()) as {
      currentVersion?: number;
      error?: string;
    };
    expect(conflictBody.error).toMatch(/Conflit/i);
    expect(conflictBody.currentVersion).toBeGreaterThanOrEqual(0);
  });
});
