"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import { ThemeAwareCapa } from "./ThemeAwareCapa";

type Disciplina = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor_destaque: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  _count: { areas: number };
};

type Props = {
  cursoSlug: string;
  cursoNome: string;
  accentColor: string;
  disciplinas: Disciplina[];
};

export function CursoDisciplinas({ cursoSlug, cursoNome, accentColor, disciplinas }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? disciplinas.filter(
        (d) =>
          d.nome.toLowerCase().includes(search.toLowerCase()) ||
          d.descricao?.toLowerCase().includes(search.toLowerCase())
      )
    : disciplinas;

  return (
    <div>
      {/* ── Barra de navegação ─────────────────────────────── */}
      <div
        className="sticky top-0 z-20 w-full border-b"
        style={{
          height: 48,
          backgroundColor: "var(--bg-nav-bar)",
          borderColor: "var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between gap-4 h-full px-4 lg:px-8 max-w-5xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link href="/cursos" className="breadcrumb-link">
              Cursos
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{cursoNome}</span>
          </nav>

          <div className="relative w-52">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca..."
              className="w-full rounded-md border py-1.5 pl-3 pr-8 text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <Search
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Conteúdo ───────────────────────────────────────── */}
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto">

        <h1 className="text-2xl font-bold mb-6" style={{ color: accentColor }}>
          {cursoNome}
        </h1>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-10 w-10 mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {search ? `Sin resultados para "${search}"` : "Sin materias disponibles."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((disciplina) => {
              const color = disciplina.cor_destaque ?? accentColor;
              const hasCapa = !!(disciplina.capa_url || disciplina.capa_url_light);
              return (
                <Link
                  key={disciplina.id}
                  href={`/cursos/${cursoSlug}/${disciplina.slug}`}
                  className="group flex rounded-xl overflow-hidden transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  {/* Thumbnail 1:1 */}
                  <div className="relative shrink-0 overflow-hidden" style={{ width: 128, aspectRatio: "1/1" }}>
                    {hasCapa ? (
                      <ThemeAwareCapa
                        capaUrlDark={disciplina.capa_url}
                        capaUrlLight={disciplina.capa_url_light}
                        alt={disciplina.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${color}22 0%, ${color}55 100%)`,
                        }}
                      >
                        {disciplina.icone ? (
                          <span className="text-3xl">{disciplina.icone}</span>
                        ) : (
                          <BookOpen className="h-8 w-8 opacity-40" style={{ color }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between px-4 py-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <p
                        className="font-bold text-base leading-snug group-hover:underline"
                        style={{ color: accentColor }}
                      >
                        {disciplina.nome}
                      </p>
                      {disciplina.descricao && (
                        <p
                          className="text-xs leading-relaxed line-clamp-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {disciplina.descricao}
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
                      {disciplina._count.areas}{" "}
                      {disciplina._count.areas === 1 ? "unidad" : "unidades"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
