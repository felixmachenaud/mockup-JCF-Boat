"use client";

import { useScroll, useTransform, motion, useMotionTemplate } from "framer-motion";

export function RestOfPageBlur() {
  const { scrollYProgress } = useScroll();

  const blur = useTransform(scrollYProgress, [0, 0.06, 0.22, 0.5], [0, 1.5, 4, 6]);
  const veil = useTransform(scrollYProgress, [0, 0.08, 0.25, 0.55], [0, 0.02, 0.05, 0.08]);

  const backdropFilter = useMotionTemplate`blur(${blur}px)`;
  const background = useMotionTemplate`rgba(255, 255, 255, ${veil})`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        background,
      }}
    />
  );
}
