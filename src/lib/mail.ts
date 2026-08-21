import nodemailer from "nodemailer";
import { readServerEnv } from "@/lib/server-env";

export type MailPayload = {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function requiredEnv(name: string): string {
  const value = readServerEnv(name);
  if (!value) throw new Error(`Variable d'environnement manquante: ${name}`);
  return value;
}

export function getMailConfig() {
  const host = readServerEnv("SMTP_HOST") || "ssl0.ovh.net";
  const port = Number(readServerEnv("SMTP_PORT") || "465");
  const secure =
    readServerEnv("SMTP_SECURE") === "false"
      ? false
      : port === 465 || readServerEnv("SMTP_SECURE") === "true";
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");
  const from = readServerEnv("SMTP_FROM") || user;
  const to = readServerEnv("CONTACT_TO") || user;

  return { host, port, secure, user, pass, from, to };
}

export async function sendMail(payload: MailPayload): Promise<void> {
  const config = getMailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `JCF Boat <${config.from}>`,
    to: config.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatMailRows(rows: Array<[string, string]>): {
  text: string;
  html: string;
} {
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;color:#0f172a">
      ${rows
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top">${escapeHtml(label)}</td>
          <td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td>
        </tr>`,
        )
        .join("")}
    </table>
  `;
  return { text, html };
}
