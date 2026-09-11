# JCF Boat

Site Next.js de location de bateaux à Cassis (flotte, calanques, contact, mini-CMS `/admin`).

## Prérequis

- Node.js 22
- Compte Vercel (prod) + Blob store
- Upstash Redis (sessions admin + rate-limit en prod)
- SMTP (OVH / Zimbra) pour les formulaires
- Cloudflare Turnstile (anti-spam)

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Site : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin](http://localhost:3000/admin) — mot de passe démo `jcf-admin` si aucun secret n’est défini

## Variables d’environnement (production)

À renseigner dans Vercel **Production** (et Preview si besoin), puis **Redeploy**.

| Variable | Obligatoire prod | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | oui | Canonical, sitemap, CORS same-origin |
| `ADMIN_PASSWORD_HASH` | oui | Hash scrypt du mot de passe `/admin`. **Jamais** `ADMIN_PASSWORD` en prod |
| `AUTH_SECRET` | oui | ≥ 32 caractères, **distinct** du mot de passe. Pepper **HMAC-SHA256** du digest de session (clé Redis). N’est plus le secret d’un cookie dérivé du mot de passe |
| `UPSTASH_REDIS_REST_URL` | oui | Sessions admin + rate-limit |
| `UPSTASH_REDIS_REST_TOKEN` | oui | Idem |
| `BLOB_READ_WRITE_TOKEN` (ou `BLOB_STORE_ID`) | oui | JSON CMS + photos |
| `SMTP_USER` / `SMTP_PASS` | oui | Envoi contact / demande de réservation |
| `CONTACT_TO` | recommandé | Destinataire (défaut = `SMTP_USER`) |
| `TURNSTILE_SECRET_KEY` | oui | Vérif captcha côté serveur |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | oui | Widget captcha |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | carte | Carte des calanques |

Générer le hash admin :

```bash
npm run hash-admin-password -- "mot-de-passe-fort"
# coller ADMIN_PASSWORD_HASH=scrypt$... dans Vercel, retirer ADMIN_PASSWORD
```

Générer `AUTH_SECRET` :

```bash
openssl rand -base64 32
```

En local uniquement : `ADMIN_PASSWORD` en clair est accepté. Les sessions et le CMS tombent sur des JSON dans `data/` (ignoré par git). `JCF_DATA_DIR` permet de pointer un autre dossier (tests).

`SMTP_DRY_RUN=1` n’est autorisé **hors production** (e2e) : aucun mail n’est envoyé.

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build / serveur prod |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (Zod contact, auth, rate-limit, conflit CMS) |
| `npm run test:e2e` | Playwright (login admin, save 409, contact) |

La CI GitHub (`.github/workflows/ci.yml`) enchaîne audit, lint, types, tests unitaires, e2e, puis le build.

## CMS

Panneau `/admin` : textes, bateaux, avis, calanques. Détail du pattern et de l’auth Redis : [`mini_cms.md`](./mini_cms.md).
