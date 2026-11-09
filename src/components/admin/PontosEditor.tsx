"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Crosshair, MousePointerClick, Plus, Trash2, X } from "lucide-react";
import { ModeloViewer, type ColocacaoNoModelo, type ModeloViewerControle } from "@/components/student/ModeloViewer";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { atualizarPonto3d, criarPonto3d, excluirPonto3d } from "@/lib/actions/content-modelos3d-pontos";
import { MAX_PONTOS_POR_MODELO, TEXTO_PONTO_MAX, TITULO_PONTO_MAX } from "@/lib/pontos3d";

export type PontoEditavel = {
  id: string;
  titulo: string;
  texto: string | null;
  posicao: string;
  normal: string | null;
  orbita: string | null;
  alvo: string | null;
};

interface PontosEditorProps {
  modeloId: string;
  src: string;
  titulo: string;
  pontos: PontoEditavel[];
}

type Modo = { tipo: "nenhum" } | { tipo: "novo" } | { tipo: "mover"; id: string };

const CAMPO = "w-full px-3 rounded-lg text-sm outline-none";
const ESTILO_CAMPO = { backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" };

// Editor de pontos: o admin gira o modelo até a vista desejada e clica na superfície; o clique grava a posição e a câmera
export function PontosEditor({ modeloId, src, titulo, pontos }: PontosEditorProps) {
  const router = useRouter();
  const controle = useRef<ModeloViewerControle | null>(null);
  const [modo, setModo] = useState<Modo>({ tipo: "nenhum" });
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [aExcluir, setAExcluir] = useState<PontoEditavel | null>(null);
  const [ocupado, iniciar] = useTransition();

  function aoColocar(c: ColocacaoNoModelo) {
    const atual = modo;
    setModo({ tipo: "nenhum" });
    iniciar(async () => {
      if (atual.tipo === "mover") {
        const ponto = pontos.find((p) => p.id === atual.id);
        if (!ponto) return;
        const r = await atualizarPonto3d(ponto.id, { titulo: ponto.titulo, texto: ponto.texto, ...c });
        if (!r.ok) return void toast.error(r.erro);
        toast.success("Punto reubicado");
      } else if (atual.tipo === "novo") {
        const r = await criarPonto3d(modeloId, { titulo: `Punto ${pontos.length + 1}`, ...c });
        if (!r.ok) return void toast.error(r.erro);
        setSelecionadoId(r.id);
        toast.success("Punto creado: ponle título y texto");
      }
      router.refresh();
    });
  }

  function excluir(ponto: PontoEditavel) {
    iniciar(async () => {
      const r = await excluirPonto3d(ponto.id);
      setAExcluir(null);
      if (!r.ok) return void toast.error(r.erro);
      if (selecionadoId === ponto.id) setSelecionadoId(null);
      toast.success("Punto eliminado");
      router.refresh();
    });
  }

  const colocando = modo.tipo !== "nenhum";

  return (
    <div className="flex flex-col gap-3">
      <ModeloViewer
        src={src} alt={titulo} className="h-[460px]"
        pontos={pontos} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId}
        modoColocar={colocando} onColocar={aoColocar} controleRef={controle}
      />

      {colocando ? (
        <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-base))", color: "var(--text-primary)" }}>
          <span className="inline-flex items-center gap-2"><MousePointerClick className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
            Gira el modelo hasta la vista que verá el alumno y haz clic sobre la superficie.
          </span>
          <button type="button" onClick={() => setModo({ tipo: "nenhum" })} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {pontos.length} de {MAX_PONTOS_POR_MODELO} puntos. El número que ve el alumno sigue el orden de la lista.
          </p>
          <LoadingButton
            className="w-auto px-4 py-2" loading={ocupado} disabled={pontos.length >= MAX_PONTOS_POR_MODELO}
            onClick={() => setModo({ tipo: "novo" })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar punto
          </LoadingButton>
        </div>
      )}

      {pontos.length > 0 && (
        <ol className="flex flex-col gap-2">
          {pontos.map((p, i) => (
            <PontoCard
              key={`${p.id}:${p.titulo}:${p.texto ?? ""}:${p.orbita ?? ""}`}
              numero={i + 1} ponto={p} aberto={selecionadoId === p.id}
              aoAlternar={() => setSelecionadoId((atual) => (atual === p.id ? null : p.id))}
              aoReposicionar={() => { setSelecionadoId(p.id); setModo({ tipo: "mover", id: p.id }); }}
              aoUsarVista={() => {
                const vista = controle.current?.capturarVista();
                if (!vista) return void toast.error("El modelo aún no está listo");
                iniciar(async () => {
                  const r = await atualizarPonto3d(p.id, { titulo: p.titulo, texto: p.texto, posicao: p.posicao, normal: p.normal, ...vista });
                  if (!r.ok) return void toast.error(r.erro);
                  toast.success("Vista de cámara guardada");
                  router.refresh();
                });
              }}
              aoExcluir={() => setAExcluir(p)}
              ocupado={ocupado}
            />
          ))}
        </ol>
      )}

      <ConfirmModal
        open={aExcluir !== null}
        message={`¿Eliminar el punto "${aExcluir?.titulo ?? ""}"? Esta acción no se puede deshacer.`}
        isPending={ocupado}
        onCancel={() => setAExcluir(null)}
        onConfirm={() => { if (aExcluir) excluir(aExcluir); }}
      />
    </div>
  );
}

