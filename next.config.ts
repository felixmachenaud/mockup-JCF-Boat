import type { NextConfig } from "next";
import { HERO_DESKTOP, HERO_LQIP, HERO_MOBILE } from "./src/lib/hero-assets";

const isProd = process.env.NODE_ENV === "production";

const scriptSrc = [
  "script-src 'self'",
  "'unsafe-inline'", // Next.js inline bootstraps; migrate to nonces when supported end-to-end
  ...(isProd ? [] : ["'unsafe-eval'"]), // Next/Turbopack HMR needs eval in development only
  "https://maps.googleapis.com",
  "https://maps.gstatic.com",
  "https://challenges.cloudflare.com",
].join(" ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // SEC-04: restrict images to known origins (no blanket https:)
      "img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.blob.vercel-storage.com https://challenges.cloudflare.com",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.google.com/maps/ https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const hashedHeroCache = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const staticImageCache = [
  {
    key: "Cache-Control",
    value: "public, max-age=2592000, stale-while-revalidate=86400",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ["sharp", "@upstash/redis", "@upstash/ratelimit"],
  experimental: {
    proxyClientMaxBodySize: "10mb",
  },
  poweredByHeader: false,
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: "/api/media/**" },
      { pathname: "/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      ...[HERO_DESKTOP, HERO_MOBILE, HERO_LQIP].map((source) => ({
        source,
        headers: hashedHeroCache,
      })),
      {
        source: "/logo_white.png",
        headers: staticImageCache,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/cassis",
        destination: "/calanques-de-cassis",
        permanent: true,
      },
      {
        source: "/visite-calanques-en-bateau",
        destination: "/calanques-de-cassis",
        permanent: true,
      },
      {
        source: "/reservation",
        destination: "/#contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
