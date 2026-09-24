"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, ChevronRight, ChevronLeft, BookOpen, PlayCircle, FileText,
  Clock, Circle,
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

type Props = {
  cursoSlug: string;
  disciplinaSlug: string;
  areaSlug: string;
  cursoNome: string;
  disciplinaNome: string;
  areaNome: string;
  areaDescricao?: string | null;
  capaUrl?: string | null;
  capaUrlLight?: string | null;
  topicos: Topico[];
  accentColor: string;
};

export function AreaTopicos({
  cursoSlug,
  disciplinaSlug,
  areaSlug,
  cursoNome,
  disciplinaNome,
  areaNome,
  areaDescricao,
  capaUrl,
  capaUrlLight,
  topicos,
  accentColor,
}: Props) {
  const [isLight, setIsLight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => setIsLight(html.getAttribute("data-theme") === "light");
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewport);
    };
  }, []);
  const capaDisplay = (isLight && capaUrlLight) ? capaUrlLight : capaUrl;
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? topicos.filter(
        (t) =>
          t.titulo.toLowerCase().includes(search.toLowerCase()) ||
          t.descricao_curta?.toLowerCase().includes(search.toLowerCase())
      )
    : topicos;

  const basePath = `/cursos/${cursoSlug}/${disciplinaSlug}/${areaSlug}`;
  const firstTopico = topicos[0];

  return (
    <div>
      {/* Breadcrumb sticky */}
      <div
        className="sticky top-0 z-20 w-full border-b"
        style={{ height: 48, backgroundColor: "var(--bg-nav-bar)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center h-full px-4 lg:px-8 max-w-5xl mx-auto gap-2">
          {isMobile ? (
            <>
              {/* Mobile: botão voltar + nome da área */}
              <Link
                href={`/cursos/${cursoSlug}/${disciplinaSlug}`}
                className="flex items-center gap-1 shrink-0 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[110px] font-medium">{disciplinaNome}</span>
              </Link>
              <span
                className="flex-1 text-center text-sm font-semibold truncate px-1"
                style={{ color: "var(--text-primary)" }}
              >
                {areaNome}
              </span>
            </>
          ) : (
            <>
              {/* Desktop: breadcrumb completo + busca */}
              <nav
                className="flex items-center gap-1.5 text-sm flex-1 min-w-0 overflow-hidden"
                style={{ color: "var(--text-muted)" }}
              >
                <Link href="/cursos" className="breadcrumb-link shrink-0">Cursos</Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <Link href={`/cursos/${cursoSlug}`} className="breadcrumb-link truncate max-w-[72px]">{cursoNome}</Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <Link href={`/cursos/${cursoSlug}/${disciplinaSlug}`} className="breadcrumb-link truncate max-w-[80px]">{disciplinaNome}</Link>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-semibold" style={{ color: "var(--text-primary)" }}>{areaNome}</span>
              </nav>
              <div className="relative shrink-0 w-44">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full rounded-md border py-1.5 pl-3 pr-7 text-xs outline-none transition-colors"
                  style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Layout 2 colunas */}
      <div className="flex max-w-5xl mx-auto px-4 lg:px-8 overflow-hidden">

        {/* Sidebar esquerda */}
        <aside
          className="hidden lg:flex flex-col shrink-0 w-56 sticky self-start py-8 pr-6 gap-0.5"
          style={{ top: 48, maxHeight: "calc(100vh - 48px)", overflowY: "auto" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: "var(--text-muted)" }}>
            {areaNome}
          </p>
          {topicos.map((t) => (
            <Link
              key={t.id}
              href={`${basePath}/${t.slug}`}
              className="flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors hover:bg-[var(--bg-elevated)] group"
              style={{ color: "var(--text-secondary)" }}
            >
              <Circle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              <span className="truncate group-hover:text-[var(--text-primary)] transition-colors">{t.titulo}</span>
            </Link>
          ))}
        </aside>

        {/* Conteúdo principal */}
        <div
          className="flex-1 min-w-0 py-8 lg:pl-8 lg:border-l"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Título da área */}
          {!search && (
            <h1 className="text-2xl font-bold mb-6" style={{ color: accentColor }}>
              {areaNome}
            </h1>
          )}

          {/* Search — mobile inline (logo abaixo do título ou do card) */}
          <div className="md:hidden mb-5 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tema..."
              className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          </div>

          {/* Card de destaque */}
          {!search && firstTopico && (
            <div
              className="rounded-2xl overflow-hidden mb-8 flex flex-col sm:flex-row"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
            >
              {/* Imagem — só exibe se existir */}
              {capaDisplay && (
                <div
                  className="w-full sm:w-36 shrink-0 aspect-[4/3] sm:aspect-auto border-b sm:border-b-0 sm:border-r overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  <img src={capaDisplay} alt={areaNome} className="w-full h-full object-cover object-top" />
                </div>
              )}

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 p-4 sm:p-5">
                <div>
                  <p className="font-bold text-sm sm:text-base mb-1" style={{ color: "var(--text-primary)" }}>
                    {firstTopico.titulo}
                  </p>
                  {(areaDescricao || firstTopico.descricao_curta) && (
                    <p className="text-xs sm:text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {areaDescricao ?? firstTopico.descricao_curta}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                    <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "var(--bg-elevated)" }}>
                      <div className="h-full w-0 rounded-full" style={{ backgroundColor: accentColor }} />
                    </div>
                    <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                      0 / {topicos.length}
                    </span>
                  </div>
                  <Link
                    href={`${basePath}/${firstTopico.slug}`}
                    className="shrink-0 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accentColor, color: "#fff" }}
                  >
                    Comenzar curso
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Lista de tópicos */}
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            {search ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}` : `${topicos.length} tema${topicos.length !== 1 ? "s" : ""}`}
          </p>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <BookOpen className="h-8 w-8" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {search ? `Sin resultados para "${search}"` : "Sin temas disponibles aún."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((topico) => (
                <Link
                  key={topico.id}
                  href={`${basePath}/${topico.slug}`}
                  className="group flex items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--bg-elevated)] no-underline"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
                >
                  {/* Ícone de progresso */}
                  <Circle className="shrink-0 h-5 w-5" style={{ color: "var(--border)" }} />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm truncate block" style={{ color: "var(--accent)" }}>
                      {topico.titulo}
                    </span>
                    {topico.descricao_curta && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                        {topico.descricao_curta}
                      </p>
                    )}
                  </div>

                  {/* Badges + botão — desktop; seta — mobile */}
                  {isMobile ? (
                    <ChevronRight className="shrink-0 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 shrink-0">
                        {topico.video && (
                          <span
                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
                          >
                            <PlayCircle className="h-3 w-3" />
                            Video
                          </span>
                        )}
                        {topico.artigo && (
                          <span
                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}
                          >
                            <FileText className="h-3 w-3" />
                            Artículo
                          </span>
                        )}
                        {topico.duracao_estimada_min && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            <Clock className="h-3 w-3" />
                            {topico.duracao_estimada_min} min
                          </span>
                        )}
                      </div>
                      <span
                        className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border"
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        Estudiar
                      </span>
                    </>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
