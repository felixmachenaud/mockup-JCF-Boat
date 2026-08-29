"use client";

import { useEffect, useState } from "react";

const VIEW_WIDTH = 2400;
const VIEW_HEIGHT = 140;
const CYCLES = 8;
const AMPLITUDE = 16;
const WAVELENGTH = VIEW_WIDTH / CYCLES;
const SEGMENTS_PER_CYCLE = 12;

function buildSinePath(centerY: number, width: number): string {
  const totalSegments = CYCLES * SEGMENTS_PER_CYCLE;
  const step = width / totalSegments;
  let d = "";

  for (let i = 0; i <= totalSegments; i++) {
    const x = i * step;
    const y =
      centerY + AMPLITUDE * Math.sin((2 * Math.PI * x) / WAVELENGTH);
    const xLabel = x.toFixed(2);
    const yLabel = y.toFixed(2);
    d += i === 0 ? `M ${xLabel} ${yLabel}` : ` L ${xLabel} ${yLabel}`;
  }

  return d;
}

const TOP_WAVE = buildSinePath(52, VIEW_WIDTH);
const BOTTOM_WAVE = buildSinePath(88, VIEW_WIDTH);

export function HeroWaves() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 450));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(start);
    return () => cancel(id);
  }, []);

  return (
    <div
      className={`hero-waves pointer-events-none absolute inset-0 z-[1]${ready ? " hero-waves--ready" : ""}`}
      aria-hidden="true"
    >
      <div className="hero-waves__viewport absolute top-1/2 left-[calc(50%-50vw)] h-[min(14vw,90px)] w-screen -translate-y-1/2 sm:h-[min(12vw,100px)] md:h-[min(10vw,110px)]">
        <div className="hero-waves__pointer" />

        <svg
          className="hero-waves__svg h-full w-full"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="hero-waves__lines">
            <WaveLine
              d={TOP_WAVE}
              stroke="rgba(0, 212, 255, 0.45)"
              strokeWidth={9}
            />
            <WaveLine
              d={BOTTOM_WAVE}
              stroke="rgba(0, 212, 255, 0.45)"
              strokeWidth={9}
            />
            <WaveLine
              d={TOP_WAVE}
              stroke="rgba(0, 255, 255, 0.85)"
              strokeWidth={4.5}
            />
            <WaveLine
              d={BOTTOM_WAVE}
              stroke="rgba(0, 255, 255, 0.85)"
              strokeWidth={4.5}
            />
            <WaveLine
              d={TOP_WAVE}
              stroke="rgba(255, 255, 255, 0.92)"
              strokeWidth={2}
            />
            <WaveLine
              d={BOTTOM_WAVE}
              stroke="rgba(255, 255, 255, 0.92)"
              strokeWidth={2}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function WaveLine({
  d,
  stroke,
  strokeWidth,
}: {
  d: string;
  stroke: string;
  strokeWidth: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
