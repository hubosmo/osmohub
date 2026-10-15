"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft } from "lucide-react";

const TOUR_KEY = "osmo-topico-tour-v1";
const CARD_W = 300;
const SPOT_PAD = 10;
const DIALOG_GAP = 14;
const BREADCRUMB_H = 48;
const BREADCRUMB_GAP = 8;
// For tall elements, scroll so their top lands at BREADCRUMB_H + BREADCRUMB_GAP + SPOT_PAD
// This gives the spotlight exactly BREADCRUMB_GAP space above the element (matching the clamp).
const SCROLL_TOP_OFFSET = BREADCRUMB_H + BREADCRUMB_GAP + SPOT_PAD;

interface TargetRect { top: number; left: number; width: number; height: number; radius: number }

const STEPS = [
  {
    titulo: "Objetivos de aprendizaje",
    descripcion:
      "Cada tema comienza con lo que vas a aprender. Estas son las habilidades que obtendrás al completar la unidad de estudio.",
    targetId: "objetivo",
  },
  {
    titulo: "Video tutorial",
    descripcion:
      "Nuestros videos son el mejor lugar para empezar a aprender un tema desde cero. Son una guía base del contenido que vas a estudiar.",
    targetId: "video-tour",   // targets the player wrapper, not the whole section
  },
  {
    titulo: "Atlas de imágenes",
    descripcion:
      "Encuentra rápidamente las estructuras anatómicas en el atlas, ya sea de forma individual o en contexto con imágenes etiquetadas.",
    targetId: "atlas-tour",   // targets the atlas content, not the whole section
  },
  {
    titulo: "Cuestionario",
    descripcion:
      "Construye tu conocimiento paso a paso. Los cuestionarios usan repetición espaciada y se ajustan a tu nivel de desempeño.",
    targetId: "cuestionario-tour",
  },
  {
    titulo: "Completa tu tema",
    descripcion:
      "Aprueba la evaluación final para completar el tema y continuar con la siguiente unidad del curso.",
    targetId: "continua",
  },
];

