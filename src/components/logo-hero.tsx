"use client";

export function LogoHero() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <img
        src="/logo_white.png"
        alt="JCF Boat"
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="mx-auto h-full w-full object-contain object-center"
      />
    </div>
  );
}
