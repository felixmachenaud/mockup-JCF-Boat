import { z } from "zod";
import type { SiteContent } from "./site-content";

const str = (max: number) => z.string().max(max);
const short = str(200);
const medium = str(500);
const long = str(8000);
const urlOrPath = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      v === "" ||
      v.startsWith("/") ||
      v.startsWith("https://") ||
      v.startsWith("http://"),
    { message: "URL invalide (chemin relatif ou http(s) requis)" },
  );

const httpsUrl = z
  .string()
  .max(2000)
  .refine(
    (v) => v === "" || v.startsWith("https://") || v.startsWith("http://"),
    { message: "URL http(s) requise" },
  );

const boatCategory = z.enum(["standard", "sans-permis", "electrique"]);

const cmsPriceRowSchema = z
  .object({
    id: short,
    label: short,
    lowSeason: z.number().min(0).max(100_000).nullable(),
    highSeason: z.number().min(0).max(100_000).nullable(),
  })
  .strict();

const cmsBoatSchema = z
  .object({
    id: short,
    slug: short,
    name: medium,
    year: z.number().int().min(1950).max(2100),
    type: short,
    category: boatCategory,
    capacity: z.number().int().min(1).max(50),
    pricePerDay: z.number().min(0).max(100_000),
    priceHalfDay: z.number().min(0).max(100_000),
    location: short,
    rating: z.number().min(0).max(5),
    image: urlOrPath,
    gallery: z.array(urlOrPath).max(30),
    available: z.boolean(),
    published: z.boolean(),
    featured: z.boolean(),
    displayOrder: z.number().int().min(0).max(10_000),
    tags: z.array(short).max(40),
    shortDescription: medium,
    description: long,
    seoTitle: medium,
    seoDescription: long,
    length: short,
    motor: short,
    license: short,
    features: z.array(medium).max(40),
    includedServices: z.array(medium).max(40),
    optionalServices: z.array(medium).max(40),
    pricingNote: medium,
    lowSeasonLabel: medium,
    highSeasonLabel: medium,
    pricingRows: z.array(cmsPriceRowSchema).max(20),
  })
  .strict()
  .superRefine((boat, ctx) => {
    if (!boat.slug.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Slug URL requis",
        path: ["slug"],
      });
    }
    if (boat.published && !boat.image.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Photo principale requise pour un bateau publié",
        path: ["image"],
      });
    }
  });

const cmsReviewSchema = z
  .object({
    id: short,
    name: short,
    location: short,
    rating: z.number().min(0).max(5),
    text: long,
    category: boatCategory,
    date: short,
    source: short,
    published: z.boolean(),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

const cmsCalanqueSchema = z
  .object({
    id: short,
    slug: short,
    name: medium,
    subtitle: medium,
    description: long,
    images: z.array(urlOrPath).max(20),
    highlight: medium,
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    mapsUrl: httpsUrl,
    published: z.boolean(),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict()
  .superRefine((item, ctx) => {
    if (!item.slug.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Slug requis",
        path: ["slug"],
      });
    }
    if (item.published && item.images.filter((src) => src.trim()).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Au moins une photo est requise pour une calanque publiée",
        path: ["images"],
      });
    }
  });

const cmsTeamMemberSchema = z
  .object({
    id: short,
    name: short,
    role: short,
    bio: long,
    image: urlOrPath,
    published: z.boolean(),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

const highlightSchema = z
  .object({
    id: short,
    title: medium,
    text: long,
  })
  .strict();

const destinationPageSchema = z
  .object({
    eyebrow: short,
    title: medium,
    subtitle: long,
    intro: long,
    reasons: z.array(medium).max(20),
    practicalInfo: long,
    safetyInfo: long,
    ctaLabel: short,
    image: urlOrPath,
    featuredBoatIds: z.array(short).max(50),
    seoTitle: medium,
    seoDescription: long,
    published: z.boolean(),
  })
  .strict();

export const siteContentSchema: z.ZodType<SiteContent> = z
  .object({
    brand: z.object({ name: medium, tagline: medium }).strict(),
    hero: z
      .object({
        title: medium,
        subtitle: long,
        ctaLabel: short,
        secondaryCtaLabel: short,
      })
      .strict(),
    presentation: z
      .object({
        eyebrow: short,
        title: medium,
        text: long,
        image: urlOrPath,
        highlights: z.array(highlightSchema).max(12),
      })
      .strict(),
    fleet: z
      .object({
        eyebrow: short,
        title: medium,
        subtitle: long,
        viewAllLabel: short,
      })
      .strict(),
    destinations: z
      .object({
        eyebrow: short,
        title: medium,
        subtitle: long,
      })
      .strict(),
    team: z
      .object({
        eyebrow: short,
        title: medium,
        subtitle: long,
        ctaLabel: short,
        image: urlOrPath,
        members: z.array(cmsTeamMemberSchema).max(30),
      })
      .strict(),
    reviews: z
      .object({
        eyebrow: short,
        title: medium,
        subtitle: long,
        ctaLabel: short,
        items: z.array(cmsReviewSchema).max(200),
      })
      .strict(),
    contact: z
      .object({
        eyebrow: short,
        title: medium,
        subtitle: long,
        phone: short,
        phoneDisplay: short,
        email: z.string().email().max(200),
        address: medium,
        hours: medium,
        ctaCallLabel: short,
      })
      .strict(),
    boats: z.array(cmsBoatSchema).max(100),
    calanques: z.array(cmsCalanqueSchema).max(50),
    pages: z
      .object({
        location: destinationPageSchema,
        calanques: destinationPageSchema,
      })
      .strict(),
    seo: z
      .object({
        homeTitle: medium,
        homeDescription: long,
        boatsTitle: medium,
        boatsDescription: long,
      })
      .strict(),
  })
  .strict();

export function parseSiteContent(
  input: unknown,
): { ok: true; data: SiteContent } | { ok: false; error: string } {
  const result = siteContentSchema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path?.join(".") || "body";
    const message = first?.message || "Données invalides";
    return { ok: false, error: `Validation : ${path} — ${message}` };
  }
  return { ok: true, data: result.data };
}
