"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Loader2 } from "lucide-react";

interface ModeloViewerProps {
  src: string;
  alt: string;
  className?: string;
}

// Visualizador 3D (<model-viewer>, Apache-2.0). A biblioteca só é baixada quando o componente aparece na tela
// e o modelo só é buscado quando o aluno chega perto dele (loading="lazy").
export function ModeloViewer({ src, alt, className }: ModeloViewerProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");

  useEffect(() => {
    let ativo = true;
    void import("@google/model-viewer").catch(() => {
      if (ativo) setEstado("erro");
    });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const aoCarregar = () => setEstado("pronto");
    const aoFalhar = () => setEstado("erro");
    el.addEventListener("load", aoCarregar);
    el.addEventListener("error", aoFalhar);
    return () => {
      el.removeEventListener("load", aoCarregar);
      el.removeEventListener("error", aoFalhar);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ""}`} style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        camera-controls
        touch-action="pan-y"
        loading="lazy"
        shadow-intensity="0.6"
        interaction-prompt="auto"
        style={{ width: "100%", height: "100%", minHeight: 320, display: "block", background: "transparent" }}
      />
      {estado === "carregando" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando modelo 3D…
        </div>
      )}
      {estado === "erro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          <Box className="h-8 w-8 opacity-40" aria-hidden="true" />
          No se pudo cargar el modelo 3D. Revisa que el archivo exista y sea un .glb válido.
        </div>
      )}
    </div>
  );
}
