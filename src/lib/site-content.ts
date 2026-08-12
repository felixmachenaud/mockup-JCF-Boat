import { DEFAULT_FLEET } from "@/lib/default-fleet";
import { mockReviews } from "@/lib/mock-reviews";
import { calanques as seedCalanques } from "@/lib/calanques";

export type BoatCategory = "standard" | "sans-permis" | "electrique";

/** Ligne de tarif — null = non disponible */
export type CmsPriceRow = {
  id: string;
  label: string;
  lowSeason: number | null;
  highSeason: number | null;
};

export type CmsBoat = {
  id: string;
  slug: string;
  name: string;
  year: number;
  type: string;
  category: BoatCategory;
  capacity: number;
  /** Prix indicatif carte / SEO (journée haute saison typique) */
  pricePerDay: number;
  /** Prix indicatif demi-journée */
  priceHalfDay: number;
  location: string;
  rating: number;
  image: string;
  gallery: string[];
  available: boolean;
  published: boolean;
  featured: boolean;
  displayOrder: number;
  tags: string[];
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  length: string;
  motor: string;
  license: string;
  /** Équipements / confort à bord */
  features: string[];
  includedServices: string[];
  optionalServices: string[];
  pricingNote: string;
  lowSeasonLabel: string;
  highSeasonLabel: string;
  pricingRows: CmsPriceRow[];
};

export type CmsReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  category: BoatCategory;
  date: string;
  source: string;
  published: boolean;
  displayOrder: number;
};

export type CmsCalanque = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  images: string[];
  highlight: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  published: boolean;
  displayOrder: number;
};

export type CmsTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  published: boolean;
  displayOrder: number;
};

export type CmsHighlight = {
  id: string;
  title: string;
  text: string;
};

export type DestinationPageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  reasons: string[];
  practicalInfo: string;
  safetyInfo: string;
  ctaLabel: string;
  image: string;
  featuredBoatIds: string[];
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    secondaryCtaLabel: string;
  };
  presentation: {
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    highlights: CmsHighlight[];
  };
  fleet: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAllLabel: string;
  };
  destinations: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  team: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    image: string;
    members: CmsTeamMember[];
  };
  reviews: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    items: CmsReview[];
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    phone: string;
    phoneDisplay: string;
    email: string;
    address: string;
    hours: string;
    ctaCallLabel: string;
  };
  boats: CmsBoat[];
  calanques: CmsCalanque[];
  pages: {
    location: DestinationPageContent;
    calanques: DestinationPageContent;
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
    boatsTitle: string;
    boatsDescription: string;
  };
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const defaultBoats: CmsBoat[] = DEFAULT_FLEET;

const defaultReviews: CmsReview[] = mockReviews.map((r, i) => ({
  id: r.id,
  name: r.name,
  location: r.location,
  rating: r.rating,
  text: r.text
    .replace(/réservation (simple )?en ligne/gi, "accueil sur place")
    .replace(
      /La réservation en ligne m'a fait gagner du temps\./gi,
      "L'équipe nous a très bien accueillis sur place.",
    ),
  category: r.category,
  date: r.date,
  source: "Client",
  published: true,
  displayOrder: i,
}));

const defaultCalanques: CmsCalanque[] = seedCalanques.map((c, i) => ({
  ...c,
  slug: c.id,
  published: true,
  displayOrder: i,
}));

const defaultTeamMembers: CmsTeamMember[] = [
  {
    id: "member-1",
    name: "L'équipe JCF Boat",
    role: "Accueil & briefing",
    bio: "Basés au port de Cassis, nous vous accompagnons pour choisir le bateau et préparer votre sortie.",
    image: "/equipe.jpg",
    published: true,
    displayOrder: 0,
  },
];

const defaultLocationPage: DestinationPageContent = {
  eyebrow: "Location",
  title: "Location de bateau à Cassis",
  subtitle:
    "Partez du port de Cassis pour explorer les calanques — avec permis, sans permis ou électrique.",
  intro:
    "Cassis est la porte d'entrée idéale vers le Parc national des Calanques. Depuis le port, vous rejoignez en quelques minutes Port-Miou, Port-Pin ou En-Vau.",
  reasons: [
    "Accès direct aux plus belles calanques depuis le port",
    "Flotte adaptée à tous les niveaux (permis, sans permis, électrique)",
    "Briefing personnalisé et conseils d'itinéraire",
    "Réservation simple au port ou par téléphone",
  ],
  practicalInfo:
    "Départ depuis le Port de Cassis. Horaires d'accueil en saison : 8h – 20h. Prévoir pièce d'identité et, le cas échéant, permis côtier.",
  safetyInfo:
    "Respectez les zones réglementées du Parc national. Gilets à bord pour tous les passagers. Adaptez votre sortie à la météo du jour.",
  ctaLabel: "Nous contacter",
  image: "/mana23.1.jpg",
  featuredBoatIds: [],
  seoTitle: "Location de bateau à Cassis",
  seoDescription:
    "Location de bateau à Cassis pour visiter les calanques. Flotte premium, briefing inclus, réservation au port. Avec ou sans permis.",
  published: true,
};

