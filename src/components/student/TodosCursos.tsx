"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, GraduationCap } from "lucide-react";
import { ThemeAwareCapa } from "./ThemeAwareCapa";

type Curso = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  cor_destaque: string | null;
  icone: string | null;
  _count: { disciplinas: number };
};

export function TodosCursos({ cursos }: { cursos: Curso[] }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? cursos.filter(
        (c) =>
          c.nome.toLowerCase().includes(search.toLowerCase()) ||
          c.descricao?.toLowerCase().includes(search.toLowerCase())
      )
    : cursos;

  return (
    <div>
      {/* Barra top: título + busca */}
      <div
        className="sticky top-0 z-20 w-full"
        style={{
          height: 48,
          backgroundColor: "var(--bg-nav-bar)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between gap-4 h-full px-4 lg:px-8 max-w-5xl mx-auto">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Cursos
          </p>
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

      {/* Grid de cursos */}
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto">
        {cursos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <GraduationCap className="h-12 w-12 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Sin cursos disponibles
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Los cursos se agregarán próximamente.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-2 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-xs underline"
              style={{ color: "var(--accent)" }}
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
          >
            {filtered.map((curso) => (
              <Link
                key={curso.id}
                href={`/cursos/${curso.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-surface)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                {/* Capa 9:16 */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "9/16" }}>
                  {(curso.capa_url || curso.capa_url_light) ? (
                    <ThemeAwareCapa
                      capaUrlDark={curso.capa_url}
                      capaUrlLight={curso.capa_url_light}
                      alt={curso.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-3"
                      style={{
                        background: curso.cor_destaque
                          ? `linear-gradient(160deg, ${curso.cor_destaque}33 0%, ${curso.cor_destaque}99 100%)`
                          : "linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)",
                      }}
                    >
                      {curso.icone ? (
                        <span className="text-5xl">{curso.icone}</span>
                      ) : (
                        <BookOpen
                          className="h-12 w-12 opacity-40"
                          style={{ color: curso.cor_destaque ?? "var(--accent)" }}
                        />
                      )}
                    </div>
                  )}

                  {/* Reflexo no hover */}
                  <div
                    className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover:translate-x-[200%]"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                      width: "60%",
                    }}
                  />

                  {/* Rodapé: contagem */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{
                      background: "linear-gradient(to top, var(--capa-overlay) 0%, transparent 100%)",
                    }}
                  >
                    <p className="text-white/70 text-xs">
                      {curso._count.disciplinas}{" "}
                      {curso._count.disciplinas === 1 ? "materia" : "materias"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
