"use client";

import { useState } from "react";

type TablaRow = { id: string; categoria: string; conteudo: string; valores_extra: unknown };
type TablaData = { id: string; titulo: string; tipo: string; cabecalhos: unknown; linhas: TablaRow[] };

export function TablasSection({ tabelas }: { tabelas: TablaData[] }) {
  return (
    <div className="flex flex-col gap-5">
      {tabelas.map((tabela) => (
        <TablaCard key={tabela.id} tabela={tabela} />
      ))}
    </div>
  );
}

function TablaCard({ tabela }: { tabela: TablaData }) {
  const [revealed, setRevealed] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<string>>(new Set());

  const extraHeaders: string[] = Array.isArray(tabela.cabecalhos) ? (tabela.cabecalhos as string[]) : [];
  const contentCols = 1 + extraHeaders.length; // "Contenido" + extras

  function toggleRow(id: string) {
    if (revealed) return; // all already shown
    setRevealedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleRevealAll() {
    setRevealed(true);
    setRevealedRows(new Set(tabela.linhas.map((l) => l.id)));
  }

  function handleHide() {
    setRevealed(false);
    setRevealedRows(new Set());
  }

  const allShown = revealed;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Table title header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg-surface))",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          {tabela.titulo}
        </p>
        <button
          onClick={allShown ? handleHide : handleRevealAll}
          className="text-xs font-medium transition-colors shrink-0 ml-4"
          style={{ color: "var(--accent)" }}
        >
          {allShown ? "Ocultar" : "Mostrar todo"}
        </button>
      </div>

      {/* Column headers (only when extra columns exist) */}
      {extraHeaders.length > 0 && (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `180px repeat(${contentCols}, 1fr)`,
            backgroundColor: "var(--bg-base)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: "var(--text-muted)", borderRight: "1px solid var(--border)" }}>
            Concepto
          </div>
          <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: "var(--text-muted)", borderRight: extraHeaders.length > 0 ? "1px solid var(--border)" : "none" }}>
            Descripción
          </div>
          {extraHeaders.map((h, i) => (
            <div key={i} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--text-muted)", borderRight: i < extraHeaders.length - 1 ? "1px solid var(--border)" : "none" }}>
              {h}
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      <div>
        {tabela.linhas.map((linha, li) => {
          const isRowRevealed = revealedRows.has(linha.id) || revealed;
          const extras: string[] = Array.isArray(linha.valores_extra) ? (linha.valores_extra as string[]) : [];
          const isLast = li === tabela.linhas.length - 1;

          return (
            <div
              key={linha.id}
              className="grid cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: `180px repeat(${contentCols}, 1fr)`,
                borderBottom: isLast ? "none" : "1px solid var(--border)",
              }}
              onClick={() => toggleRow(linha.id)}
              title={isRowRevealed ? undefined : "Clic para revelar"}
            >
              {/* Key column */}
              <div
                className="px-4 py-3 text-xs font-semibold align-top self-start"
                style={{ color: "var(--text-primary)", borderRight: "1px solid var(--border)" }}
              >
                {linha.categoria}
              </div>

              {/* Content column */}
              <div
                className="px-4 py-3 text-xs leading-relaxed self-start transition-all"
                style={{
                  color: "var(--text-secondary)",
                  borderRight: extraHeaders.length > 0 ? "1px solid var(--border)" : "none",
                  filter: isRowRevealed ? "none" : "blur(5px)",
                  userSelect: isRowRevealed ? "text" : "none",
                  opacity: isRowRevealed ? 1 : 0.6,
                }}
              >
                {linha.conteudo}
              </div>

              {/* Extra columns */}
              {extraHeaders.map((_, ci) => (
                <div
                  key={ci}
                  className="px-4 py-3 text-xs leading-relaxed self-start transition-all"
                  style={{
                    color: "var(--text-secondary)",
                    borderRight: ci < extraHeaders.length - 1 ? "1px solid var(--border)" : "none",
                    filter: isRowRevealed ? "none" : "blur(5px)",
                    userSelect: isRowRevealed ? "text" : "none",
                    opacity: isRowRevealed ? 1 : 0.6,
                  }}
                >
                  {extras[ci] ?? ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
