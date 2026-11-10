"use client";

import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import { Box, Loader2 } from "lucide-react";
import { orbitaParaTexto, vetorParaTexto } from "@/lib/pontos3d";

export type PontoNoModelo = { id: string; posicao: string; normal: string | null; orbita: string | null; alvo: string | null; fov: number | null };
// A vista da câmera é órbita + alvo + campo de visão (o zoom mais próximo que o raio mínimo permite vem do campo de visão)
export type VistaCamera = { orbita: string; alvo: string; fov: number | null };
export type PosicaoNoModelo = { posicao: string; normal: string };
export type ColocacaoNoModelo = VistaCamera & PosicaoNoModelo;

// Controle imperativo: o editor do admin captura a câmera atual e move a câmera até um ponto
export interface ModeloViewerControle {
  capturarVista(): VistaCamera | null;
}

interface ModeloViewerProps {
  src: string;
  alt: string;
  className?: string;
  pontos?: PontoNoModelo[];
  selecionadoId?: string | null;
  onSelecionar?: (id: string) => void;
  // Editor: o próximo clique sobre o modelo (sem arrastar) devolve posição, normal e câmera
  modoColocar?: boolean;
  onColocar?: (c: ColocacaoNoModelo) => void;
  // Editor: com esta função, os pontos podem ser arrastados sobre a superfície; ela recebe a posição em cada movimento
  onMoverPonto?: (id: string, p: PosicaoNoModelo) => void;
  controleRef?: Ref<ModeloViewerControle>;
  // Conteúdo sobreposto ao visualizador (ex.: caixa de texto do ponto)
  children?: ReactNode;
}

const LIMITE_ARRASTE_PX = 6;
// Gatilho local do decodificador Meshopt (ver o comentário do arquivo): não depende de CDN
const DECODIFICADOR_MESHOPT = "/vendor/meshopt-ativar.js";

