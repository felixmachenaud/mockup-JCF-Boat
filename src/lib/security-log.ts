/**
 * Structured security events — never log secrets or passwords.
 */
export type SecurityEvent =
  | "admin.login.success"
  | "admin.login.failure"
  | "admin.logout"
  | "admin.save"
  | "admin.upload"
  | "admin.auth.unconfigured"
  | "contact.submit"
  | "contact.blocked";

export function logSecurityEvent(
  event: SecurityEvent,
  meta: Record<string, string | number | boolean | undefined> = {},
): void {
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined) continue;
    if (/pass|secret|token|cookie/i.test(k)) continue;
    safe[k] = v;
  }
  console.info(
    JSON.stringify({
      type: "security",
      event,
      ts: new Date().toISOString(),
      ...safe,
    }),
  );
}
