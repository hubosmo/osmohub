import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, PlayCircle, Target, Bookmark, BookOpen, HelpCircle, ImageIcon, Table2 as Table2Icon } from "lucide-react";
import { getTopicoPorSlug } from "@/lib/db/cursos";
import { ArtigoRenderer } from "@/components/editor/ArtigoRenderer";
import { TablasSection } from "@/components/student/TablasSection";
import { MobileIndiceBar } from "@/components/student/MobileIndiceBar";
import { LastTopicTracker } from "@/components/student/LastTopicTracker";
import { TopicTour } from "@/components/student/TopicTour";
import { TopicSidebarNav } from "@/components/student/TopicSidebarNav";
import { TopicVideoSection } from "@/components/student/TopicVideoSection";
import { TopicAtlasSection } from "@/components/student/TopicAtlasSection";
import { TopicQuizSection } from "@/components/student/TopicQuizSection";
import { RichOrPlain } from "@/components/student/RichOrPlain";
import type { AtlasBlock } from "@/components/student/TopicAtlasSection";
import type { JSONContent } from "@tiptap/react";

interface PageProps {
  params: Promise<{ curso: string; disciplina: string; area: string; topico: string }>;
}

export default async function TopicoPage({ params }: PageProps) {
  const { curso: cursoSlug, disciplina: disciplinaSlug, area: areaSlug, topico: topicoSlug } = await params;

  const topico = await getTopicoPorSlug(cursoSlug, disciplinaSlug, areaSlug, topicoSlug).catch(() => null);
  if (!topico) notFound();

  const { area } = topico;
  const { disciplina } = area;
  const areaPath = `/cursos/${cursoSlug}/${disciplinaSlug}/${areaSlug}`;

  const currentIdx = area.topicos.findIndex((t) => t.slug === topicoSlug);
  const prevTopico = currentIdx > 0 ? area.topicos[currentIdx - 1] : null;
  const nextTopico = currentIdx < area.topicos.length - 1 ? area.topicos[currentIdx + 1] : null;

  const hasQuiz = topico._count.quizzes > 0;
  const hasTables = topico.tabelas_ativo && topico.tabelas && topico.tabelas.length > 0;
  const hasImages = topico.atlas_ativo && (
    (topico.imagens && topico.imagens.length > 0) ||
    (topico.grupos_imagens && topico.grupos_imagens.length > 0)
  );

  // Seções ativas — só aparecem se o toggle estiver ligado no admin
  type Section = { id: string; label: string; icon: React.ReactNode };
  const sections: Section[] = [
    ...(topico.video_ativo ? [{ id: "video", label: "Mira el video", icon: <PlayCircle className="h-4 w-4" /> }] : []),
    ...(topico.artigo_ativo && topico.artigo ? [{ id: "articulo", label: "Lee el artículo", icon: <BookOpen className="h-4 w-4" /> }] : []),
    ...(hasImages ? [{ id: "atlas", label: "Navega por el atlas", icon: <ImageIcon className="h-4 w-4" /> }] : []),
    ...(hasTables ? [{ id: "tablas", label: "Tablas de resumen", icon: <Table2Icon className="h-4 w-4" /> }] : []),
    ...(hasQuiz ? [{ id: "cuestionario", label: "Haz un cuestionario", icon: <HelpCircle className="h-4 w-4" /> }] : []),
  ];

  return (
    // Escapa o padding do StudentLayout (px-4 lg:px-8 py-6)
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <TopicTour />
      <LastTopicTracker data={{
        topicoId: topico.id,
        path: `/cursos/${cursoSlug}/${disciplinaSlug}/${areaSlug}/${topicoSlug}`,
        titulo: topico.titulo,
        descricao: topico.descricao_curta ?? null,
        areaNome: area.nome,
        disciplinaNome: disciplina.nome,
        cursoNome: disciplina.curso.nome,
        thumbnail: area.capa_url ?? await resolveVideoThumbnail(topico.video?.youtube_url, topico.video?.thumbnail_url),
        thumbnailLight: area.capa_url_light ?? null,
        totalTopicos: area.topicos.length,
      }} />

      {/* ── Breadcrumb sticky ── */}
      <div
        className="sticky z-20 border-b"
        style={{ top: 0, height: 48, backgroundColor: "var(--bg-nav-bar)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center h-full px-4 lg:px-8 max-w-5xl mx-auto overflow-hidden">
          <nav className="flex items-center gap-1.5 text-xs min-w-0" style={{ color: "var(--text-muted)" }}>
            {/* Desktop: full breadcrumb */}
            <Link href="/cursos" className="breadcrumb-link shrink-0 hidden sm:inline">Cursos</Link>
            <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
            <Link href={`/cursos/${cursoSlug}`} className="breadcrumb-link truncate max-w-[100px] hidden sm:inline">
              {disciplina.curso.nome}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
            <Link href={`/cursos/${cursoSlug}/${disciplinaSlug}`} className="breadcrumb-link truncate max-w-[100px] hidden sm:inline">
              {disciplina.nome}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 hidden sm:inline" />
            {/* Always visible: Area > Topic */}
            <Link href={areaPath} className="breadcrumb-link shrink-0 truncate max-w-[120px]">
              {area.nome}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-semibold" style={{ color: "var(--text-primary)", minWidth: 0 }}>{topico.titulo}</span>
          </nav>
        </div>
      </div>

      {/* ── Índice collapsível — mobile only ── */}
      <MobileIndiceBar sections={sections.map(s => ({ id: s.id, label: s.label }))} />

      {/* ── Layout 2 colunas ───────────────────────────────────────── */}
      <div className="flex max-w-5xl mx-auto px-4 lg:px-8">

        {/* Sidebar esquerda — sticky abaixo do breadcrumb (48px) */}
        <aside
          className="hidden lg:flex flex-col shrink-0 w-52 sticky self-start py-8 pr-6 gap-0.5"
          style={{ top: 48 }}
        >
          <TopicSidebarNav sections={sections} />
        </aside>

        {/* Conteúdo principal */}
        <div
          className="flex-1 min-w-0 py-8 lg:pl-10 lg:border-l"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Título + bookmark */}
          <div className="flex items-start gap-3 mb-3">
            <h1 className="flex-1 text-2xl font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
              {topico.titulo}
            </h1>
            <button
              className="shrink-0 mt-1 transition-colors"
              aria-label="Guardar en mis favoritos"
              style={{ color: "var(--text-muted)" }}
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>

          {/* Badge de status */}
          <div className="mb-8">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: "var(--text-muted)" }} />
              Incompleta
            </span>
          </div>

          {/* Objetivos de aprendizaje */}
          {topico.objetivo && (
            <div
              id="objetivo"
              className="rounded-xl p-5 mb-8"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg-surface))",
                border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              }}
            >
              <h2 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                <Target className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                Objetivos de aprendizaje
              </h2>
              <RichOrPlain text={topico.objetivo} className="text-base" color="var(--text-secondary)" />
            </div>
          )}

          {/* Descrição curta */}
          {topico.descricao_curta && !topico.objetivo && (
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
              {topico.descricao_curta}
            </p>
          )}

          {/* ── Seções numeradas ──────────────────────────────────── */}
          <div className="flex flex-col gap-12">
            {sections.map((section, idx) => (
              <section key={section.id} id={section.id}>
                {/* Cabeçalho numerado */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }}
                  >
                    {idx + 1}
                  </div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--accent)" }}>
                    {section.label}
                  </h2>
                </div>

                {/* Conteúdo — IDs prefixados com "-tour" para o TopicTour não conflitar com os IDs de âncora das seções */}
                {section.id === "video" && <TopicVideoSection video={topico.video} playerId="video-tour" />}
                {section.id === "articulo" && (
                  topico.artigo?.content
                    ? <ArtigoRenderer content={topico.artigo.content as JSONContent} />
                    : <div className="rounded-xl p-6 min-h-[120px] flex items-center justify-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Artículo no disponible aún.</p>
                      </div>
                )}
                {section.id === "tablas" && <TablasSection tabelas={topico.tabelas ?? []} />}
                {section.id === "cuestionario" && (
                  <div id="cuestionario-tour">
                    <TopicQuizSection
                      quizzes={(topico.quizzes ?? []).map((j) => j.quiz)}
                      backUrl={`/cursos/${cursoSlug}/${disciplinaSlug}/${areaSlug}/${topicoSlug}`}
                    />
                  </div>
                )}
                {section.id === "atlas" && (() => {
                  const allBlocks: AtlasBlock[] = [
                    ...(topico.imagens ?? []).map(img => ({ type: "imagem" as const, ...img })),
                    ...(topico.grupos_imagens ?? []).map(g => ({ type: "grupo" as const, ...g })),
                  ].sort((a, b) => a.ordem - b.ordem);
                  return <TopicAtlasSection blocks={allBlocks} firstItemId="atlas-tour" />;
                })()}
              </section>
            ))}
          </div>

          {/* ── Continúa tu aprendizaje ──────────────────────────── */}
          <div id="continua" className="mt-14 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <h2 className="text-base font-semibold mb-5" style={{ color: "var(--accent)" }}>
              Continúa tu aprendizaje
            </h2>
            <div className="flex gap-3 flex-wrap">
              {prevTopico ? (
                <Link
                  href={`${areaPath}/${prevTopico.slug}`}
                  className="group flex items-center gap-2 rounded-xl px-4 py-3 flex-1 min-w-[160px] max-w-xs transition-all hover:shadow-sm"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" style={{ color: "var(--text-muted)" }} />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Anterior</p>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{prevTopico.titulo}</p>
                  </div>
                </Link>
              ) : <div className="flex-1 max-w-xs" />}

              {nextTopico && (
                <Link
                  href={`${areaPath}/${nextTopico.slug}`}
                  className="group flex items-center gap-2 rounded-xl px-4 py-3 flex-1 min-w-[160px] max-w-xs ml-auto text-right transition-all hover:shadow-sm"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Siguiente</p>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{nextTopico.titulo}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--text-muted)" }} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function resolveVideoThumbnail(url: string | null | undefined, saved: string | null | undefined): Promise<string | null> {
  if (saved) return saved;
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  // Vimeo
  const vimeo = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) {
    try {
      const res = await fetch(`https://vimeo.com/api/v2/video/${vimeo[1]}.json`, { next: { revalidate: 86400 } });
      const data = await res.json() as Array<{ thumbnail_large?: string }>;
      return data[0]?.thumbnail_large ?? null;
    } catch { return null; }
  }
  return null;
}
