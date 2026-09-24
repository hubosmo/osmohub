"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, AlignJustify } from "lucide-react";
import { AtlasImageViewer } from "./AtlasImageViewer";
import { CollapsibleCaption } from "./CollapsibleCaption";

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
  const total = imagens.length;
  const current = imagens[idx];

  if (total === 0) return null;

  function navigate(newIdx: number, direction: 1 | -1) {
    if (prevIdx !== null) return; // bloqueia durante animação
    setPrevIdx(idx);
    setDir(direction);
    setIdx(newIdx);
    setShowList(false);
  }

  function prev() { navigate(idx > 0 ? idx - 1 : total - 1, -1); }
  function next() { navigate(idx < total - 1 ? idx + 1 : 0, 1); }
  function goTo(i: number) { if (i !== idx) navigate(i, i > idx ? 1 : -1); }

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
      <div className="relative overflow-hidden">

        {/* Imagem entrando — posição normal, mantém a altura do container */}
        <div
          key={idx}
          style={prevIdx !== null ? {
            animation: `${enterAnim} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
          } : undefined}
        >
          <AtlasImageViewer src={current.url} alt={current.legenda ?? ""} />
        </div>

        {/* Imagem saindo — sobreposição absoluta, não afeta layout */}
        {prevIdx !== null && (
          <div
            key={`exit-${prevIdx}`}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              animation: `${exitAnim} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
            }}
            onAnimationEnd={() => setPrevIdx(null)}
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
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#fff" }}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
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

        {showList && total > 1 && (
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
        )}
      </div>
    </figure>
  );
}
