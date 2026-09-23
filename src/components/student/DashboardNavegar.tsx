"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, GraduationCap } from "lucide-react";

type AreaItem = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  _count: { topicos: number };
};

type DisciplinaItem = {
  id: string;
  slug: string;
  nome: string;
  icone: string | null;
  cor_destaque: string | null;
  curso: { slug: string };
  areas: AreaItem[];
};

interface Props {
  disciplinas: DisciplinaItem[];
}

export function DashboardNavegar({ disciplinas }: Props) {
  const [activeId, setActiveId] = useState<string>(disciplinas[0]?.id ?? "");
  const [search, setSearch] = useState("");

  const activeDisciplina = disciplinas.find((d) => d.id === activeId) ?? disciplinas[0];
  const color = activeDisciplina?.cor_destaque ?? "var(--accent)";

  const areas = useMemo(() => {
    if (!activeDisciplina) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activeDisciplina.areas;
    return activeDisciplina.areas.filter((a) =>
      a.nome.toLowerCase().includes(q) || a.descricao?.toLowerCase().includes(q)
    );
  }, [activeDisciplina, search]);

  if (disciplinas.length === 0) return null;

  return (
    <section>
      {/* Título de seção */}
      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--accent)" }}>
        Navegar por temas
      </h2>

      {/* Barra de busca */}
      <div className="relative mb-5">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca: corazón, laringe, nervio vago..."
          className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        />
      </div>

      {/* Tabs — disciplinas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {disciplinas.map((d) => {
          const isActive = d.id === activeId;
          const c = d.cor_destaque ?? "var(--accent)";
          return (
            <button
              key={d.id}
              onClick={() => { setActiveId(d.id); setSearch(""); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
              style={{
                backgroundColor: isActive ? c : "var(--bg-surface)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${isActive ? c : "var(--border)"}`,
              }}
            >
              {d.icone && <span className="mr-1.5">{d.icone}</span>}
              {d.nome}
            </button>
          );
        })}
      </div>

      {/* Grid de áreas */}
      {areas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/cursos/${activeDisciplina!.curso.slug}/${activeDisciplina!.slug}/${area.slug}`}
              className="group flex flex-col rounded-xl border overflow-hidden transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Card header — substitui a imagem anatômica */}
              <div
                className="relative flex items-center justify-center h-28 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
                  borderBottom: `3px solid ${color}`,
                }}
              >
                {/* Badge de temas */}
                <span
                  className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)" }}
                >
                  0/{area._count.topicos}
                </span>

                {/* Ícone central */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {activeDisciplina!.icone ? (
                    <span>{activeDisciplina!.icone}</span>
                  ) : (
                    <GraduationCap className="h-7 w-7" style={{ color }} />
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-1 p-4 flex-1">
                <p
                  className="font-semibold text-sm leading-snug transition-colors duration-150 group-hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {area.nome}
                </p>
                {area.descricao && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {area.descricao}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl border text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <GraduationCap className="h-10 w-10 mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {search ? "Sin resultados para esa búsqueda." : "No hay áreas publicadas aún."}
          </p>
        </div>
      )}
    </section>
  );
}
