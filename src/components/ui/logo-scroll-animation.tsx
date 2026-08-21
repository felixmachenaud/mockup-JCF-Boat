"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  MotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { HeroWaves } from "@/components/hero-waves";
import { AvailabilityButton } from "@/components/availability-button";

interface LogoScrollProps {
  title?: React.ReactNode;
  subtitle?: string;
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  brandName?: string;
}

export function LogoScrollAnimation({
  title = "Explorez la côte avec",
  subtitle,
  ctaLabel = "Nous contacter",
  secondaryCtaLabel = "Voir les bateaux",
  brandName = "JCF Boat",
}: LogoScrollProps) {
  return (
    <>
      <MobileHero
        title={title}
        subtitle={subtitle}
        ctaLabel={ctaLabel}
        secondaryCtaLabel={secondaryCtaLabel}
        brandName={brandName}
      />
      <DesktopHero
        title={title}
        subtitle={subtitle}
        ctaLabel={ctaLabel}
        secondaryCtaLabel={secondaryCtaLabel}
        brandName={brandName}
      />
    </>
  );
}

function MobileHero({
  title,
  subtitle,
  ctaLabel,
  secondaryCtaLabel,
  brandName,
}: LogoScrollProps) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-x-clip px-5 pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center text-center">
        <h1 className="hero-title text-[1.85rem] font-medium tracking-tight leading-[1.12] sm:text-[2.1rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-[22rem] text-[0.9375rem] leading-relaxed text-white/75">
            {subtitle}
          </p>
        ) : null}

        <div className="relative mt-5 h-[11.5rem] w-full max-w-[18rem] sm:h-[13rem]">
          <img
            src="/logo_white.png"
            alt={brandName}
            draggable={false}
            decoding="async"
            fetchPriority="high"
            className="pointer-events-none h-full w-full select-none object-contain"
          />
        </div>

        <div className="mt-6 flex w-full flex-col gap-3">
          <AvailabilityButton
            size="hero"
            href="/#contact"
            label={ctaLabel}
            className="w-full min-h-12 px-6 text-base"
          />
          <Link
            href="/bateaux"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/35 bg-black/35 px-6 text-base font-medium text-white backdrop-blur-sm"
          >
            {secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function DesktopHero({
  title,
  subtitle,
  ctaLabel,
  secondaryCtaLabel,
  brandName,
}: LogoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0.15, 0.55], [20, 0]);
  const scale = useTransform(scrollYProgress, [0.15, 0.55], [1.12, 1]);
  const translateY = useTransform(scrollYProgress, [0.15, 0.55], [30, 0]);
  const titleTranslateY = useTransform(scrollYProgress, [0.15, 0.55], [20, -8]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.25, 0.7], [0, 1, 1]);

  return (
    <section
      ref={containerRef}
      className="relative hidden min-h-[110vh] w-full items-center justify-center overflow-x-hidden px-8 pb-12 pt-[calc(6.5rem+env(safe-area-inset-top,0px))] md:flex"
    >
      <div
        className="relative mt-4 flex w-full max-w-[1500px] flex-col items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          style={
            enabled
              ? { translateY: titleTranslateY, opacity: titleOpacity }
              : undefined
          }
          className="relative z-10 text-center"
        >
          <h1 className="hero-title text-8xl font-medium tracking-tight lg:text-9xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-3 max-w-xl text-base text-white/75">
              {subtitle}
            </p>
          ) : null}
        </motion.div>

        <div className="-mt-5 w-full -translate-y-[2cm]">
          <div className="relative -mt-8 w-full">
            <HeroWaves />
            <AnimatedLogo
              rotateX={rotateX}
              scale={scale}
              translateY={translateY}
              enabled={enabled}
              brandName={brandName ?? "JCF Boat"}
            />
          </div>

          <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-3 -translate-y-[2cm]">
            <AvailabilityButton size="hero" href="/#contact" label={ctaLabel} />
            <Link
              href="/bateaux"
              className="hero-availability-btn inline-flex min-h-[4.5rem] items-center justify-center rounded-full border border-white/40 bg-black/30 px-12 text-xl font-medium text-white backdrop-blur-sm transition hover:bg-black/45"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedLogo({
  rotateX,
  scale,
  translateY,
  enabled,
  brandName,
}: {
  rotateX: MotionValue<number>;
  scale: MotionValue<number>;
  translateY: MotionValue<number>;
  enabled: boolean;
  brandName: string;
}) {
  return (
    <motion.div
      style={
        enabled
          ? {
              rotateX,
              scale,
              translateY,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      className="relative z-[2] flex w-full items-center justify-center"
    >
      <div className="logo-layer relative h-[500px] w-full max-w-[900px] lg:h-[650px] lg:max-w-[1200px]">
        <img
          src="/logo_white.png"
          alt={brandName}
          draggable={false}
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        />
      </div>
    </motion.div>
  );
}
