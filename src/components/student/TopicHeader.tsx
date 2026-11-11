import type { ReactNode } from "react";
import { Target } from "lucide-react";
import type { ParteDoTopico, StatusTopico } from "@/lib/progresso";
import { StatusBadgeConDica } from "@/components/student/StatusBadgeConDica";
import { RichOrPlain } from "@/components/student/RichOrPlain";

interface TopicHeaderProps {
  titulo: string;
  objetivo?: string | null;
  descricaoCurta?: string | null;
  // null: o tópico não tem parte mensurável (artigo ou quiz), então não mostra status
  status?: StatusTopico | null;
  // Partes que compõem o status, para explicar ao aluno o que falta para completar o tema
  partes?: ParteDoTopico[];
  // Botão de guardar o tópico em uma carpeta de Mi plan
  acaoGuardar?: ReactNode;
}

export function TopicHeader({ titulo, objetivo, descricaoCurta, status = null, partes = [], acaoGuardar }: TopicHeaderProps) {
  return (
    <>
      {/* Título + bookmark */}
      <div className="flex items-start gap-3 mb-3">
        <h1 className="flex-1 text-2xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
          {titulo}
        </h1>
        {acaoGuardar}
      </div>

      {/* Badge de status + explicação do que falta (vídeo assistido, artigo lido, quiz aprovado) */}
      <div className="mb-8">
        {status && <StatusBadgeConDica status={status} partes={partes} />}
      </div>

      {/* Objetivos de aprendizaje */}
      {objetivo && (
        <div
          id="objetivo"
          className="rounded-xl p-5 mb-8"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-surface))",
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          }}
        >
          <h2 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            <Target className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
            Objetivos de aprendizaje
          </h2>
          <RichOrPlain text={objetivo} className="text-base" color="var(--text-secondary)" />
        </div>
      )}

      {/* Descrição curta */}
      {descricaoCurta && !objetivo && (
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          {descricaoCurta}
        </p>
      )}
    </>
  );
}
