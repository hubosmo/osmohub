import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TopicLink = { slug: string; titulo: string };

interface TopicPrevNextProps {
  areaPath: string;
  prevTopico: TopicLink | null;
  nextTopico: TopicLink | null;
}

export function TopicPrevNext({ areaPath, prevTopico, nextTopico }: TopicPrevNextProps) {
  return (
    <div id="continua" className="mt-14 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
      <h2 className="text-base font-semibold mb-5" style={{ color: "var(--accent)" }}>
        Continúa tu aprendizaje
      </h2>
      <div className="flex gap-3 flex-wrap">
        {prevTopico ? (
          <Link
            href={`${areaPath}/${prevTopico.slug}`}
            className="group flex items-center gap-2 rounded-xl px-4 py-3 flex-1 min-w-[160px] max-w-xs transition-all hover:shadow-sm"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
          >
            <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" style={{ color: "var(--text-muted)" }} />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Anterior</p>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{prevTopico.titulo}</p>
            </div>
          </Link>
        ) : <div className="flex-1 max-w-xs" />}

        {nextTopico && (
          <Link
            href={`${areaPath}/${nextTopico.slug}`}
            className="group flex items-center gap-2 rounded-xl px-4 py-3 flex-1 min-w-[160px] max-w-xs ml-auto text-right transition-all hover:shadow-sm"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Siguiente</p>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{nextTopico.titulo}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-muted)" }} />
          </Link>
        )}
      </div>
    </div>
  );
}
