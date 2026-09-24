"use client";

import { useState, useEffect } from "react";

type TablaRow = { id: string; categoria: string; conteudo: string; valores_extra: unknown };
type TablaData = { id: string; titulo: string; tipo: string; cabecalhos: unknown; linhas: TablaRow[] };

export function TablasSection({ tabelas }: { tabelas: TablaData[] }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {tabelas.map((tabela) => (
        <TablaCard key={tabela.id} tabela={tabela} isMobile={isMobile} />
      ))}
    </div>
  );
}

function TablaCard({ tabela, isMobile }: { tabela: TablaData; isMobile: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<string>>(new Set());

  const extraHeaders: string[] = Array.isArray(tabela.cabecalhos) ? (tabela.cabecalhos as string[]) : [];
  const contentCols = 1 + extraHeaders.length;

  function toggleRow(id: string) {
    if (revealed) return;
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

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Cabeçalho do card */}
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
          onClick={revealed ? handleHide : handleRevealAll}
          className="text-xs font-medium transition-colors shrink-0 ml-4"
          style={{ color: "var(--accent)" }}
        >
          {revealed ? "Ocultar" : "Mostrar todo"}
        </button>
      </div>

      {/* Cabeçalhos de colunas — só no desktop e só quando há colunas extras */}
      {!isMobile && extraHeaders.length > 0 && (
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

      {/* Linhas */}
      <div>
        {tabela.linhas.map((linha, li) => {
          const isRowRevealed = revealedRows.has(linha.id) || revealed;
          const extras: string[] = Array.isArray(linha.valores_extra) ? (linha.valores_extra as string[]) : [];
          const isLast = li === tabela.linhas.length - 1;

          /* ── Layout mobile: empilhado ── */
          if (isMobile) {
            return (
              <div
                key={linha.id}
                className="cursor-pointer transition-colors"
                style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
                onClick={() => toggleRow(linha.id)}
                title={isRowRevealed ? undefined : "Toca para revelar"}
              >
                {/* Categoria como label */}
                <div
                  className="px-4 py-2 text-[11px] font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    backgroundColor: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {linha.categoria}
                </div>

                {/* Conteúdo — 2 colunas: bloco único; 3+ colunas: cada col com label */}
                {extraHeaders.length === 0 ? (
                  <div
                    className="px-4 py-3 text-xs leading-relaxed transition-all"
                    style={{
                      color: "var(--text-secondary)",
                      filter: isRowRevealed ? "none" : "blur(5px)",
                      userSelect: isRowRevealed ? "text" : "none",
                      opacity: isRowRevealed ? 1 : 0.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {linha.conteudo}
                  </div>
                ) : (
                  <div
                    className="transition-all"
                    style={{
                      filter: isRowRevealed ? "none" : "blur(5px)",
                      userSelect: isRowRevealed ? "text" : "none",
                      opacity: isRowRevealed ? 1 : 0.6,
                    }}
                  >
                    {/* Descrição */}
                    <div
                      className="px-4 py-2.5 text-xs leading-relaxed"
                      style={{
                        color: "var(--text-secondary)",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
                        style={{ color: "var(--text-muted)" }}>
                        Descripción
                      </span>
                      {linha.conteudo}
                    </div>
                    {/* Colunas extras — cada uma em seu bloco */}
                    {extras.map((v, ci) => (
                      <div
                        key={ci}
                        className="px-4 py-2.5 text-xs leading-relaxed"
                        style={{
                          color: "var(--text-secondary)",
                          borderBottom: ci < extras.length - 1 ? "1px solid var(--border)" : "none",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {extraHeaders[ci] && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
                            style={{ color: "var(--text-muted)" }}>
                            {extraHeaders[ci]}
                          </span>
                        )}
                        {v || "—"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          /* ── Layout desktop: grid 2 colunas ── */
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
              {/* Coluna de categoria — stretch para borda completar a linha */}
              <div
                className="px-4 py-3 text-xs font-semibold"
                style={{
                  color: "var(--text-primary)",
                  borderRight: "1px solid var(--border)",
                  alignSelf: "stretch",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {linha.categoria}
              </div>

              {/* Coluna de conteúdo */}
              <div
                className="px-4 py-3 text-xs leading-relaxed self-start transition-all"
                style={{
                  color: "var(--text-secondary)",
                  borderRight: extraHeaders.length > 0 ? "1px solid var(--border)" : "none",
                  filter: isRowRevealed ? "none" : "blur(5px)",
                  userSelect: isRowRevealed ? "text" : "none",
                  opacity: isRowRevealed ? 1 : 0.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {linha.conteudo}
              </div>

              {/* Colunas extras */}
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
                    whiteSpace: "pre-wrap",
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