const defaultCalanquesPage: DestinationPageContent = {
  eyebrow: "Destinations",
  title: "Calanques de Cassis en bateau",
  subtitle:
    "Port-Miou, Port-Pin, En-Vau… découvrez les criques emblématiques depuis la mer.",
  intro:
    "Les calanques entre Marseille et Cassis forment un paysage unique de falaises calcaires et d'eau turquoise. La location de bateau reste le moyen le plus libre pour les découvrir.",
  reasons: [
    "Accès privilégié aux criques difficiles à pied",
    "Itinéraires adaptés à votre niveau de navigation",
    "Pauses baignade dans des eaux limpides",
    "Vue imprenable sur les falaises depuis le large",
  ],
  practicalInfo:
    "Meilleure période : avril à octobre. Départ recommandé le matin pour profiter de la mer calme. Renseignez-vous sur les conditions météo avant de partir.",
  safetyInfo:
    "Restez à distance des falaises et des nageurs. Certaines zones sont interdites au mouillage. Suivez toujours le briefing JCF Boat.",
  ctaLabel: "Voir les bateaux",
  image: "/eoleII.1.jpg",
  featuredBoatIds: [],
  published: true,
  seoTitle: "Calanques de Cassis en bateau",
  seoDescription:
    "Découvrir les calanques de Cassis en bateau : Port-Miou, Port-Pin, En-Vau, Sormiou. Conseils pratiques et location avec JCF Boat.",
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: {
    name: "JCF Boat",
    tagline: "Location de bateaux à Cassis",
  },
  hero: {
    title: "Explorez la côte avec",
    subtitle: "Location de bateaux à Cassis — calanques, Méditerranée, briefing inclus.",
    ctaLabel: "Nous contacter",
    secondaryCtaLabel: "Voir les bateaux",
  },
  presentation: {
    eyebrow: "JCF Boat",
    title: "Une expérience locale, simple et sûre",
    text: "Entreprise familiale basée au port de Cassis, nous proposons une flotte soignée pour explorer les calanques en toute confiance — avec ou sans permis.",
    image: "/equipe.jpg",
    highlights: [
      {
        id: "h1",
        title: "Briefing inclus",
        text: "Sécurité, itinéraire et conseils météo avant chaque départ.",
      },
      {
        id: "h2",
        title: "Flotte premium",
        text: "Day cruisers, RIB, sans permis et électriques.",
      },
      {
        id: "h3",
        title: "Experts locaux",
        text: "On connaît chaque crique entre Cassis et Marseille.",
      },
    ],
  },
  fleet: {
    eyebrow: "Les bateaux",
    title: "Une sélection pour votre sortie",
    subtitle: "Quelques bateaux mis en avant — toute la flotte est disponible sur catalogue.",
    viewAllLabel: "Voir tous les bateaux",
  },
  destinations: {
    eyebrow: "Destinations",
    title: "Cassis & les Calanques",
    subtitle: "Deux pages pour préparer votre journée en mer.",
  },
  team: {
    eyebrow: "Notre équipe",
    title: "Des passionnés de la mer à votre service",
    subtitle:
      "Accueil sur place au port de Cassis, conseils d'itinéraire et briefing personnalisé.",
    ctaLabel: "Nous contacter",
    image: "/equipe.jpg",
    members: defaultTeamMembers,
  },
  reviews: {
    eyebrow: "Avis clients",
    title: "Ils ont pris le large avec nous",
    subtitle: "Retours authentiques de navigateurs partis découvrir les calanques.",
    ctaLabel: "Nous contacter",
    items: defaultReviews,
  },
  contact: {
    eyebrow: "Contact",
    title: "Prêt à prendre le large ?",
    subtitle:
      "Réservation sur place, par téléphone ou via le formulaire. Notre équipe vous répond 7j/7 pour organiser votre journée en mer à Cassis.",
    phone: "0675742581",
    phoneDisplay: "06 75 74 25 81",
    email: "contact@jcfboat.fr",
    address: "Port de Cassis, 13260",
    hours: "8h – 20h · Avril à Octobre",
    ctaCallLabel: "Appeler",
  },
  boats: defaultBoats,
  calanques: defaultCalanques,
  pages: {
    location: defaultLocationPage,
    calanques: defaultCalanquesPage,
  },
  seo: {
    homeTitle: "Location de bateaux à Cassis",
    homeDescription:
      "Louez un bateau à Cassis avec JCF Boat : flotte avec permis, sans permis et électrique. Explorez les calanques, contactez-nous pour réserver sur place.",
    boatsTitle: "Notre flotte de bateaux à Cassis",
    boatsDescription:
      "Découvrez tous les bateaux JCF Boat à Cassis : day cruisers, RIB, sans permis et électriques. Tarifs à la journée et demi-journée.",
  },
};

