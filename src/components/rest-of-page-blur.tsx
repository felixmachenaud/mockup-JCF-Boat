"use client";

import { useEffect, useState } from "react";
import {
  useScroll,
  useTransform,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
} from "framer-motion";

export function RestOfPageBlur() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setEnabled(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!enabled) return null;
  return <DesktopBlur />;
}

function DesktopBlur() {
  const { scrollY, scrollYProgress } = useScroll();
  const [active, setActive] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setActive(y > 24);
  });

  const blur = useTransform(scrollYProgress, [0, 0.06, 0.22, 0.5], [0, 1.5, 4, 6]);
  const veil = useTransform(scrollYProgress, [0, 0.08, 0.25, 0.55], [0, 0.02, 0.05, 0.08]);
  const backdropFilter = useMotionTemplate`blur(${blur}px)`;
  const background = useMotionTemplate`rgba(255, 255, 255, ${veil})`;

  if (!active) return null;

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
