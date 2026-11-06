"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { StatusBadge } from "@/components/student/StatusBadge";
import { marcarItemConcluidoAction, salvarTopicoNaPastaAction } from "@/lib/actions/pastas";
import type { StatusTopico } from "@/lib/progresso";

interface ItemPastaRowProps {
  pastaId: string;
  topicoId: string;
  titulo: string;
  descricao: string | null;
  href: string;
  concluido: boolean;
  status: StatusTopico | null;
}

export function ItemPastaRow({ pastaId, topicoId, titulo, descricao, href, concluido, status }: ItemPastaRowProps) {
  const [marcado, setMarcado] = useState(concluido);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function alternar() {
    const novo = !marcado;
    setMarcado(novo);
    setErro(null);
    iniciar(async () => {
      const r = await marcarItemConcluidoAction(pastaId, topicoId, novo);
      if (!r.ok) {
        setMarcado(!novo);
        setErro(r.erro);
      }
    });
  }

  function remover() {
    setErro(null);
    iniciar(async () => {
      const r = await salvarTopicoNaPastaAction(pastaId, topicoId, false);
      if (!r.ok) setErro(r.erro);
    });
  }

  return (
    <li className="rounded-xl px-4 py-3" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", opacity: pendente ? 0.7 : 1 }}>
      <div className="flex items-center gap-3">
        <button
          type="button" role="checkbox" aria-checked={marcado} onClick={alternar}
          aria-label={marcado ? "Marcar como pendiente" : "Marcar como completado"}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
          style={{ border: `1.5px solid ${marcado ? "var(--success)" : "var(--border)"}`, backgroundColor: marcado ? "var(--success)" : "transparent" }}
        >
          {marcado && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
        </button>

        <Link href={href} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" style={{ color: marcado ? "var(--text-muted)" : "var(--text-primary)", textDecoration: marcado ? "line-through" : "none" }}>
            {titulo}
          </p>
          {descricao && <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>{descricao}</p>}
        </Link>

        {status && <StatusBadge status={status} compacto />}

        <button
          type="button" onClick={remover} aria-label={`Quitar "${titulo}" de la carpeta`}
          className="shrink-0 cursor-pointer transition-opacity hover:opacity-70" style={{ color: "var(--text-muted)" }}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {erro && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--error)" }}>{erro}</p>}
    </li>
  );
}
