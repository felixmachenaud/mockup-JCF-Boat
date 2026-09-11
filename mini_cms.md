# mini_cms — CMS texte maison (réplicable)

> Document **portable**. Copie ce fichier à la racine de chaque nouveau projet client (`mini_cms.md`) pour que toi ou Cursor sachiez comment reconstruire le même panneau `/admin`.
>
> Origine : pattern validé sur **La Bastide · Carcassonne** (Next.js 16 + Vercel Blob).
> Objectif : le client édite les **textes** sans toucher au layout, sans Sanity / Payload / WordPress.

---

## 1. Ce que c’est

Un mini-CMS en 3 idées :

1. **Schéma TypeScript** (`SiteContent`) = tous les textes éditables.
2. **Defaults dans le code** + **surcharges JSON** dans Vercel Blob.
3. **UI `/admin`** protégée par un mot de passe unique.

**JCF Boat (prod)** : le mot de passe est stocké en **hash scrypt** (`ADMIN_PASSWORD_HASH`), les sessions vivent dans **Upstash Redis**, le cookie ne contient qu’un identifiant opaque (pas le HMAC du mot de passe).

Le site public lit toujours `getContent()` = `merge(defaults, blob)`.  
Si le Blob est vide ou partiel → le site reste intact grâce aux defaults.

---

## 2. Architecture

```
/admin (Editor + Login)
        │
        ▼
/api/admin/login | logout | save | upload
        │
        ▼
admin-auth.ts       ── cookie httpOnly `jcf_admin` (2 h)
admin-sessions.ts   ── Redis Upstash (prod) / JSON local (dev)
content-store.ts    ── Vercel Blob (prod) / JSON local (dev)
        │
        ▼
site-content.ts ── SiteContent + DEFAULT_CONTENT + mergeContent()
        │
        ▼
app/page.tsx + components ── props typées uniquement
```

Auth prod : `ADMIN_PASSWORD_HASH` + `AUTH_SECRET` (≥ 32) + Redis.  
`ADMIN_PASSWORD` en clair n’est accepté qu’en développement local.

### Fichiers à créer (checklist)

| Fichier | Rôle |
|---|---|
| `src/lib/admin-auth.ts` | `ADMIN_PASSWORD_HASH` (prod), cookie session, `checkAdminAuth` |
| `src/lib/admin-sessions.ts` | Store sessions Redis / JSON local, epoch de révocation |
| `src/lib/site-content.ts` | Type `SiteContent`, defaults, `mergeContent` |
| `src/lib/content-store.ts` | `getContent` / `saveContent` via `@vercel/blob` |
| `src/lib/content.ts` *(optionnel)* | Seed métier (photos, IDs tiers) non éditable ou partiellement |
| `src/app/admin/page.tsx` | Gate auth + charge le contenu |
| `src/app/admin/layout.tsx` | `robots: noindex` |
| `src/app/admin/LoginForm.tsx` | Formulaire mot de passe |
| `src/app/admin/LogoutButton.tsx` | Déconnexion |
| `src/app/admin/Editor.tsx` | Onglets + champs |
| `src/app/api/admin/login/route.ts` | POST → set cookie |
| `src/app/api/admin/logout/route.ts` | POST → clear cookie |
| `src/app/api/admin/save/route.ts` | POST → save blob + revalidate |

---

## 3. Variables d’environnement (Vercel)

```bash
# Auth admin — OBLIGATOIRE en production
ADMIN_PASSWORD_HASH=   # npm run hash-admin-password -- "mot-de-passe-fort"
AUTH_SECRET=           # openssl rand -base64 32 — jamais égal au mot de passe

# Interdit en production : ADMIN_PASSWORD (clair, local only)

# Sessions + rate-limit — OBLIGATOIRE en production
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Contenu CMS + médias
BLOB_READ_WRITE_TOKEN=   # auto si Storage → Blob attaché au projet
# ou BLOB_STORE_ID=      # stores Blob modernes (OIDC Vercel)
```

