import type { JSONContent } from "@tiptap/react";
import { getTopicoPorSlug } from "@/lib/db/cursos";
import { ArtigoRenderer } from "@/components/editor/ArtigoRenderer";
import { TablasSection } from "@/components/student/TablasSection";
import { TopicVideoSection } from "@/components/student/TopicVideoSection";
import { TopicAtlasSection, type AtlasBlock } from "@/components/student/TopicAtlasSection";
import { TopicQuizSection } from "@/components/student/TopicQuizSection";
import { TopicAtlas3DSection, type ModeloParaAluno } from "@/components/student/TopicAtlas3DSection";
import { ArtigoLidoTracker } from "@/components/student/ArtigoLidoTracker";
import type { ResumoTentativas } from "@/lib/db/tentativas";

type Topico = NonNullable<Awaited<ReturnType<typeof getTopicoPorSlug>>>;

export type TopicSection = { id: string; label: string; icon: React.ReactNode; done?: boolean };

interface TopicSectionsProps {
  sections: Pick<TopicSection, "id" | "label">[];
  topico: Topico;
  backUrl: string;
  resumoQuizzes?: Record<string, ResumoTentativas>;
  artigoLido?: boolean;
  videoAssistido?: boolean;
  modelos3d?: ModeloParaAluno[];
}

export function TopicSections({ sections, topico, backUrl, resumoQuizzes, artigoLido = false, videoAssistido = false, modelos3d = [] }: TopicSectionsProps) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section, idx) => (
        <section key={section.id} id={section.id} style={{ scrollMarginTop: 60 }}>
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
          {section.id === "video" && <TopicVideoSection video={topico.video} playerId="video-tour" topicoId={topico.id} jaAssistido={videoAssistido} />}
          {section.id === "articulo" && (
            topico.artigo?.content
              ? (
                <>
                  <ArtigoRenderer content={topico.artigo.content as JSONContent} />
                  <ArtigoLidoTracker topicoId={topico.id} jaLido={artigoLido} />
                </>
              )
              : <div className="rounded-xl p-6 min-h-[120px] flex items-center justify-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Artículo no disponible aún.</p>
                </div>
          )}
          {section.id === "tablas" && <TablasSection tabelas={topico.tabelas ?? []} />}
          {section.id === "cuestionario" && (
            <div id="cuestionario-tour">
              <TopicQuizSection
                quizzes={(topico.quizzes ?? []).map((j) => j.quiz)}
                backUrl={backUrl}
                resumos={resumoQuizzes}
              />
            </div>
          )}
          {section.id === "atlas3d" && <TopicAtlas3DSection modelos={modelos3d} firstItemId="atlas3d-tour" />}
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
  );
}
