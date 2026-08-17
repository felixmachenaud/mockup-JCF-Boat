import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { BackButton } from "@/components/back-button";
import { getContent } from "@/lib/content-store";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
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
  metadataBase: new URL(SITE_URL),
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
    images: [{ url: "/mana23.1.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/mana23.1.jpg"],
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
  themeColor: "#0c4a6e",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();

  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
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
