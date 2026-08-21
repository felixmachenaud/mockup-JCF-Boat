import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { getContent } from "@/lib/content-store";
import { SHARE_IMAGE, SITE_NAME, SITE_URL, getMetadataBaseUrl } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: `${SITE_NAME} — Location de bateaux à Cassis`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Location de bateaux à Cassis avec JCF Boat. Flotte avec permis, sans permis et électrique pour explorer les calanques.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Location de bateaux à Cassis`,
    description:
      "Louez un bateau à Cassis et explorez les calanques. Flotte avec permis, sans permis et électrique.",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Location de bateaux à Cassis`,
    images: [SHARE_IMAGE.url],
  },
  robots:
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "normal",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2f97ad" },
    { media: "(prefers-color-scheme: dark)", color: "#2f97ad" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();

  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className="min-h-full"
      style={{ backgroundColor: "#2f97ad" }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
        style={{ backgroundColor: "transparent" }}
      >
        {children}
        <BackButton />
        <SiteFooter
          brandName={content.brand.name}
          tagline={content.brand.tagline}
          phoneDisplay={content.contact.phoneDisplay}
          address={content.contact.address}
        />
      </body>
    </html>
  );
}
