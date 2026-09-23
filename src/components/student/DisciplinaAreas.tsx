"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, BookOpen, PlayCircle,
  FileText, Clock, Circle,
} from "lucide-react";

type Topico = {
  id: string;
  slug: string;
  titulo: string;
  descricao_curta: string | null;
  duracao_estimada_min: number | null;
  video: { id: string } | null;
  artigo: { id: string } | null;
};

type Area = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  capa_url: string | null;
  capa_url_light: string | null;
  topicos: Topico[];
};

type Props = {
  cursoSlug: string;
  disciplinaSlug: string;
  cursoNome: string;
  disciplinaNome: string;
  disciplinaDescricao: string | null;
  disciplinaIcone: string | null;
  accentColor: string;
  areas: Area[];
};

export function DisciplinaAreas({
  cursoSlug,
  disciplinaSlug,
  cursoNome,
  disciplinaNome,
  disciplinaDescricao,
  disciplinaIcone,
  accentColor,
  areas,
}: Props) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsLight(html.getAttribute("data-theme") === "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const selectedArea = areas.find((a) => a.id === selectedAreaId) ?? areas[0];
  const capaDisplay = selectedArea
    ? (isLight && selectedArea.capa_url_light) ? selectedArea.capa_url_light : selectedArea.capa_url
    : null;
  const query = search.trim().toLowerCase();

  const filteredTopicos = selectedArea
    ? query
      ? selectedArea.topicos.filter(
          (t) =>
            t.titulo.toLowerCase().includes(query) ||
            t.descricao_curta?.toLowerCase().includes(query)
        )
      : selectedArea.topicos
    : [];

  const basePath = `/cursos/${cursoSlug}/${disciplinaSlug}`;
  const firstTopico = selectedArea?.topicos[0];

  return (
    <div>
      {/* Breadcrumb sticky */}
      <div
        className="sticky top-0 z-20 w-full border-b"
        style={{ height: 48, backgroundColor: "var(--bg-nav-bar)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between gap-4 h-full px-4 lg:px-8 max-w-5xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link href="/cursos" className="breadcrumb-link">
              Cursos
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/cursos/${cursoSlug}`} className="breadcrumb-link truncate max-w-[120px]">
              {cursoNome}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[140px] font-semibold" style={{ color: "var(--text-primary)" }}>{disciplinaNome}</span>
          </nav>

          <div className="relative w-52 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca..."
              className="w-full rounded-md border py-1.5 pl-3 pr-8 text-sm outline-none transition-colors"
              style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          </div>
        </div>
      </div>

      {/* Layout 2 colunas */}
      <div className="flex max-w-5xl mx-auto px-4 lg:px-8">

        {/* Sidebar esquerda — lista de unidades (áreas) */}
        <aside
          className="hidden lg:flex flex-col shrink-0 w-56 sticky self-start py-8 pr-6 gap-0.5"
          style={{ top: 48, maxHeight: "calc(100vh - 48px)", overflowY: "auto" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: "var(--text-muted)" }}>
            {disciplinaNome}
          </p>
          {areas.map((area) => {
            const active = area.id === selectedAreaId;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => { setSelectedAreaId(area.id); setSearch(""); }}
                className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors text-left w-full"
                style={{
                  backgroundColor: active ? `color-mix(in srgb, ${accentColor} 12%, var(--bg-elevated))` : "transparent",
                  color: active ? accentColor : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Circle
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: active ? accentColor : "var(--text-muted)" }}
                />
                <span className="truncate">{area.nome}</span>
              </button>
            );
          })}
        </aside>

        {/* Conteúdo principal */}
        <div
          className="flex-1 min-w-0 py-8 lg:pl-8"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          {/* Título da disciplina */}
          {!search && (
            <h1 className="text-2xl font-bold mb-6" style={{ color: accentColor }}>
              {disciplinaNome}
            </h1>
          )}

          {/* Card de destaque da unidade selecionada */}
          {!search && selectedArea && firstTopico && (
            <div
              className="rounded-2xl overflow-hidden mb-8 flex"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", height: 148 }}
            >
              {/* Imagem — flush, quadrada (largura = altura do card) */}
              <div
                className="hidden sm:flex shrink-0 items-center justify-center"
                style={{
                  width: 148,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 12%, var(--bg-elevated))`,
                  borderRight: `1px solid var(--border)`,
                }}
              >
                {capaDisplay ? (
                  <img src={capaDisplay} alt={selectedArea.nome} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-10 w-10" style={{ color: accentColor, opacity: 0.6 }} />
                )}
              </div>

              {/* Conteúdo direito */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 p-5">
                <div>
                  <p className="font-bold text-base mb-1" style={{ color: accentColor }}>
                    {selectedArea.nome}
                  </p>
                  {selectedArea.descricao && (
                    <p className="text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                      {selectedArea.descricao}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                    <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <div className="h-full w-0 rounded-full" style={{ backgroundColor: accentColor }} />
                    </div>
                    <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      0 / {selectedArea.topicos.length}
                    </span>
                  </div>
                  <Link
                    href={`${basePath}/${selectedArea.slug}/${firstTopico.slug}`}
                    className="shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accentColor, color: "#fff" }}
                  >
                    Comenzar curso
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Lista de tópicos da unidade selecionada */}
          {selectedArea && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                {query
                  ? `${filteredTopicos.length} resultado${filteredTopicos.length !== 1 ? "s" : ""}`
                  : `${selectedArea.topicos.length} tema${selectedArea.topicos.length !== 1 ? "s" : ""}`}
              </p>

              {filteredTopicos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <BookOpen className="h-8 w-8" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {query ? `Sin resultados para "${search}"` : "Sin temas disponibles aún."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredTopicos.map((topico) => (
                    <div
                      key={topico.id}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
                      style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
                    >
                      <div className="shrink-0">
                        <Circle className="h-5 w-5" style={{ color: "var(--border)" }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`${basePath}/${selectedArea.slug}/${topico.slug}`}
                          className="font-medium text-sm"
                          style={{ color: "var(--accent)" }}
                        >
                          {topico.titulo}
                        </Link>
                        {topico.descricao_curta && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                            {topico.descricao_curta}
                          </p>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        {topico.video && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            <PlayCircle className="h-3 w-3" /> Video
                          </span>
                        )}
                        {topico.artigo && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                            <FileText className="h-3 w-3" /> Artículo
                          </span>
                        )}
                        {topico.duracao_estimada_min && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            <Clock className="h-3 w-3" />
                            {topico.duracao_estimada_min} min
                          </span>
                        )}
                      </div>

                      <Link
                        href={`${basePath}/${selectedArea.slug}/${topico.slug}`}
                        className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-colors"
                        style={{ borderColor: accentColor, color: accentColor }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = accentColor;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = accentColor;
                        }}
                      >
                        Estudiar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
