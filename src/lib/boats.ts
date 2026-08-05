import type { CmsBoat, CmsCalanque, CmsReview, CmsTeamMember } from "./site-content";
import { formatPrice } from "./utils";

function byOrder<T extends { displayOrder: number }>(a: T, b: T) {
  return a.displayOrder - b.displayOrder;
}

/** Photos empilées : image catalogue (.1) puis galerie (.2, .3…) */
export function boatPhotoStack(boat: CmsBoat): string[] {
  return [boat.image, ...boat.gallery.filter((g) => g !== boat.image)];
}

/** Prix le plus bas disponible (carte « à partir de ») */
export function boatFromPrice(boat: CmsBoat): number {
  const values = boat.pricingRows
    .flatMap((row) => [row.lowSeason, row.highSeason])
    .filter((n): n is number => typeof n === "number" && n > 0);
  if (values.length) return Math.min(...values);
  return boat.priceHalfDay || boat.pricePerDay || 0;
}

export function formatPriceCell(value: number | null): string {
  if (value == null) return "N/D";
  return formatPrice(value);
}

/** Bateaux publiés, triés pour catalogue & sitemap */
export function publishedBoats(boats: CmsBoat[]): CmsBoat[] {
  return boats.filter((b) => b.published).sort(byOrder);
}

/** Sélection homepage (featured + published) */
export function featuredBoats(boats: CmsBoat[]): CmsBoat[] {
  return publishedBoats(boats).filter((b) => b.featured);
}

export function boatBySlug(boats: CmsBoat[], slug: string): CmsBoat | undefined {
  return publishedBoats(boats).find((b) => b.slug === slug);
}

export function relatedBoats(boats: CmsBoat[], current: CmsBoat, limit = 3): CmsBoat[] {
  return publishedBoats(boats)
    .filter((b) => b.id !== current.id)
    .filter((b) => b.category === current.category || b.featured)
    .slice(0, limit);
}

export function boatsByIds(boats: CmsBoat[], ids: string[]): CmsBoat[] {
  if (!ids.length) return featuredBoats(boats).slice(0, 6);
  const map = new Map(publishedBoats(boats).map((b) => [b.id, b]));
  return ids.map((id) => map.get(id)).filter((b): b is CmsBoat => Boolean(b));
}

export function publishedReviews(items: CmsReview[]): CmsReview[] {
  return items.filter((r) => r.published).sort(byOrder);
}

export function publishedTeam(members: CmsTeamMember[]): CmsTeamMember[] {
  return members.filter((m) => m.published).sort(byOrder);
}

export function publishedCalanques(items: CmsCalanque[]): CmsCalanque[] {
  return items.filter((c) => c.published).sort(byOrder);
}
