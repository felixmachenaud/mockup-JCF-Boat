#!/usr/bin/env node
/**
 * Génère ADMIN_PASSWORD_HASH (scrypt) pour le CMS admin.
 * Usage: npm run hash-admin-password -- "votre-mot-de-passe"
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error("Usage: npm run hash-admin-password -- \"mot-de-passe-fort\"");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString(
  "hex",
);
const encoded = `scrypt$16384$8$1$${salt}$${hash}`;

console.log("\nAjoutez dans Vercel / .env :\n");
console.log(`ADMIN_PASSWORD_HASH=${encoded}`);
console.log("\nPuis retirez ADMIN_PASSWORD s'il est encore défini.\n");
