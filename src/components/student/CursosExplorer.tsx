"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, GraduationCap } from "lucide-react";

type DisciplinaItem = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor_destaque: string | null;
  _count: { areas: number };
};

type CursoItem = {
  id: string;
  slug: string;
  nome: string;
  icone: string | null;
  cor_destaque: string | null;
  disciplinas: DisciplinaItem[];
};

type DisciplinaFlat = DisciplinaItem & {
  cursoSlug: string;
  cursoNome: string;
};

export function CursosExplorer({ cursos }: { cursos: CursoItem[] }) {
  const [search, setSearch] = useState("");
  const [filtroSlug, setFiltroSlug] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const allDisciplinas = useMemo<DisciplinaFlat[]>(
    () =>
      cursos.flatMap((c) =>
        c.disciplinas.map((d) => ({ ...d, cursoSlug: c.slug, cursoNome: c.nome }))
      ),
    [cursos]
  );

  const filtered = useMemo(() => {
    let items = filtroSlug
      ? allDisciplinas.filter((d) => d.cursoSlug === filtroSlug)
      : allDisciplinas;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.nome.toLowerCase().includes(q) ||
          d.descricao?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [allDisciplinas, filtroSlug, search]);

  const isEmpty = allDisciplinas.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Cursos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Explora nuestras materias y empieza a aprender
        </p>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: focused ? "var(--accent)" : "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Buscar materias, temas o artículos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-11 pl-11 pr-4 rounded-xl text-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: `1.5px solid ${focused ? "var(--accent)" : "var(--border)"}`,
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.15s",
          }}
        />
      </div>

      {/* Navegar por temas */}
      {cursos.length > 0 && (
        <div className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Navegar por temas
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroSlug(null)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor:
                  filtroSlug === null ? "var(--accent)" : "var(--bg-elevated)",
                color: filtroSlug === null ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${
                  filtroSlug === null ? "var(--accent)" : "var(--border)"
                }`,
              }}
            >
              Todos
            </button>
            {cursos.map((c) => (
              <button
                key={c.slug}
                onClick={() =>
                  setFiltroSlug(filtroSlug === c.slug ? null : c.slug)
                }
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    filtroSlug === c.slug
                      ? (c.cor_destaque ?? "var(--accent)")
                      : "var(--bg-elevated)",
                  color:
                    filtroSlug === c.slug ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${
                    filtroSlug === c.slug
                      ? (c.cor_destaque ?? "var(--accent)")
                      : "var(--border)"
                  }`,
                }}
              >
                {c.icone && <span className="mr-1">{c.icone}</span>}
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <GraduationCap
              className="h-7 w-7"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
          <p
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Sin materias disponibles
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Las materias se agregarán próximamente.
          </p>
        </div>
      ) : noResults ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No se encontraron resultados para{" "}
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              &ldquo;{search}&rdquo;
            </span>
            .
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Link
              key={d.id}
              href={`/cursos/${d.cursoSlug}/${d.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              <div
                className="h-1.5"
                style={{ backgroundColor: d.cor_destaque ?? "#00A6FF" }}
              />
              <div className="p-5 flex-1">
                {d.icone && (
                  <div className="text-3xl mb-3">{d.icone}</div>
                )}
                <p
                  className="text-xs uppercase tracking-wide font-medium mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {d.cursoNome}
                </p>
                <h2
                  className="font-semibold text-base mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.nome}
                </h2>
                {d.descricao && (
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d.descricao}
                  </p>
                )}
              </div>
              <div
                className="px-5 pb-4 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {d._count.areas}{" "}
                  {d._count.areas === 1 ? "unidad" : "unidades"}
                </span>
                <ChevronRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
