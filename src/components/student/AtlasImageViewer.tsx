"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { ZoomIn } from "lucide-react";
import { preloadImage } from "@/lib/image-preload";

const LENS = 240;
const ZOOM = 2.8;

type LensState = { x: number; y: number; bw: number; bh: number; bx: number; by: number };

type Props = { src: string; alt: string };

export function AtlasImageViewer({ src, alt }: Props) {
  const [active, setActive] = useState(false);
  const [lens, setLens]     = useState<LensState | null>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  // shownSrc = src visível agora (só muda quando a próxima está pronta para pintar)
  const [shownSrc, setShownSrc] = useState(src);
  const [ready, setReady]       = useState(false);
  const visibleRef              = useRef<HTMLImageElement>(null);

  // Detecta imagens em cache antes do primeiro paint — evita flash no reload
  useLayoutEffect(() => {
    const img = visibleRef.current;
    if (img?.complete && img.naturalWidth > 0) setReady(true);
  }, [shownSrc]);

  // Quando src muda: pré-carrega e decodifica antes de exibir — sem flash entre slides
  useEffect(() => {
    if (src === shownSrc) return;

    let cancelled = false;
    void preloadImage(src).then(() => { if (!cancelled) setShownSrc(src); });
    return () => { cancelled = true; };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const x = Math.max(LENS / 2, Math.min(rect.width  - LENS / 2, rawX));
    const y = Math.max(LENS / 2, Math.min(rect.height - LENS / 2, rawY));
    setLens({
      x, y,
      bw: rect.width  * ZOOM,
      bh: rect.height * ZOOM,
      bx: -(rawX * ZOOM - LENS / 2),
      by: -(rawY * ZOOM - LENS / 2),
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setLens(null)}
      style={{ cursor: active ? "crosshair" : "default", lineHeight: 0, minHeight: ready ? undefined : 180, height: ready ? undefined : "100%" }}
    >
      {/* Skeleton só no carregamento inicial (nunca durante troca de slide) */}
      {!ready && (
        <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-elevated)" }} />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={visibleRef}
        src={shownSrc}
        alt={alt}
        className="w-full h-auto block"
        draggable={false}
        onLoad={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.2s ease" }}
      />

      {/* Toggle lupa */}
      <button
        type="button"
        onClick={() => { setActive((v) => !v); setLens(null); }}
        className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center h-8 w-8 rounded-lg transition-all"
        style={{
          backgroundColor: active ? "var(--accent)" : "rgba(0,0,0,0.35)",
          color: "#fff",
          backdropFilter: "blur(4px)",
          boxShadow: active ? "0 0 0 2px rgba(0,166,255,0.35)" : "none",
        }}
        aria-label={active ? "Desactivar lupa" : "Activar lupa"}
        title={active ? "Desactivar lupa" : "Activar lupa"}
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      {/* Lupa ampliadora */}
      {active && lens && (
        <div
          className="pointer-events-none absolute rounded-full z-20"
          style={{
            width:  LENS,
            height: LENS,
            left:   lens.x - LENS / 2,
            top:    lens.y - LENS / 2,
            backgroundImage:    `url(${shownSrc})`,
            backgroundRepeat:   "no-repeat",
            backgroundSize:     `${lens.bw}px ${lens.bh}px`,
            backgroundPosition: `${lens.bx}px ${lens.by}px`,
            border:    "2.5px solid rgba(255,255,255,0.75)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
        />
      )}
    </div>
  );
}