export function TopicTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Viewport size tracking
  useEffect(() => {
    const sync = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const isMobile = vp.w > 0 && vp.w < 640;

  // Get target rect — round to integers, clamp to viewport
  const syncRect = useCallback((s: number) => {
    const id = STEPS[s].targetId;
    if (!id) { setRect(null); return; }
    const el = document.getElementById(id);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const radius = parseFloat(window.getComputedStyle(el).borderRadius) || 0;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const top    = Math.round(Math.max(0, r.top));
    const left   = Math.round(Math.max(0, r.left));
    const bottom = Math.round(Math.min(vh, r.bottom));
    const right  = Math.round(Math.min(vw, r.right));
    // On mobile cap at 55% so card doesn't overlap spotlight
    const maxH = Math.floor(vh * (vw < 640 ? 0.55 : 0.82));
    setRect({
      top,
      left,
      width: right - left,
      height: Math.min(bottom - top, maxH),
      radius,
    });
  }, []);

  // Show on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) setVisible(true);
    } catch {}
  }, []);

  // Desktop only: lock scroll with scrollbar-width compensation to prevent layout shift.
  function lockScroll() {
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarW}px`;
  }
  function unlockScroll() {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  useEffect(() => {
    if (!visible || isMobile) return;
    lockScroll();
    return () => unlockScroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isMobile]);

  // On step change: scroll to target, then measure
  useEffect(() => {
    if (!visible) return;
    if (!isMobile) unlockScroll();
    const id = STEPS[step].targetId;
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        const isTall = r.height > window.innerHeight * (isMobile ? 0.55 : 0.82);
        if (isTall) {
          const targetScrollY = window.scrollY + r.top - SCROLL_TOP_OFFSET;
          window.scrollTo({ top: Math.max(0, targetScrollY), behavior: "smooth" });
        } else {
          // On mobile scroll so element top has breathing room from the card at bottom
          el.scrollIntoView({ behavior: "smooth", block: isMobile ? "start" : "center" });
        }
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!isMobile) lockScroll();
      requestAnimationFrame(() => syncRect(step));
    }, 450);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, visible, syncRect, isMobile]);

  // On mobile: keep rect in sync while user scrolls (no scroll lock)
  useEffect(() => {
    if (!visible || !isMobile) return;
    const onScroll = () => syncRect(step);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible, isMobile, step, syncRect]);

  // Update rect on window resize
  useEffect(() => {
    if (!visible) return;
    const update = () => syncRect(step);
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [visible, step, syncRect]);

  function dismiss() {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    unlockScroll();
    try { localStorage.setItem(TOUR_KEY, "1"); } catch {}
    setVisible(false);
  }

  function goTo(s: number) { setStep(s); }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // Spotlight bounds (with padding, clamped to never cover the breadcrumb)
  const spot = rect
    ? (() => {
        const rawTop = rect.top - SPOT_PAD;
        const safeTop = Math.max(BREADCRUMB_H + BREADCRUMB_GAP, rawTop);
        const rawH    = rect.height + SPOT_PAD * 2;
        const safeH   = rawH - (safeTop - rawTop); // shrink if top was pushed down
        return {
          top: safeTop,
          left: rect.left - SPOT_PAD,
          w: rect.width + SPOT_PAD * 2,
          h: safeH,
          radius: rect.radius + SPOT_PAD,
        };
      })()
    : null;

  // Dialog position — tries: below → above → right → left → clamped
  let dialogTop = 0;
  let dialogLeft = 0;
  let arrowDir: "up" | "down" | "left" | "right" | null = null;
  const CARD_H_EST = 190;

  if (!isMobile && spot && vp.w > 0) {
    const spaceBelow = vp.h - (spot.top + spot.h);
    const spaceAbove = spot.top - BREADCRUMB_H;
    const spaceRight = vp.w - (spot.left + spot.w);
    const spaceLeft  = spot.left;

    if (spaceBelow >= CARD_H_EST + DIALOG_GAP) {
      dialogTop  = spot.top + spot.h + DIALOG_GAP;
      dialogLeft = clamp(spot.left + spot.w / 2 - CARD_W / 2, 16, vp.w - CARD_W - 16);
      arrowDir   = "up";
    } else if (spaceAbove >= CARD_H_EST + DIALOG_GAP) {
      dialogTop  = spot.top - CARD_H_EST - DIALOG_GAP;
      dialogLeft = clamp(spot.left + spot.w / 2 - CARD_W / 2, 16, vp.w - CARD_W - 16);
      arrowDir   = "down";
    } else if (spaceRight >= CARD_W + DIALOG_GAP) {
      // Not enough vertical space — float to the right of the spotlight
      dialogLeft = spot.left + spot.w + DIALOG_GAP;
      dialogTop  = clamp(spot.top + spot.h / 2 - CARD_H_EST / 2, BREADCRUMB_H + 8, vp.h - CARD_H_EST - 8);
      arrowDir   = "right";
    } else if (spaceLeft >= CARD_W + DIALOG_GAP) {
      dialogLeft = spot.left - CARD_W - DIALOG_GAP;
      dialogTop  = clamp(spot.top + spot.h / 2 - CARD_H_EST / 2, BREADCRUMB_H + 8, vp.h - CARD_H_EST - 8);
      arrowDir   = "left";
    } else {
      dialogTop  = clamp(spot.top, BREADCRUMB_H + 8, vp.h - CARD_H_EST - 8);
      dialogLeft = clamp(spot.left + spot.w / 2 - CARD_W / 2, 16, vp.w - CARD_W - 16);
      arrowDir   = null;
    }
  }

  const dialogStyle: React.CSSProperties =
    !isMobile && spot && vp.w > 0
      ? { position: "fixed", top: dialogTop, left: dialogLeft, width: CARD_W, zIndex: 62 }
      : isMobile
      ? { position: "fixed", bottom: "max(16px, env(safe-area-inset-bottom, 0px) + 12px)", left: 12, right: 12, zIndex: 62 }
      : { position: "fixed", bottom: 28, left: 24, width: CARD_W, zIndex: 62 };

  return (
    <>
      {/* Click-to-dismiss layer */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 59, cursor: "default" }}
        onClick={dismiss}
      />

      {/* Spotlight — box-shadow creates the dark mask around the highlight window */}
      {spot ? (
        <div
          style={{
            position: "fixed",
            top: spot.top,
            left: spot.left,
            width: spot.w,
            height: spot.h,
            borderRadius: spot.radius,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)",
            border: "2px solid rgba(255,255,255,0.22)",
            zIndex: 60,
            pointerEvents: "none",
            transition: "top 0.38s cubic-bezier(.4,0,.2,1), left 0.38s cubic-bezier(.4,0,.2,1), width 0.38s, height 0.38s",
          }}
        />
      ) : (
        /* Fallback full overlay when no target element */
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.58)",
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Dialog card */}
      <div
        style={{
          ...dialogStyle,
          borderRadius: 12,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.45)",
          overflow: "visible",
          transition: "top 0.38s cubic-bezier(.4,0,.2,1), left 0.38s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Arrow up (dialog below spotlight) */}
        {arrowDir === "up" && (
          <div style={{
            position: "absolute",
            top: -7,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid var(--bg-elevated)",
            filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.2))",
          }} />
        )}

        {/* Arrow down (dialog above spotlight) */}
        {arrowDir === "down" && (
          <div style={{
            position: "absolute",
            bottom: -7,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid var(--bg-elevated)",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))",
          }} />
        )}

        {/* Arrow left (dialog to the right of spotlight) */}
        {arrowDir === "right" && (
          <div style={{
            position: "absolute",
            left: -7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid var(--bg-elevated)",
            filter: "drop-shadow(-2px 0 2px rgba(0,0,0,0.2))",
          }} />
        )}

        {/* Arrow right (dialog to the left of spotlight) */}
        {arrowDir === "left" && (
          <div style={{
            position: "absolute",
            right: -7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "8px solid var(--bg-elevated)",
            filter: "drop-shadow(2px 0 2px rgba(0,0,0,0.2))",
          }} />
        )}

        {/* Card header */}
        <div style={{ padding: "12px 14px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}>
              Recorrido por el tema
            </span>
            <button
              onClick={dismiss}
              aria-label="Cerrar recorrido"
              style={{
                color: "var(--text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                lineHeight: 1,
                display: "flex",
              }}
            >
              <X size={13} />
            </button>
          </div>

          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>
            {current.titulo}
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)", marginBottom: 14 }}>
            {current.descripcion}
          </p>
        </div>

        {/* Card footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "12px 16px" : "10px 14px",
          borderTop: "1px solid var(--border)",
        }}>
          {step > 0 && (
            <button
              onClick={() => goTo(step - 1)}
              style={{
                fontSize: isMobile ? 13 : 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "var(--text-primary)",
                background: "transparent",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                padding: isMobile ? "9px 14px" : "5px 11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                minHeight: isMobile ? 44 : undefined,
              }}
            >
              <ChevronLeft size={isMobile ? 14 : 12} />
              ATRÁS
            </button>
          )}

          <button
            onClick={() => isLast ? dismiss() : goTo(step + 1)}
            style={{
              flex: 1,
              fontSize: isMobile ? 13 : 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--text-inverse)",
              background: "var(--accent)",
              border: "none",
              borderRadius: 8,
              padding: isMobile ? "10px 12px" : "6px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: isMobile ? 44 : undefined,
            }}
          >
            {isLast ? "FINALIZAR" : "ADELANTE"}
          </button>

          {/* Progress dots on mobile, counter on desktop */}
          {isMobile ? (
            <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === step ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === step ? "var(--accent)" : "var(--border)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.2s ease, background 0.2s ease",
                  }}
                  aria-label={`Paso ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}>
              {step + 1}/{STEPS.length}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
