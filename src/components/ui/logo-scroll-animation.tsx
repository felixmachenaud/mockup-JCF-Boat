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
}

export function LogoScrollAnimation({
  title = "Explorez la côte avec",
  subtitle,
  ctaLabel = "Nous contacter",
  secondaryCtaLabel = "Réserver",
}: LogoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const rotateX = useTransform(
    scrollYProgress,
    [0.15, 0.55],
    [isMobile ? 12 : 20, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0.15, 0.55],
    isMobile ? [0.75, 0.95] : [1.12, 1]
  );

  const translateY = useTransform(
    scrollYProgress,
    [0.15, 0.55],
    [30, 0]
  );

  const titleTranslateY = useTransform(
    scrollYProgress,
    [0.15, 0.55],
    [20, -8]
  );

  const titleOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.25, 0.7],
    [0, 1, 1]
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen-safe w-full items-center justify-center overflow-x-hidden px-4 pb-4 pt-[calc(4.5rem+env(safe-area-inset-top))] md:min-h-[110vh] md:px-8 md:pb-12 md:pt-[calc(6.5rem+env(safe-area-inset-top,0px))]"
    >
      <div
        className="relative flex w-full max-w-[1500px] flex-col items-center justify-center md:mt-4"
        style={{
          perspective: "1200px",
        }}
      >
        <motion.div
          style={{
            translateY: titleTranslateY,
            opacity: titleOpacity,
          }}
          className="relative z-10 text-center"
        >
          <ElectricTitle>{title}</ElectricTitle>
          {subtitle ? (
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/75 md:text-base">
              {subtitle}
            </p>
          ) : null}
        </motion.div>

        <div className="-mt-2 w-full md:-mt-5 md:-translate-y-[2cm]">
          <div className="relative -mt-6 w-full md:-mt-8">
            <HeroWaves />
            <AnimatedLogo
              rotateX={rotateX}
              scale={scale}
              translateY={translateY}
            />
          </div>

          <div className="relative z-10 mt-2 flex flex-wrap justify-center gap-3 -translate-y-[2cm] md:mt-4">
            <AvailabilityButton size="hero" href="/bateaux" label={ctaLabel} />
            <Link
              href="/location-bateau-cassis"
              className="hero-availability-btn inline-flex min-h-[3.75rem] items-center justify-center rounded-full border border-white/40 bg-black/30 px-10 text-lg font-medium text-white backdrop-blur-sm transition hover:bg-black/45 md:min-h-[4.5rem] md:px-12 md:text-xl"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

interface AnimatedLogoProps {
  rotateX: MotionValue<number>;
  scale: MotionValue<number>;
  translateY: MotionValue<number>;
}

function AnimatedLogo({
  rotateX,
  scale,
  translateY,
}: AnimatedLogoProps) {
  return (
    <motion.div
      style={{
        rotateX,
        scale,
        translateY,
        transformStyle: "preserve-3d",
      }}
      className="relative z-[2] flex w-full items-center justify-center will-change-transform"
    >
      <div
        className="logo-layer relative h-[280px] w-full max-w-[900px] sm:h-[360px] md:h-[500px] lg:h-[650px] lg:max-w-[1200px]"
      >
        {/* Native img preserves PNG alpha — next/image can flatten transparency */}
        <img
          src="/logo_white.png"
          alt="JCF Boat Services"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        />
      </div>
    </motion.div>
  );
}

function ElectricTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="hero-title text-[clamp(2rem,9vw,4rem)] font-medium tracking-tight md:text-8xl lg:text-9xl">
      {children}
    </h1>
  );
}
