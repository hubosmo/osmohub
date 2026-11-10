"use client";

import { useState } from "react";
import { Box, Play, X } from "lucide-react";
import { CollapsibleCaption } from "@/components/student/CollapsibleCaption";
import { ModeloViewer } from "@/components/student/ModeloViewer";

export type PontoParaAluno = {
  id: string;
  titulo: string;
  texto: string | null;
  posicao: string;
  normal: string | null;
  orbita: string | null;
  alvo: string | null;
  fov: number | null;
};

export type ModeloParaAluno = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  licenca: string | null;
  creditos: string | null;
  pontos: PontoParaAluno[];
};

// Pills dos pontos: tocar em uma leva a câmera até o ponto no modelo
function PontosEmPills({ pontos, pontoId, aoEscolher }: { pontos: PontoParaAluno[]; pontoId: string | null; aoEscolher: (id: string) => void }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Puntos del modelo">
      {pontos.map((p, i) => (
        <li key={p.id}>
          <button
            type="button" onClick={() => aoEscolher(p.id)} aria-pressed={p.id === pontoId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-medium transition-colors"
            style={{
              border: `1px solid ${p.id === pontoId ? "var(--accent)" : "var(--border)"}`,
              backgroundColor: p.id === pontoId ? "color-mix(in srgb, var(--accent) 12%, var(--bg-surface))" : "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>{i + 1}</span>
            {p.titulo}
          </button>
        </li>
      ))}
    </ol>
  );
}

// O modelo (e a biblioteca de 3D) só são baixados quando o aluno pede para vê-lo: poupa tráfego e deixa a página leve
function Cartao({ modelo, idPrimeiro }: { modelo: ModeloParaAluno; idPrimeiro?: string }) {
  const [aberto, setAberto] = useState(false);
  const [pontoId, setPontoId] = useState<string | null>(null);
  const ponto = modelo.pontos.find((p) => p.id === pontoId) ?? null;
  const atribuicao = [modelo.creditos, modelo.licenca].filter(Boolean).join(" · ");
  const total = modelo.pontos.length;
  const temDetalhes = !!modelo.descricao || !!atribuicao || total > 0;

  // Escolher um ponto pela lista também abre o modelo, se ainda não estiver aberto
  function escolherPonto(id: string) {
    setAberto(true);
    setPontoId(id);
  }

  return (
    <figure id={idPrimeiro}>
      {/* Mesma estrutura das outras seções: mídia em cima e barra de legenda que se expande embaixo, no mesmo cartão */}
      <div className="rounded-xl" style={{ border: "1px solid var(--border)", overflow: "clip" }}>
        {aberto ? (
          <ModeloViewer
            src={modelo.url} alt={modelo.titulo} className="h-[420px]" semBorda
            pontos={modelo.pontos} selecionadoId={pontoId} onSelecionar={setPontoId}
            legenda={ponto && (
              // Caixa compacta ao lado do ponto: o título e o texto ficam perto do que o aluno está olhando
              <div
                role="dialog" aria-label={ponto.titulo}
                className="rounded-lg p-2.5 shadow-lg"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--accent)" }}
              >
                <div className="flex items-start gap-1.5">
                  <h3 className="flex-1 text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{ponto.titulo}</h3>
                  <button type="button" onClick={() => setPontoId(null)} aria-label="Cerrar explicación" className="shrink-0 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                {ponto.texto && <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-line text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>{ponto.texto}</p>}
              </div>
            )}
          />
        ) : (
          <button
            type="button" onClick={() => setAberto(true)} aria-label={`Ver ${modelo.titulo} en 3D`}
            className="group flex h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <Box className="h-10 w-10 opacity-40 transition-[opacity,transform] duration-200 group-hover:scale-110 group-hover:opacity-70" style={{ color: "var(--accent)" }} aria-hidden="true" />
            <span
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-[filter,transform] duration-200 group-hover:brightness-110 group-active:scale-[0.98]"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Play className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" /> Ver en 3D
            </span>
          </button>
        )}

        <CollapsibleCaption
          title={modelo.titulo}
          meta={total > 0 ? `${total} ${total === 1 ? "punto" : "puntos"}` : undefined}
        >
          {temDetalhes ? (
            <div className="flex flex-col gap-3">
              {modelo.descricao && <p>{modelo.descricao}</p>}
              {total > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Toca un punto para verlo en el modelo</p>
                  <PontosEmPills pontos={modelo.pontos} pontoId={pontoId} aoEscolher={escolherPonto} />
                </div>
              )}
              {atribuicao && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Modelo: {atribuicao}</p>}
            </div>
          ) : null}
        </CollapsibleCaption>
      </div>
    </figure>
  );
}

export function TopicAtlas3DSection({ modelos, firstItemId }: { modelos: ModeloParaAluno[]; firstItemId?: string }) {
  if (modelos.length === 0) return null;
  return (
    <div className="flex flex-col gap-8">
      {modelos.map((m, i) => <Cartao key={m.id} modelo={m} idPrimeiro={i === 0 ? firstItemId : undefined} />)}
    </div>
  );
}