/* ——— Migration / merge ——— */

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function strArr(v: unknown, fallback: string[] = []): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : fallback;
}

/** ASCII-safe public paths (évite 404 Linux/Vercel sur filenames accentués NFD/NFC). */
function publicImagePath(v: unknown, fallback: string): string {
  const raw = str(v, fallback);
  const ascii = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/\/equipe\.jpg$/i.test(ascii)) return "/equipe.jpg";
  return raw;
}

function nullablePrice(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v < 0 ? null : v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n < 0 ? null : n;
  }
  return null;
}

function normalizePriceRow(raw: unknown, index: number): CmsPriceRow {
  const r = asRecord(raw);
  return {
    id: str(r.id, `r${index + 1}`),
    label: str(r.label, ""),
    lowSeason: nullablePrice(r.lowSeason),
    highSeason: nullablePrice(r.highSeason),
  };
}

function normalizeBoat(raw: unknown, index: number): CmsBoat {
  const r = asRecord(raw);
  const idHint = typeof r.id === "string" ? r.id : "";
  const base =
    DEFAULT_CONTENT.boats.find((b) => b.id === idHint) ??
    DEFAULT_CONTENT.boats[index] ??
    emptyBoat();
  const description = str(r.description, base.description);
  const pricingRowsRaw = Array.isArray(r.pricingRows) ? r.pricingRows : null;
  return {
    id: str(r.id, base.id),
    slug: str(r.slug, base.slug),
    name: str(r.name, base.name),
    year: num(r.year, base.year),
    type: str(r.type, base.type),
    category: (str(r.category, base.category) as BoatCategory) || base.category,
    capacity: num(r.capacity, base.capacity),
    pricePerDay: num(r.pricePerDay, base.pricePerDay),
    priceHalfDay: num(r.priceHalfDay, base.priceHalfDay),
    location: str(r.location, base.location),
    rating: num(r.rating, base.rating),
    image: str(r.image, base.image),
    gallery: strArr(r.gallery, base.gallery),
    available: bool(r.available, base.available),
    published: bool(r.published, true),
    featured: bool(r.featured, index < 4),
    displayOrder: num(r.displayOrder, index),
    tags: strArr(r.tags, base.tags),
    shortDescription: str(r.shortDescription, description.slice(0, 160)),
    description,
    seoTitle: str(r.seoTitle, ""),
    seoDescription: str(r.seoDescription, ""),
    length: str(r.length, base.length),
    motor: str(r.motor, base.motor),
    license: str(r.license, base.license),
    features: strArr(r.features, base.features),
    includedServices: strArr(r.includedServices, base.includedServices),
    optionalServices: strArr(r.optionalServices, base.optionalServices),
    pricingNote: str(r.pricingNote, base.pricingNote),
    lowSeasonLabel: str(r.lowSeasonLabel, base.lowSeasonLabel),
    highSeasonLabel: str(r.highSeasonLabel, base.highSeasonLabel),
    pricingRows: pricingRowsRaw
      ? pricingRowsRaw.map(normalizePriceRow)
      : structuredClone(base.pricingRows),
  };
}

function normalizeReview(raw: unknown, index: number): CmsReview {
  const r = asRecord(raw);
  const base = DEFAULT_CONTENT.reviews.items[index] ?? emptyReview();
  return {
    id: str(r.id, base.id),
    name: str(r.name, base.name),
    location: str(r.location, base.location),
    rating: num(r.rating, base.rating),
    text: str(r.text, base.text),
    category: (str(r.category, base.category) as BoatCategory) || base.category,
    date: str(r.date, base.date),
    source: str(r.source, "Client"),
    published: bool(r.published, true),
    displayOrder: num(r.displayOrder, index),
  };
}

