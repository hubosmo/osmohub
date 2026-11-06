import { notFound } from "next/navigation";
import { PlayCircle, BookOpen, HelpCircle, ImageIcon, Table2 as Table2Icon } from "lucide-react";
import { getTopicoPorSlug } from "@/lib/db/cursos";
import { getResumoTentativas } from "@/lib/db/tentativas";
import { getSessionUser } from "@/lib/auth/session";
import { resolveVideoThumbnail } from "@/lib/video/thumbnail";
import { MobileIndiceBar } from "@/components/student/MobileIndiceBar";
import { LastTopicTracker } from "@/components/student/LastTopicTracker";
import { TopicTour } from "@/components/student/TopicTour";
import { TopicSidebarNav } from "@/components/student/TopicSidebarNav";
import { TopicBreadcrumb } from "@/components/student/TopicBreadcrumb";
import { TopicHeader } from "@/components/student/TopicHeader";
import { TopicSections, type TopicSection } from "@/components/student/TopicSections";
import { TopicPrevNext } from "@/components/student/TopicPrevNext";

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
  const topicoPath = `${areaPath}/${topicoSlug}`;

  const currentIdx = area.topicos.findIndex((t) => t.slug === topicoSlug);
  const prevTopico = currentIdx > 0 ? area.topicos[currentIdx - 1] : null;
  const nextTopico = currentIdx < area.topicos.length - 1 ? area.topicos[currentIdx + 1] : null;

  // Histórico do aluno nos quizzes deste tópico (última e melhor pontuação)
  const user = await getSessionUser();
  const quizIds = (topico.quizzes ?? []).map((j) => j.quiz.id);
  const resumoQuizzes = user ? await getResumoTentativas(user.id, quizIds).catch(() => ({})) : {};

  const hasQuiz = topico._count.quizzes > 0;
  const hasTables = topico.tabelas_ativo && topico.tabelas && topico.tabelas.length > 0;
  const hasImages = topico.atlas_ativo && (
    (topico.imagens && topico.imagens.length > 0) ||
    (topico.grupos_imagens && topico.grupos_imagens.length > 0)
  );

  // Seções ativas — só aparecem se o toggle estiver ligado no admin
  const sections: TopicSection[] = [
    ...(topico.video_ativo ? [{ id: "video", label: "Mira el video", icon: <PlayCircle className="h-4 w-4" /> }] : []),
    ...(topico.artigo_ativo && topico.artigo ? [{ id: "articulo", label: "Lee el artículo", icon: <BookOpen className="h-4 w-4" /> }] : []),
    ...(hasImages ? [{ id: "atlas", label: "Navega por el atlas", icon: <ImageIcon className="h-4 w-4" /> }] : []),
    ...(hasQuiz ? [{ id: "cuestionario", label: "Haz un cuestionario", icon: <HelpCircle className="h-4 w-4" /> }] : []),
    ...(hasTables ? [{ id: "tablas", label: "Tablas de resumen", icon: <Table2Icon className="h-4 w-4" /> }] : []),
  ];

  return (
    // Escapa o padding do StudentLayout (px-4 lg:px-8 py-6)
    <div className="-mx-4 lg:-mx-8 -mt-6">
      <TopicTour />
      <LastTopicTracker data={{
        topicoId: topico.id,
        path: topicoPath,
        titulo: topico.titulo,
        descricao: topico.descricao_curta ?? null,
        areaNome: area.nome,
        disciplinaNome: disciplina.nome,
        cursoNome: disciplina.curso.nome,
        thumbnail: area.capa_url ?? await resolveVideoThumbnail(topico.video?.youtube_url, topico.video?.thumbnail_url),
        thumbnailLight: area.capa_url_light ?? null,
        totalTopicos: area.topicos.length,
      }} />

      <TopicBreadcrumb
        cursoSlug={cursoSlug}
        cursoNome={disciplina.curso.nome}
        disciplinaSlug={disciplinaSlug}
        disciplinaNome={disciplina.nome}
        areaPath={areaPath}
        areaNome={area.nome}
        titulo={topico.titulo}
      />

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
          <TopicHeader titulo={topico.titulo} objetivo={topico.objetivo} descricaoCurta={topico.descricao_curta} />
          <TopicSections sections={sections} topico={topico} backUrl={topicoPath} resumoQuizzes={resumoQuizzes} />
          <TopicPrevNext areaPath={areaPath} prevTopico={prevTopico} nextTopico={nextTopico} />
        </div>
      </div>
    </div>
  );
}
