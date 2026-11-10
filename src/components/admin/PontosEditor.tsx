"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MousePointerClick, Plus, Trash2, X } from "lucide-react";
import { ModeloViewer, type ColocacaoNoModelo, type ModeloViewerControle, type PosicaoNoModelo, type VistaCamera } from "@/components/student/ModeloViewer";
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
  fov: number | null;
};

interface PontosEditorProps {
  modeloId: string;
  src: string;
  titulo: string;
  pontos: PontoEditavel[];
}

const CAMPO = "w-full px-3 rounded-lg text-sm outline-none";
const ESTILO_CAMPO = { backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" };

// Editor de pontos. O admin arrasta o ponto sobre o modelo, gira e dá zoom até a vista desejada e salva:
// o que estiver na tela (posição do ponto + câmera) é exatamente o que o aluno verá ao clicar no ponto.
export function PontosEditor({ modeloId, src, titulo, pontos }: PontosEditorProps) {
  const router = useRouter();
  const controle = useRef<ModeloViewerControle | null>(null);
  const [colocando, setColocando] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  // Posições arrastadas ainda não guardadas (só existem na tela até o admin salvar o ponto)
  const [pendentes, setPendentes] = useState<Record<string, PosicaoNoModelo>>({});
  const [aExcluir, setAExcluir] = useState<PontoEditavel | null>(null);
  const [ocupado, iniciar] = useTransition();

  const pontosNaTela = pontos.map((p) => (pendentes[p.id] ? { ...p, ...pendentes[p.id] } : p));

  function aoColocar(c: ColocacaoNoModelo) {
    setColocando(false);
    iniciar(async () => {
      const r = await criarPonto3d(modeloId, { titulo: `Punto ${pontos.length + 1}`, ...c });
      if (!r.ok) return void toast.error(r.erro);
      setSelecionadoId(r.id);
      toast.success("Punto creado: ponle título y texto");
      router.refresh();
    });
  }

  function descartar(id: string) {
    setPendentes((atual) => Object.fromEntries(Object.entries(atual).filter(([chave]) => chave !== id)));
  }

  function excluir(ponto: PontoEditavel) {
    iniciar(async () => {
      const r = await excluirPonto3d(ponto.id);
      setAExcluir(null);
      if (!r.ok) return void toast.error(r.erro);
      if (selecionadoId === ponto.id) setSelecionadoId(null);
      descartar(ponto.id);
      toast.success("Punto eliminado");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ModeloViewer
        src={src} alt={titulo} className="h-[460px]"
        pontos={pontosNaTela} selecionadoId={selecionadoId} onSelecionar={setSelecionadoId}
        modoColocar={colocando} onColocar={aoColocar} controleRef={controle}
        onMoverPonto={(id, posicao) => setPendentes((atual) => ({ ...atual, [id]: posicao }))}
      />

      {colocando ? (
        <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm" style={{ border: "1px solid var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-base))", color: "var(--text-primary)" }}>
          <span className="inline-flex items-center gap-2"><MousePointerClick className="h-4 w-4" style={{ color: "var(--accent)" }} aria-hidden="true" />
            Gira el modelo hasta la vista que verá el alumno y haz clic sobre la superficie.
          </span>
          <button type="button" onClick={() => setColocando(false)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
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
            onClick={() => setColocando(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar punto
          </LoadingButton>
        </div>
      )}

      {pontos.length > 0 && (
        <ol className="flex flex-col gap-2">
          {pontos.map((p, i) => (
            <PontoCard
              key={`${p.id}:${p.titulo}:${p.texto ?? ""}:${p.posicao}:${p.orbita ?? ""}:${p.fov ?? ""}`}
              numero={i + 1} ponto={p} aberto={selecionadoId === p.id}
              posicaoPendente={pendentes[p.id] ?? null}
              capturarVista={() => controle.current?.capturarVista() ?? null}
              aoAlternar={() => setSelecionadoId((atual) => (atual === p.id ? null : p.id))}
              aoGuardar={() => descartar(p.id)}
              aoDescartar={() => descartar(p.id)}
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
  posicaoPendente: PosicaoNoModelo | null;
  capturarVista: () => VistaCamera | null;
  aoAlternar: () => void;
  aoGuardar: () => void;
  aoDescartar: () => void;
  aoExcluir: () => void;
}

function PontoCard({ numero, ponto, aberto, ocupado, posicaoPendente, capturarVista, aoAlternar, aoGuardar, aoDescartar, aoExcluir }: PontoCardProps) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(ponto.titulo);
  const [texto, setTexto] = useState(ponto.texto ?? "");
  const [salvando, iniciar] = useTransition();

  // Guarda título, texto, a posição em que o ponto está na tela e a câmera atual (ângulo, centro e zoom)
  function salvar() {
    const vista = capturarVista();
    if (!vista) return void toast.error("El modelo aún no está listo");
    iniciar(async () => {
      const posicao = posicaoPendente ?? { posicao: ponto.posicao, normal: ponto.normal ?? "" };
      const r = await atualizarPonto3d(ponto.id, { titulo, texto, posicao: posicao.posicao, normal: posicao.normal || null, ...vista });
      if (!r.ok) return void toast.error(r.erro);
      aoGuardar();
      toast.success("Punto guardado con la posición y el zoom actuales");
      router.refresh();
    });
  }

  return (
    <li className="rounded-lg" style={{ border: `1px solid ${aberto ? "var(--accent)" : "var(--border)"}`, backgroundColor: "var(--bg-base)" }}>
      <button type="button" onClick={aoAlternar} aria-expanded={aberto} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>{numero}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ponto.titulo}</span>
        {posicaoPendente && <span className="shrink-0 text-[10px] font-semibold" style={{ color: "var(--warning)" }}>Sin guardar</span>}
        {!ponto.orbita && !posicaoPendente && <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>Sin vista</span>}
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 px-3 pb-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="pt-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Arrastra el punto sobre el modelo para moverlo. Gira y acércate hasta la vista que verá el alumno y pulsa «Guardar punto»:
            se guardan la posición del punto y el zoom que tengas en pantalla.
          </p>
          <div>
            <label htmlFor={`ponto-titulo-${ponto.id}`} className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
            <input id={`ponto-titulo-${ponto.id}`} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={TITULO_PONTO_MAX} className={`${CAMPO} h-9`} style={ESTILO_CAMPO} />
          </div>
          <div>
            <label htmlFor={`ponto-texto-${ponto.id}`} className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Explicación para el alumno</label>
            <textarea id={`ponto-texto-${ponto.id}`} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={TEXTO_PONTO_MAX} rows={4} className={`${CAMPO} py-2 resize-y`} style={ESTILO_CAMPO} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LoadingButton className="w-auto px-4 py-1.5" loading={salvando} loadingText="Guardando…" disabled={ocupado} onClick={salvar}>Guardar punto</LoadingButton>
            {posicaoPendente && (
              <LoadingButton variant="secondary" className="w-auto px-3 py-1.5" disabled={salvando} onClick={aoDescartar}>Descartar movimiento</LoadingButton>
            )}
            <button type="button" onClick={aoExcluir} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ color: "var(--error)", border: "1px solid var(--error)" }}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
