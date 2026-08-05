"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Petite flèche grisée pour revenir en arrière — masquée sur l’accueil et l’admin.
 */
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      aria-label="Retour"
      className="pointer-events-auto fixed left-3 z-[45] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/55 shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-white/25 hover:bg-black/55 hover:text-white/80 active:scale-95 md:left-5 md:h-11 md:w-11"
      style={{ top: "max(5.5rem, calc(4.25rem + env(safe-area-inset-top)))" }}
    >
      <ArrowLeft className="h-4 w-4 md:h-[1.1rem] md:w-[1.1rem]" strokeWidth={2} />
    </button>
  );
}
