"use client";

import { useState, useRef } from "react";
import { useImagePreload } from "@/hooks/useImagePreload";
import { imagemPronta, preloadImage } from "@/lib/image-preload";
import { ChevronLeft, ChevronRight, AlignJustify, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AtlasImageViewer } from "./AtlasImageViewer";
import { CollapsibleCaption } from "./CollapsibleCaption";
import { ACCORDION_OPEN, ACCORDION_CLOSE, ACCORDION_STYLE, STANDARD } from "@/lib/motion";

type Imagem = { id: string; url: string; legenda: string | null };

type Props = {
  titulo: string | null;
  legenda: string | null;
  modo_legenda: string;
  imagens: Imagem[];
};

export function AtlasCarousel({ titulo, legenda, modo_legenda, imagens }: Props) {
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [showList, setShowList] = useState(false);
  const [frozenHeight, setFrozenHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Espera da imagem de destino: enquanto ela não está pronta, o slide não começa a deslizar
  const [carregando, setCarregando] = useState<1 | -1 | null>(null);
  const trocando = useRef(false);
  const total = imagens.length;
  const current = imagens[idx];

  // Pré-carrega duas imagens para cada lado do slide atual (sem repetir nem incluir a própria)
  const vizinhas = total > 1
    ? [...new Set([1, 2, -1, -2].map((d) => (idx + d + total * 2) % total))].filter((i) => i !== idx).map((i) => imagens[i].url)
    : [];
  useImagePreload(vizinhas);

  if (total === 0) return null;

  async function navigate(newIdx: number, direction: 1 | -1) {
    if (prevIdx !== null || trocando.current) return; // bloqueia durante animação e durante a espera
    trocando.current = true;
    // Só anima com a imagem de destino carregada e decodificada: evita deslizar um quadro vazio
    const alvo = imagens[newIdx].url;
    if (!imagemPronta(alvo)) {
      setCarregando(direction);
      await preloadImage(alvo);
      setCarregando(null);
    }
    trocando.current = false;
    // Congela a altura atual para evitar colapso durante a animação
    if (containerRef.current) {
      setFrozenHeight(containerRef.current.offsetHeight);
    }
    setPrevIdx(idx);
    setDir(direction);
    setIdx(newIdx);
    setShowList(false);
  }

  function prev() { void navigate(idx > 0 ? idx - 1 : total - 1, -1); }
  function next() { void navigate(idx < total - 1 ? idx + 1 : 0, 1); }
  function goTo(i: number) { if (i !== idx) void navigate(i, i > idx ? 1 : -1); }

  const enterAnim = dir === 1 ? "atlas-enter-right" : "atlas-enter-left";
  const exitAnim  = dir === 1 ? "atlas-exit-left"  : "atlas-exit-right";

  return (
    <figure className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <style>{`
        @keyframes atlas-enter-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes atlas-enter-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes atlas-exit-left   { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes atlas-exit-right  { from { transform: translateX(0); } to { transform: translateX(100%); } }
      `}</style>

      {/* Imagem principal */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={frozenHeight !== null ? { height: frozenHeight } : undefined}
      >

        {/* Imagem entrando — absoluta durante animação para não alterar layout */}
        <div
          key={idx}
          style={prevIdx !== null ? {
            position: "absolute",
            inset: 0,
            zIndex: 2,
            animation: `${enterAnim} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
          } : undefined}
        >
          <AtlasImageViewer src={current.url} alt={current.legenda ?? ""} />
        </div>

        {/* Imagem saindo — absoluta, só visual */}
        {prevIdx !== null && (
          <div
            key={`exit-${prevIdx}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              animation: `${exitAnim} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
            }}
            onAnimationEnd={() => { setPrevIdx(null); setFrozenHeight(null); }}
          >
            <AtlasImageViewer src={imagens[prevIdx].url} alt={imagens[prevIdx].legenda ?? ""} />
          </div>
        )}

        {/* Setas de navegação */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}
              aria-label="Imagen anterior"
              aria-busy={carregando !== null}
            >
              {carregando === -1 ?<Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}
              aria-label="Imagen siguiente"
              aria-busy={carregando !== null}
            >
              {carregando === 1 ?<Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>

      {/* Barra inferior: título/legenda + contador + lista */}
      <div style={{ backgroundColor: "var(--bg-elevated)", borderTop: "1px solid var(--border)" }}>
        {(titulo || total > 1) && (
          <div className="flex items-center gap-2 px-3 py-2.5">
            {titulo ? (
              <p className="flex-1 text-xs font-semibold truncate" style={{ color: "var(--text-secondary)" }}>
                {titulo}
              </p>
            ) : (
              <span className="flex-1" />
            )}

            {total > 1 && (
              <>
                <span className="text-xs shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {idx + 1}/{total}
                </span>
                <button
                  type="button"
                  onClick={() => setShowList((v) => !v)}
                  className="shrink-0 p-1 rounded transition-colors"
                  style={{
                    color: showList ? "var(--accent)" : "var(--text-muted)",
                    backgroundColor: showList ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                  }}
                  aria-label="Ver todas las imágenes"
                >
                  <AlignJustify className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}

        {(() => {
          const captionHtml = modo_legenda === "unica" ? legenda : current.legenda;
          if (!captionHtml) return null;
          const html = captionHtml.trimStart().startsWith("<") ? captionHtml : `<p>${captionHtml}</p>`;
          return (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <CollapsibleCaption html={html} />
            </div>
          );
        })()}

        <AnimatePresence initial={false}>
        {showList && total > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={ACCORDION_OPEN} exit={ACCORDION_CLOSE}
            transition={STANDARD} style={ACCORDION_STYLE}
          >
          <div
            className="flex flex-col gap-0 overflow-y-auto"
            style={{ maxHeight: 260, borderTop: "1px solid var(--border)" }}
          >
            {imagens.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => { goTo(i); }}
                className="flex items-center gap-3 px-3 py-2 text-left transition-colors"
                style={{
                  backgroundColor: i === idx
                    ? "color-mix(in srgb, var(--accent) 10%, var(--bg-elevated))"
                    : "transparent",
                  borderBottom: i < total - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-10 w-14 object-cover rounded shrink-0"
                  style={{ opacity: i === idx ? 1 : 0.7 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: i === idx ? "var(--accent)" : "var(--text-secondary)" }}>
                    {i + 1}. {img.legenda?.replace(/<[^>]+>/g, "").slice(0, 80) ?? `Imagen ${i + 1}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </figure>
  );
}