interface PontoCardProps {
  numero: number;
  ponto: PontoEditavel;
  aberto: boolean;
  ocupado: boolean;
  aoAlternar: () => void;
  aoReposicionar: () => void;
  aoUsarVista: () => void;
  aoExcluir: () => void;
}

function PontoCard({ numero, ponto, aberto, ocupado, aoAlternar, aoReposicionar, aoUsarVista, aoExcluir }: PontoCardProps) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(ponto.titulo);
  const [texto, setTexto] = useState(ponto.texto ?? "");
  const [salvando, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      const r = await atualizarPonto3d(ponto.id, { titulo, texto, posicao: ponto.posicao, normal: ponto.normal, orbita: ponto.orbita, alvo: ponto.alvo });
      if (!r.ok) return void toast.error(r.erro);
      toast.success("Punto guardado");
      router.refresh();
    });
  }

  return (
    <li className="rounded-lg" style={{ border: `1px solid ${aberto ? "var(--accent)" : "var(--border)"}`, backgroundColor: "var(--bg-base)" }}>
      <button type="button" onClick={aoAlternar} aria-expanded={aberto} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>{numero}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ponto.titulo}</span>
        {!ponto.orbita && <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>Sin vista</span>}
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 px-3 pb-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="pt-3">
            <label htmlFor={`ponto-titulo-${ponto.id}`} className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
            <input id={`ponto-titulo-${ponto.id}`} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={TITULO_PONTO_MAX} className={`${CAMPO} h-9`} style={ESTILO_CAMPO} />
          </div>
          <div>
            <label htmlFor={`ponto-texto-${ponto.id}`} className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Explicación para el alumno</label>
            <textarea id={`ponto-texto-${ponto.id}`} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={TEXTO_PONTO_MAX} rows={4} className={`${CAMPO} py-2 resize-y`} style={ESTILO_CAMPO} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LoadingButton className="w-auto px-4 py-1.5" loading={salvando} loadingText="Guardando…" onClick={salvar}>Guardar punto</LoadingButton>
            <LoadingButton variant="secondary" className="w-auto px-3 py-1.5" disabled={ocupado} onClick={aoUsarVista}>
              <Crosshair className="h-4 w-4" aria-hidden="true" /> Usar la vista actual
            </LoadingButton>
            <LoadingButton variant="secondary" className="w-auto px-3 py-1.5" disabled={ocupado} onClick={aoReposicionar}>Reubicar en el modelo</LoadingButton>
            <button type="button" onClick={aoExcluir} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ color: "var(--error)", border: "1px solid var(--error)" }}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
