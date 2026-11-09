"use client";

import { useState } from "react";
import { Box, Play, X } from "lucide-react";
import { ModeloViewer } from "@/components/student/ModeloViewer";

export type PontoParaAluno = {
  id: string;
  titulo: string;
  texto: string | null;
  posicao: string;
  normal: string | null;
  orbita: string | null;
  alvo: string | null;
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

// O modelo (e a biblioteca de 3D) só são baixados quando o aluno pede para vê-lo: poupa tráfego e deixa a página leve
function Cartao({ modelo, idPrimeiro }: { modelo: ModeloParaAluno; idPrimeiro?: string }) {
  const [aberto, setAberto] = useState(false);
  const [pontoId, setPontoId] = useState<string | null>(null);
  const ponto = modelo.pontos.find((p) => p.id === pontoId) ?? null;
  const atribuicao = [modelo.creditos, modelo.licenca].filter(Boolean).join(" · ");

  return (
    <figure id={idPrimeiro} className="flex flex-col gap-2">
      {aberto ? (
        <>
          <ModeloViewer
            src={modelo.url} alt={modelo.titulo} className="h-[420px]"
            pontos={modelo.pontos} selecionadoId={pontoId} onSelecionar={setPontoId}
          >
            {ponto && (
              <div
                role="dialog" aria-label={ponto.titulo}
                className="absolute inset-x-3 bottom-3 max-h-[60%] overflow-y-auto rounded-xl p-4 shadow-lg"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--accent)" }}
              >
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>
                    {modelo.pontos.findIndex((p) => p.id === ponto.id) + 1}
                  </span>
                  <h3 className="flex-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ponto.titulo}</h3>
                  <button type="button" onClick={() => setPontoId(null)} aria-label="Cerrar explicación" className="shrink-0 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {ponto.texto && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ponto.texto}</p>}
              </div>
            )}
          </ModeloViewer>
          {modelo.pontos.length > 0 && (
            <ol className="flex flex-wrap gap-2" aria-label="Puntos del modelo">
              {modelo.pontos.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button" onClick={() => setPontoId(p.id)} aria-pressed={p.id === pontoId}
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
          )}
        </>
      ) : (
        <button
          type="button" onClick={() => setAberto(true)} aria-label={`Ver ${modelo.titulo} en 3D`}
          className="group flex h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl transition-colors hover:border-[var(--accent)]"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          <Box className="h-10 w-10 opacity-40" style={{ color: "var(--accent)" }} aria-hidden="true" />
          <span className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--accent)" }}>
            <Play className="h-4 w-4" aria-hidden="true" /> Ver en 3D
          </span>
        </button>
      )}
      <figcaption>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{modelo.titulo}</p>
        {modelo.descricao && <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{modelo.descricao}</p>}
        {atribuicao && <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>Modelo: {atribuicao}</p>}
      </figcaption>
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