- Pas de `ADMIN_PASSWORD_HASH` en prod → `/admin` affiche « non configuré ».
- Pas de Redis en prod → login / sessions refusés (503).
- Pas de Blob en prod → l’éditeur s’ouvre éventuellement mais **Enregistrer** échoue (503).
- En local sans Blob / Redis : JSON dans `data/` (ou `JCF_DATA_DIR`).

---

## 4. Règles de conception (à respecter à chaque client)

### A. Zéro texte client-visible en dur dans le JSX

```tsx
// ❌ mauvais
<span>Rénové 12 / 2025</span>

// ✅ bon
<span>{property.imagePillRenovation}</span>
```

Si le client doit pouvoir le changer un jour → c’est dans `SiteContent`.

### B. Deux types de listes

| Type | Fusion | UI admin | Exemples |
|---|---|---|---|
| **Slots fixes** | `mergeByIndex` | Édition seule, pas d’ajout/suppression | Specs, badges, highlights (icône liée au slot) |
| **Listes libres** | `preferArray` / remplacement entier | `ArrayEditor` + / − | FAQ, avis, POI, équipements |

### C. Un champ admin = un rendu réel

Ne jamais créer un champ « Prénoms » dans l’admin s’il n’apparaît nulle part.  
Astuce footer : token `{{hosts}}` dans le blurb, remplacé au rendu par `hosts.firstNames`.

### D. Ne pas casser le layout

Brancher un champ = **remplacer la string**, garder les mêmes classes / structure.  
Le CMS édite le contenu, jamais l’organisation visuelle.

### E. Defaults = filet de sécurité

`DEFAULT_CONTENT` doit être complet et beau. Le Blob ne stocke que des overrides.  
Le site ne peut pas « se vider » si une sauvegarde est partielle.

---

## 5. Squelette `mergeContent` (à adapter)

```ts
export function mergeContent(overrides: Partial<SiteContent> | null): SiteContent {
  if (!overrides) return DEFAULT_CONTENT
  return {
    brand: { ...DEFAULT_CONTENT.brand, ...(overrides.brand ?? {}) },
    // slots fixes :
    hero: {
      ...DEFAULT_CONTENT.hero,
      ...(overrides.hero ?? {}),
      valueProp: mergeByIndex(
        DEFAULT_CONTENT.hero.valueProp,
        overrides.hero?.valueProp,
      ),
    },
    // listes libres :
    faq: preferArray(overrides.faq, DEFAULT_CONTENT.faq),
    // …
  }
}

function mergeByIndex<T extends object>(defaults: T[], overrides?: T[]): T[] {
  if (!Array.isArray(overrides)) return defaults
  return defaults.map((d, i) => ({ ...d, ...(overrides[i] ?? {}) }))
}

function preferArray<T>(candidate: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(candidate) && candidate.length > 0 ? candidate : fallback
}
```

---

## 6. Auth (résumé) — JCF Boat

- Un seul opérateur → un seul mot de passe.
- **Production** : `ADMIN_PASSWORD_HASH` (scrypt `N=16384`) généré par `npm run hash-admin-password`. `ADMIN_PASSWORD` est **refusé**.
- **Production** : `AUTH_SECRET` ≥ 32 caractères, distinct du mot de passe. Il poivre le digest Redis du token de session.
- Cookie `jcf_admin` : identifiant opaque `httpOnly` + `secure` (prod) + `sameSite: 'lax'`. Durée **2 heures**.
- Sessions : **Upstash Redis** en prod (`jcf-admin-session:…` + clé `epoch` pour tout révoquer). JSON `data/admin-sessions.json` en local.
- Comparaison mot de passe / hash avec `timingSafeEqual` (scrypt) ; fallback HMAC local si hash absent.
- Rate-limit login + formulaires : Redis en prod, mémoire en local. Sans Redis en prod → fail-closed.

