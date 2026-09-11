import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    extraHTTPHeaders: { origin: baseURL },
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Local: Chrome système. CI: Chromium Playwright (`npx playwright install`).
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
  ],
  webServer: {
    command: `npx next dev -p ${port} -H 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "development",
      ADMIN_PASSWORD: "e2e-admin-password",
      ADMIN_PASSWORD_HASH:
        "scrypt$16384$8$1$396d462e1f551468a519f7c3baefb426$978c89321de4604218c5c6e0422f20d2dd921ebbdc396228aca8260686832cf84f1ced713d83c051d022b8cbefdd894108d0d9e5c577208420cd1baa3242589c",
      AUTH_SECRET: "e2e-auth-secret-must-be-32-chars-min",
      SMTP_DRY_RUN: "1",
      SMTP_USER: "e2e@example.com",
      SMTP_PASS: "e2e-pass",
      CONTACT_TO: "e2e@example.com",
      JCF_DATA_DIR: ".e2e-data",
      TURNSTILE_SECRET_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      BLOB_READ_WRITE_TOKEN: "",
      BLOB_STORE_ID: "",
    },
  },
});
