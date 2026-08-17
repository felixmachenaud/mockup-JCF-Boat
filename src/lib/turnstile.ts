/**
 * Cloudflare Turnstile verification (SEC-07).
 * When TURNSTILE_SECRET_KEY is unset, verification is skipped (dev / gradual rollout).
 * In production, set both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.
 */

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export function turnstileSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    // Preview/dev: allow without captcha. Production: fail closed (SEC-07).
    if (
      process.env.NODE_ENV === "production" &&
      process.env.VERCEL_ENV === "production"
    ) {
      console.error(
        "[turnstile] TURNSTILE_SECRET_KEY missing on production — rejecting submit",
      );
      return {
        ok: false,
        error: "Protection anti-spam non configurée. Réessayez plus tard.",
      };
    }
    return { ok: true };
  }

  if (!token || typeof token !== "string" || token.length > 2048) {
    return { ok: false, error: "Captcha manquant ou invalide" };
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip === "unknown" ? "" : ip,
    });
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      return { ok: false, error: "Captcha invalide — réessayez" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Vérification captcha indisponible" };
  }
}
