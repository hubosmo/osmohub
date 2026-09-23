"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

// ── SVG geometry (viewBox 262 × 76) ─────────────────────────────────────────
const CX = 38;   // icon center x
const CY = 38;   // icon center y
const R  = 30;   // outer arc radius
const ri = 17;   // inner arc radius

// Outer arc: 270° from 180° (left) → 90° (bottom) clockwise — gap at lower-left
const outerD = `M ${CX - R} ${CY} A ${R} ${R} 0 1 1 ${CX} ${CY + R}`;

// Inner arc: 90° from 90° (bottom) → 180° (left) clockwise — fills the gap
const innerD = `M ${CX} ${CY + ri} A ${ri} ${ri} 0 0 1 ${CX - ri} ${CY}`;

const ease = [0.4, 0, 0.2, 1] as const;

// ── Component ────────────────────────────────────────────────────────────────
export interface OsmoLogoProps {
  width?: number;
  className?: string;
  /** Override text color — auto-detects from theme if omitted */
  color?: string;
  /** Brand blue override — default #00A6FF */
  accentColor?: string;
  /**
   * Play entrance animation on mount:
   *  – outer arc draws itself (pathLength 0 → 1, 0.9 s)
   *  – inner arc draws with 250 ms stagger (0.7 s)
   *  – nucleus springs into view (0.4 s delay)
   *  – wordmark slides + fades in (0.52 s delay)
   *  – accent dot pops in with spring (0.75 s delay)
   */
  animated?: boolean;
  /** ID prefix — make unique when multiple logos appear on the same page */
  idPrefix?: string;
}

export function OsmoLogo({
  width = 160,
  className,
  color,
  accentColor = "#00A6FF",
  animated = false,
  idPrefix = "osmo",
}: OsmoLogoProps) {
  const { theme } = useTheme();
  const textColor = color ?? (theme === "dark" ? "#FFFFFF" : "#263B4C");
  const height = Math.round((width / 262) * 76);

  const textRef = useRef<SVGTextElement>(null);
  const dotRef  = useRef<SVGCircleElement>(null);

  // After font renders, measure the wordmark and slide the accent dot next to it
  useLayoutEffect(() => {
    const el  = textRef.current;
    const dot = dotRef.current;
    if (!el || !dot) return;
    try {
      const bbox = el.getBBox();
      const cx = bbox.x + bbox.width + 16;
      dot.setAttribute("cx", String(cx));
      // Keep transform-origin centred on the (possibly repositioned) dot
      dot.style.transformOrigin = `${cx}px ${CY}px`;
    } catch { /* hidden/SSR — defaults stay */ }
  }, [width]);

  return (
    <svg
      viewBox="0 0 262 76"
      width={width}
      height={height}
      className={cn(className)}
      aria-label="Osmo"
      role="img"
    >
      {/* ── ICON ─────────────────────────────────────────────────────────── */}
      <g id={`${idPrefix}-icon`}>

        {/* Outer arc — draws first */}
        <motion.path
          id={`${idPrefix}-outer`}
          d={outerD}
          fill="none"
          stroke={accentColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : false}
          animate={animated ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 0.9, delay: 0, ease }}
        />

        {/* Inner arc — draws slightly after */}
        <motion.path
          id={`${idPrefix}-inner`}
          d={innerD}
          fill="none"
          stroke={accentColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : false}
          animate={animated ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 0.7, delay: 0.25, ease }}
        />

        {/* Nucleus — springs up once arcs are almost done */}
        <motion.circle
          id={`${idPrefix}-nucleus`}
          cx={CX}
          cy={CY}
          r={6}
          fill={accentColor}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          initial={animated ? { scale: 0, opacity: 0 } : false}
          animate={animated ? { scale: 1, opacity: 1 } : false}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        />
      </g>

      {/* ── WORDMARK ─────────────────────────────────────────────────────── */}
      <motion.text
        id={`${idPrefix}-text`}
        ref={textRef}
        x={84}
        y={55}
        fontSize={46}
        fontFamily="Montserrat, sans-serif"
        fontWeight={800}
        fill={textColor}
        letterSpacing={1}
        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800 }}
        initial={animated ? { opacity: 0, x: -10 } : false}
        animate={animated ? { opacity: 1, x: 0 } : false}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.52 }}
      >
        osmo
      </motion.text>

      {/* ── ACCENT DOT ───────────────────────────────────────────────────── */}
      {/* cx is corrected after font metrics are known (useLayoutEffect above) */}
      <motion.circle
        id={`${idPrefix}-dot`}
        ref={dotRef}
        cx={235}
        cy={CY}
        r={8.5}
        fill={accentColor}
        style={{ transformOrigin: `235px ${CY}px` }}
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 350, damping: 16, delay: 0.75 }}
      />
    </svg>
  );
}