function normalizeCalanque(raw: unknown, index: number): CmsCalanque {
  const r = asRecord(raw);
  const base = DEFAULT_CONTENT.calanques[index] ?? emptyCalanque();
  return {
    id: str(r.id, base.id),
    slug: str(r.slug, base.slug),
    name: str(r.name, base.name),
    subtitle: str(r.subtitle, base.subtitle),
    description: str(r.description, base.description),
    images: strArr(r.images, base.images),
    highlight: str(r.highlight, base.highlight),
    lat: num(r.lat, base.lat),
    lng: num(r.lng, base.lng),
    mapsUrl: str(r.mapsUrl, base.mapsUrl),
    published: bool(r.published, true),
    displayOrder: num(r.displayOrder, index),
  };
}

function normalizeMember(raw: unknown, index: number): CmsTeamMember {
  const r = asRecord(raw);
  const base = DEFAULT_CONTENT.team.members[index] ?? emptyTeamMember();
  return {
    id: str(r.id, base.id),
    name: str(r.name, base.name),
    role: str(r.role, base.role),
    bio: str(r.bio, base.bio),
    image: publicImagePath(r.image, base.image),
    published: bool(r.published, true),
    displayOrder: num(r.displayOrder, index),
  };
}

function normalizeHighlight(raw: unknown, index: number): CmsHighlight {
  const r = asRecord(raw);
  const base = DEFAULT_CONTENT.presentation.highlights[index] ?? {
    id: `h-${index}`,
    title: "",
    text: "",
  };
  return {
    id: str(r.id, base.id),
    title: str(r.title, base.title),
    text: str(r.text, base.text),
  };
}

function normalizeDestinationPage(
  raw: unknown,
  fallback: DestinationPageContent,
  legacy?: { title?: string; description?: string; eyebrow?: string; subtitle?: string },
): DestinationPageContent {
  const r = asRecord(raw);
  return {
    eyebrow: str(r.eyebrow, legacy?.eyebrow ?? fallback.eyebrow),
    title: str(r.title, legacy?.title ?? fallback.title),
    subtitle: str(r.subtitle, legacy?.subtitle ?? fallback.subtitle),
    intro: str(r.intro, fallback.intro),
    reasons: strArr(r.reasons, fallback.reasons),
    practicalInfo: str(r.practicalInfo, fallback.practicalInfo),
    safetyInfo: str(r.safetyInfo, fallback.safetyInfo),
    ctaLabel: str(r.ctaLabel, fallback.ctaLabel),
    image: publicImagePath(r.image, fallback.image),
    featuredBoatIds: strArr(r.featuredBoatIds, fallback.featuredBoatIds),
    seoTitle: str(r.seoTitle, legacy?.title ?? fallback.seoTitle),
    seoDescription: str(
      r.seoDescription,
      legacy?.description ?? fallback.seoDescription,
    ),
    published: bool(r.published, true),
  };
}

