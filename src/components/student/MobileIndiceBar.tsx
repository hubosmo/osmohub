"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, ChevronRight,
  PlayCircle, BookOpen, ImageIcon, Table2, HelpCircle,
} from "lucide-react";

type Section = { id: string; label: string };

const ICON: Record<string, React.ReactNode> = {
  video:        <PlayCircle className="h-4 w-4 shrink-0" />,
  articulo:     <BookOpen className="h-4 w-4 shrink-0" />,
  atlas:        <ImageIcon className="h-4 w-4 shrink-0" />,
  tablas:       <Table2 className="h-4 w-4 shrink-0" />,
  cuestionario: <HelpCircle className="h-4 w-4 shrink-0" />,
};

export function MobileIndiceBar({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="lg:hidden sticky z-10 border-b"
      style={{ top: 48, backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ color: "var(--text-primary)" }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {open
            ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
          <span className="text-sm font-semibold">Índice</span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {sections.length + 1} secciones
        </span>
      </button>

      {/* Lista de secciones */}
      {open && (
        <div className="border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 border-b transition-colors"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                {ICON[s.id] ?? <ChevronRight className="h-4 w-4 shrink-0" />}
              </span>
              <span className="text-sm">{s.label}</span>
            </a>
          ))}
          <a
            href="#continua"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span className="text-sm">Continúa tu aprendizaje</span>
          </a>
        </div>
      )}
    </div>
  );
}
