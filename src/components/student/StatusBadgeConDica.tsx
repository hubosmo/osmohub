"use client";

import { useId, useState } from "react";
import { Check, Circle } from "lucide-react";
import type { ParteDoTopico, StatusTopico } from "@/lib/progresso";
import { StatusBadge } from "@/components/student/StatusBadge";

// Selo de status com uma dica que explica o que falta para completar o tema.
// Abre ao passar o mouse, ao focar com o teclado e ao tocar (celular não tem hover).
export function StatusBadgeConDica({ status, partes }: { status: StatusTopico; partes: ParteDoTopico[] }) {
  const [aberto, setAberto] = useState(false);
  const id = useId();

  if (partes.length === 0) return <StatusBadge status={status} />;

  const titulo = status === "completa" ? "¡Tema completado!" : "Para completar este tema:";

  return (
    <div className="relative inline-block" onMouseEnter={() => setAberto(true)} onMouseLeave={() => setAberto(false)}>
      <button
        type="button"
        aria-describedby={aberto ? id : undefined}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        className="cursor-help rounded-full"
      >
        <StatusBadge status={status} />
      </button>

      {aberto && (
        <div
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg p-3 text-left shadow-xl"
          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>{titulo}</p>
          <ul className="flex flex-col gap-1.5">
            {partes.map((p) => (
              <li key={p.id} className="flex items-start gap-2 text-xs leading-snug">
                {p.feita
                  ? <Check className="mt-px h-3.5 w-3.5 shrink-0" style={{ color: "var(--success)" }} />
                  : <Circle className="mt-px h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />}
                <span style={{ color: p.feita ? "var(--text-muted)" : "var(--text-secondary)" }}>{p.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