export function mergeContent(
  overrides: Partial<SiteContent> | null | undefined,
): SiteContent {
  if (!overrides) return structuredClone(DEFAULT_CONTENT);

  const o = overrides as Partial<SiteContent> & {
    cassis?: { eyebrow?: string; title?: string; subtitle?: string };
    seo?: Partial<SiteContent["seo"]> & {
      pillarTitle?: string;
      pillarDescription?: string;
      cassisTitle?: string;
      cassisDescription?: string;
      guideTitle?: string;
      guideDescription?: string;
    };
  };

  const boatsRaw = Array.isArray(o.boats) && o.boats.length > 0 ? o.boats : DEFAULT_CONTENT.boats;
  const reviewsRaw =
    Array.isArray(o.reviews?.items) ? o.reviews!.items : DEFAULT_CONTENT.reviews.items;
  const calanquesRaw =
    Array.isArray(o.calanques) && o.calanques.length > 0
      ? o.calanques
      : DEFAULT_CONTENT.calanques;
  const membersRaw = Array.isArray(o.team?.members)
    ? o.team!.members
    : DEFAULT_CONTENT.team.members;
  const highlightsRaw = Array.isArray(o.presentation?.highlights)
    ? o.presentation!.highlights
    : DEFAULT_CONTENT.presentation.highlights;

  const pagesRaw = asRecord(o.pages);

  return {
    brand: { ...DEFAULT_CONTENT.brand, ...(o.brand ?? {}) },
    hero: { ...DEFAULT_CONTENT.hero, ...(o.hero ?? {}) },
    presentation: {
      ...DEFAULT_CONTENT.presentation,
      ...(o.presentation ?? {}),
      image: publicImagePath(
        o.presentation?.image,
        DEFAULT_CONTENT.presentation.image,
      ),
      highlights: highlightsRaw.map(normalizeHighlight),
    },
    fleet: { ...DEFAULT_CONTENT.fleet, ...(o.fleet ?? {}) },
    destinations: { ...DEFAULT_CONTENT.destinations, ...(o.destinations ?? {}) },
    team: {
      ...DEFAULT_CONTENT.team,
      ...(o.team ?? {}),
      image: publicImagePath(o.team?.image, DEFAULT_CONTENT.team.image),
      members: membersRaw.map(normalizeMember),
    },
    reviews: {
      ...DEFAULT_CONTENT.reviews,
      ...(o.reviews ?? {}),
      items: reviewsRaw.map(normalizeReview),
    },
    contact: { ...DEFAULT_CONTENT.contact, ...(o.contact ?? {}) },
    boats: boatsRaw.map(normalizeBoat),
    calanques: calanquesRaw.map(normalizeCalanque),
    pages: {
      location: normalizeDestinationPage(
        pagesRaw.location,
        DEFAULT_CONTENT.pages.location,
        {
          title: o.seo?.pillarTitle,
          description: o.seo?.pillarDescription,
        },
      ),
      calanques: normalizeDestinationPage(
        pagesRaw.calanques,
        DEFAULT_CONTENT.pages.calanques,
        {
          eyebrow: o.cassis?.eyebrow,
          title: o.seo?.cassisTitle ?? o.cassis?.title,
          subtitle: o.cassis?.subtitle,
          description: o.seo?.cassisDescription ?? o.seo?.guideDescription,
        },
      ),
    },
    seo: {
      homeTitle: str(o.seo?.homeTitle, DEFAULT_CONTENT.seo.homeTitle),
      homeDescription: str(o.seo?.homeDescription, DEFAULT_CONTENT.seo.homeDescription),
      boatsTitle: str(o.seo?.boatsTitle, DEFAULT_CONTENT.seo.boatsTitle),
      boatsDescription: str(o.seo?.boatsDescription, DEFAULT_CONTENT.seo.boatsDescription),
    },
  };
}

export function emptyBoat(): CmsBoat {
  return {
    id: `boat-${Date.now()}`,
    slug: "nouveau-bateau",
    name: "Nouveau bateau",
    year: new Date().getFullYear(),
    type: "Coque rigide",
    category: "standard",
    capacity: 6,
    pricePerDay: 400,
    priceHalfDay: 250,
    location: "Port de Cassis",
    rating: 5,
    image: "/mana23.1.jpg",
    gallery: [],
    available: true,
    published: true,
    featured: false,
    displayOrder: 99,
    tags: [],
    shortDescription: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    length: "",
    motor: "",
    license: "Permis côtier requis",
    features: [],
    includedServices: [],
    optionalServices: [],
    pricingNote: "Tarifs hors carburant",
    lowSeasonLabel: "Basse saison · 16 sept. – 14 juin",
    highSeasonLabel: "Haute saison · 15 juin – 15 sept.",
    pricingRows: [
      { id: "r1", label: "9h – 13h", lowSeason: 250, highSeason: 300 },
      { id: "r2", label: "9h – 16h", lowSeason: 350, highSeason: 450 },
      { id: "r3", label: "14h – 19h", lowSeason: 300, highSeason: 380 },
      { id: "r4", label: "17h – 20h", lowSeason: null, highSeason: 260 },
    ],
  };
}

export function emptyReview(): CmsReview {
  return {
    id: `review-${Date.now()}`,
    name: "",
    location: "",
    rating: 5,
    text: "",
    category: "standard",
    date: "",
    source: "Client",
    published: true,
    displayOrder: 99,
  };
}

export function emptyCalanque(): CmsCalanque {
  return {
    id: `calanque-${Date.now()}`,
    slug: "nouvelle-calanque",
    name: "Nouvelle calanque",
    subtitle: "",
    description: "",
    images: [],
    highlight: "",
    lat: 43.21,
    lng: 5.5,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cassis",
    published: true,
    displayOrder: 99,
  };
}

export function emptyTeamMember(): CmsTeamMember {
  return {
    id: `member-${Date.now()}`,
    name: "",
    role: "",
    bio: "",
    image: "/equipe.jpg",
    published: true,
    displayOrder: 99,
  };
}

export { slugify };