---

## 7. Content store (résumé)

```ts
// Lecture : get(BLOB_KEY) → JSON → mergeContent
// Écriture : put(BLOB_KEY, JSON, { access: 'private', allowOverwrite: true })
// Après save : revalidateTag('site-content') + revalidatePath('/')
```

Clé Blob recommandée : `{slug-client}-site-content.json`  
Cache Next : `unstable_cache` + tag, invalidation immédiate à la sauvegarde.

---

## 8. Editor UI — pattern minimal

1. State local `content` initialisé avec `initialContent`.
2. `patch(key, partial)` pour les objets.
3. Onglets = zones métier (Hero, Services, FAQ, Contact, Footer…).
4. Composants réutilisables : `Field`, `Section`, `Slot` (fixe), `ArrayEditor` (libre).
5. Bouton **Enregistrer** → `POST /api/admin/save` avec le JSON complet.
6. Bonus utiles : Export JSON, bannière « Blob non connecté », sticky save.

Labels admin en **français**, et indiquer **où** le texte apparaît sur le site  
(ex. « Pastille gauche sur la photo appartement »).

---

## 9. Checklist nouveau site de service

```
[ ] Next.js App Router + Tailwind en place
[ ] npm i @vercel/blob
[ ] Copier / adapter admin-auth, content-store, site-content
[ ] Définir SiteContent selon les sections du site
[ ] Remplacer tous les textes visibles par des props
[ ] Brancher getContent() dans page.tsx (et layouts si besoin)
[ ] Builder Editor.tsx (1 onglet = 1 zone)
[ ] Routes API login / logout / save
[ ] Vercel : `ADMIN_PASSWORD_HASH` + `AUTH_SECRET` + Redis Upstash + Blob store
[ ] Smoke test : login → edit titre → save → hard refresh
[ ] (Optionnel) pages légales hors CMS : /mentions-legales, /cgv, /confidentialite
```

---

## 10. Périmètre typique

### Dans le CMS (oui)

- Titres, sous-titres, CTA, FAQ, avis, coordonnées
- Labels nav / footer
- Pastilles / badges texte sur photos
- Chiffres de confiance (m², minutes, dates)

### Hors CMS au départ (non, sauf demande)

- Photos / uploads
- Design, couleurs, grille, ordre des sections
- Config tierce (Beds24, Calendly, Stripe IDs…)
- Contenu juridique long (souvent pages dédiées)

---

## 11. Pièges fréquents

1. Éditer les **labels** mais laisser les **valeurs** en dur (`"15 min"`).
2. Champ admin qui ne s’affiche nulle part.
3. Oublier `revalidatePath('/')` après save → le client croit que ça n’a pas marché.
4. Blob privé : toujours passer par le SDK `get()`, pas `fetch(url)`.
5. Ajouter une dépendance CMS lourde « pour plus tard » — inutile si ce pattern suffit.

---

## 12. Prompt Cursor (à coller dans un nouveau projet)

```
Lis mini_cms.md à la racine. Implémente ce mini-CMS maison pour ce site :
- auth : ADMIN_PASSWORD_HASH (scrypt) en prod, ADMIN_PASSWORD seulement en local
- sessions Redis Upstash en prod (JSON local en dev)
- AUTH_SECRET ≥ 32, jamais égal au mot de passe
- SiteContent + defaults + mergeContent
- Vercel Blob content-store
- /admin Editor par onglets
- brancher tous les textes visibles (zéro hardcode client-facing)
Ne change pas le layout / l’organisation visuelle des sections.
```

---

## 13. Référence d’implémentation

Projet modèle : `carcassonne-bastide-t3`  
Fichiers clés : `src/lib/{admin-auth,admin-sessions,site-content,content-store}.ts`, `src/app/admin/`, `src/app/api/admin/`.

Skill Cursor (si installé) : `mini-cms-maison`.