// Visualizador 3D (<model-viewer>, Apache-2.0). A biblioteca só é baixada quando o componente aparece na tela
// e o modelo só é buscado quando o aluno chega perto dele (loading="lazy").
export function ModeloViewer({
  src, alt, className, pontos = [], selecionadoId = null, onSelecionar, modoColocar = false, onColocar, onMoverPonto, controleRef, children,
}: ModeloViewerProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");
  // O modelo só recebe o `src` depois que o decodificador foi configurado: se o carregamento começasse antes, falharia
  const [pronta, setPronta] = useState(false);
  const onColocarRef = useRef(onColocar);
  const modoColocarRef = useRef(modoColocar);
  const onMoverRef = useRef(onMoverPonto);
  const onSelecionarRef = useRef(onSelecionar);

  useEffect(() => {
    onColocarRef.current = onColocar;
    modoColocarRef.current = modoColocar;
    onMoverRef.current = onMoverPonto;
    onSelecionarRef.current = onSelecionar;
  }, [onColocar, modoColocar, onMoverPonto, onSelecionar]);

  const viewer = () => ref.current as unknown as ModelViewerElement | null;

  function capturarVista(): VistaCamera | null {
    const mv = viewer();
    if (!mv || typeof mv.getCameraOrbit !== "function") return null;
    const fov = typeof mv.getFieldOfView === "function" ? mv.getFieldOfView() : null;
    return {
      orbita: orbitaParaTexto(mv.getCameraOrbit()),
      alvo: vetorParaTexto(mv.getCameraTarget()),
      fov: fov !== null && Number.isFinite(fov) ? Math.round(fov * 100) / 100 : null,
    };
  }
  useImperativeHandle(controleRef, () => ({ capturarVista }));

  useEffect(() => {
    let ativo = true;
    void import("@google/model-viewer")
      .then(({ ModelViewerElement }) => {
        // Modelos comprimidos com Meshopt (saída do gltf-transform) só abrem se o decodificador estiver configurado
        ModelViewerElement.meshoptDecoderLocation = DECODIFICADOR_MESHOPT;
        if (ativo) setPronta(true);
      })
      .catch(() => {
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

  // Clique no modelo (distinguindo de arrastar para girar): devolve onde o admin clicou e a câmera daquele momento
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inicio: { x: number; y: number } | null = null;
    const aoPressionar = (e: PointerEvent) => { inicio = { x: e.clientX, y: e.clientY }; };
    const aoSoltar = (e: PointerEvent) => {
      const origem = inicio;
      inicio = null;
      if (!origem || !modoColocarRef.current) return;
      if (Math.hypot(e.clientX - origem.x, e.clientY - origem.y) > LIMITE_ARRASTE_PX) return;
      const mv = viewer();
      if (!mv || typeof mv.positionAndNormalFromPoint !== "function") return;
      const acerto = mv.positionAndNormalFromPoint(e.clientX, e.clientY);
      const vista = capturarVista();
      if (!acerto || !vista) return;
      onColocarRef.current?.({ posicao: vetorParaTexto(acerto.position), normal: vetorParaTexto(acerto.normal), ...vista });
    };
    el.addEventListener("pointerdown", aoPressionar);
    el.addEventListener("pointerup", aoSoltar);
    return () => {
      el.removeEventListener("pointerdown", aoPressionar);
      el.removeEventListener("pointerup", aoSoltar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- capturarVista só lê o elemento; os demais valores vêm por ref
  }, []);

  // Editor: arrastar um ponto sobre a superfície. O pressionar é interceptado na fase de captura para que o
  // model-viewer não gire o modelo junto; o ponto segue o cursor e o clique simples continua selecionando.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const aoPressionarPonto = (e: PointerEvent) => {
      if (!onMoverRef.current || modoColocarRef.current) return;
      const alvo = e.target instanceof Element ? e.target.closest("[data-ponto-id]") : null;
      const id = alvo?.getAttribute("data-ponto-id");
      if (!id) return;
      e.stopPropagation();
      onSelecionarRef.current?.(id);
      const origem = { x: e.clientX, y: e.clientY };
      let arrastou = false;
      const mover = (ev: PointerEvent) => {
        if (!arrastou && Math.hypot(ev.clientX - origem.x, ev.clientY - origem.y) <= LIMITE_ARRASTE_PX) return;
        arrastou = true;
        const mv = viewer();
        if (!mv || typeof mv.positionAndNormalFromPoint !== "function") return;
        const acerto = mv.positionAndNormalFromPoint(ev.clientX, ev.clientY);
        if (acerto) onMoverRef.current?.(id, { posicao: vetorParaTexto(acerto.position), normal: vetorParaTexto(acerto.normal) });
      };
      const soltar = () => {
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerup", soltar);
        window.removeEventListener("pointercancel", soltar);
      };
      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
    };
    el.addEventListener("pointerdown", aoPressionarPonto, true);
    return () => el.removeEventListener("pointerdown", aoPressionarPonto, true);
  }, []);

  // Ponto selecionado: a câmera se orienta sozinha até a vista gravada (o model-viewer anima a transição)
  useEffect(() => {
    const mv = viewer();
    const ponto = pontos.find((p) => p.id === selecionadoId);
    if (!mv || !ponto) return;
    if (ponto.alvo) mv.cameraTarget = ponto.alvo;
    if (ponto.orbita) mv.cameraOrbit = ponto.orbita;
    // Pontos antigos não têm zoom gravado: voltam ao enquadramento padrão em vez de herdar o zoom do ponto anterior
    if (ponto.orbita) mv.fieldOfView = ponto.fov ? `${ponto.fov}deg` : "auto";
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage à troca do ponto selecionado
  }, [selecionadoId]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className ?? ""}`}
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)", cursor: modoColocar ? "crosshair" : undefined }}
    >
      <model-viewer
        ref={ref}
        src={pronta ? src : undefined}
        alt={alt}
        camera-controls
        touch-action="pan-y"
        loading="lazy"
        shadow-intensity="0.6"
        interaction-prompt="auto"
        interpolation-decay="120"
        style={{ width: "100%", height: "100%", minHeight: 320, display: "block", background: "transparent" }}
      >
        {pontos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            slot={`hotspot-${p.id}`}
            data-position={p.posicao}
            data-normal={p.normal ?? undefined}
            data-visibility-attribute="visible"
            data-ponto-id={p.id}
            aria-label={`Punto ${i + 1}`}
            aria-pressed={p.id === selecionadoId}
            onClick={() => onSelecionar?.(p.id)}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold opacity-30 transition-all data-visible:opacity-100 ${onMoverPonto ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${p.id === selecionadoId ? "scale-125" : ""}`}
            style={{
              touchAction: onMoverPonto ? "none" : undefined,
              backgroundColor: p.id === selecionadoId ? "var(--accent)" : "var(--bg-surface)",
              borderColor: "var(--accent)",
              color: p.id === selecionadoId ? "white" : "var(--accent)",
            }}
          >
            {i + 1}
          </button>
        ))}
      </model-viewer>
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
      {children}
    </div>
  );
}
