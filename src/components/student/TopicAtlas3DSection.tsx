"use client";

import { useState } from "react";
import { Box, Play } from "lucide-react";
import { ModeloViewer } from "@/components/student/ModeloViewer";

export type ModeloParaAluno = {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  licenca: string | null;
  creditos: string | null;
};

// O modelo (e a biblioteca de 3D) só são baixados quando o aluno pede para vê-lo: poupa tráfego e deixa a página leve
function Cartao({ modelo, idPrimeiro }: { modelo: ModeloParaAluno; idPrimeiro?: string }) {
  const [aberto, setAberto] = useState(false);
  const atribuicao = [modelo.creditos, modelo.licenca].filter(Boolean).join(" · ");

  return (
    <figure id={idPrimeiro} className="flex flex-col gap-2">
      {aberto ? (
        <ModeloViewer src={modelo.url} alt={modelo.titulo} className="h-[420px]" />
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
