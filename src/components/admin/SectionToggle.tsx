"use client";

import { useState, useTransition } from "react";
import { toggleTopicoSection } from "@/lib/actions/content";

type Section = "video_ativo" | "artigo_ativo" | "atlas_ativo" | "tabelas_ativo";

interface Props {
  topicoId: string;
  section: Section;
  initialValue: boolean;
  hasContent: boolean;
}

export function SectionToggle({ topicoId, section, initialValue, hasContent }: Props) {
  const [isActive, setIsActive] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!hasContent) return;
    const next = !isActive;
    setIsActive(next);
    startTransition(() => toggleTopicoSection(topicoId, section, next));
  }

  const enabled = hasContent;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!enabled || isPending}
      title={!enabled ? "Agrega contenido para activar esta sección" : isActive ? "Visible para el alumno — clic para ocultar" : "Oculto para el alumno — clic para activar"}
      className="ml-auto flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full transition-all"
      style={{
        opacity: !enabled ? 0.4 : 1,
        cursor: !enabled ? "not-allowed" : "pointer",
        backgroundColor: isActive
          ? "color-mix(in srgb, #22C55E 15%, var(--bg-elevated))"
          : "var(--bg-elevated)",
        color: isActive ? "#22C55E" : "var(--text-muted)",
        border: `1px solid ${isActive ? "#22C55E55" : "var(--border)"}`,
      }}
    >
      {/* Dot indicator */}
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: isActive ? "#22C55E" : "var(--text-muted)" }}
      />
      {isPending ? "..." : isActive ? "Visible" : "Oculto"}
    </button>
  );
}
