"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
  footer,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const headerTranslate = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div
        className="sticky top-0 relative flex h-screen flex-col px-4"
        style={{ perspective: "1000px" }}
      >
        {/* Texte en haut */}
        <Header translate={headerTranslate} titleComponent={titleComponent} />

        {/* Logo centré au milieu de l'écran */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <LogoFrame rotate={rotate} scale={scale}>
            {children}
          </LogoFrame>
        </div>

        {footer && (
          <div className="absolute bottom-6 left-0 flex w-full justify-center md:bottom-8">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="relative z-10 mx-auto w-full max-w-3xl pt-[6vh] text-center md:pt-[8vh]"
    >
      {titleComponent}
    </motion.div>
  );
};

export const LogoFrame = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
      className="mx-auto flex h-[70vh] w-full max-w-5xl -translate-y-[4vh] items-center justify-center md:h-[78vh] md:max-w-7xl md:-translate-y-[6vh]"
    >
      {children}
    </motion.div>
  );
};
