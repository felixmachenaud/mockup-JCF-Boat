import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { SiteContent } from "@/lib/site-content";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const BUSINESS_ID = `${SITE_URL}/#localbusiness`;

export function buildOrganizationGraph(content: SiteContent) {
  const logo = `${SITE_URL}/logo_transparent.png`;
  const image = `${SITE_URL}/mana23.1.jpg`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: content.brand.name,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: logo,
        },
        image,
        email: content.contact.email,
        telephone: content.contact.phone,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        description: content.seo.homeDescription,
        publisher: { "@id": ORG_ID },
        inLanguage: "fr-FR",
      },
      {
        "@type": ["BoatRental", "LocalBusiness"],
        "@id": BUSINESS_ID,
        name: content.brand.name,
        description: content.seo.homeDescription,
        url: SITE_URL,
        image,
        logo,
        telephone: content.contact.phone,
        email: content.contact.email,
        priceRange: "€€",
        address: {
          "@type": "PostalAddress",
          streetAddress: content.contact.address,
          addressLocality: "Cassis",
          postalCode: "13260",
          addressCountry: "FR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 43.2146,
          longitude: 5.5392,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "08:00",
            closes: "20:00",
          },
        ],
        areaServed: {
          "@type": "Place",
          name: "Cassis et Parc national des Calanques",
        },
        parentOrganization: { "@id": ORG_ID },
      },
    ],
  };
}

export function buildBreadcrumbList(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

export { BUSINESS_ID, ORG_ID, WEBSITE_ID };
