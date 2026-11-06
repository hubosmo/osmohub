import { Bookmark, Target } from "lucide-react";
import { ROTULO_STATUS, type StatusTopico } from "@/lib/progresso";
import { RichOrPlain } from "@/components/student/RichOrPlain";

interface TopicHeaderProps {
  titulo: string;
  objetivo?: string | null;
  descricaoCurta?: string | null;
  // null: o tópico não tem parte mensurável (artigo ou quiz), então não mostra status
  status?: StatusTopico | null;
}

const COR_STATUS: Record<StatusTopico, string> = {
  "incompleta": "var(--text-muted)",
  "em-progresso": "var(--accent)",
  "completa": "var(--success)",
};

export function TopicHeader({ titulo, objetivo, descricaoCurta, status = null }: TopicHeaderProps) {
  return (
    <>
      {/* Título + bookmark */}
      <div className="flex items-start gap-3 mb-3">
        <h1 className="flex-1 text-2xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
          {titulo}
        </h1>
        <button
          className="shrink-0 mt-1 transition-colors"
          aria-label="Guardar en mis favoritos"
          style={{ color: "var(--text-muted)" }}
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>

      {/* Badge de status: artigo lido e quiz aprovado */}
      <div className="mb-8">
        {status && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
            style={{ color: COR_STATUS[status], borderColor: status === "incompleta" ? "var(--border)" : COR_STATUS[status], backgroundColor: "var(--bg-elevated)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: COR_STATUS[status] }} />
            {ROTULO_STATUS[status]}
          </span>
        )}
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
