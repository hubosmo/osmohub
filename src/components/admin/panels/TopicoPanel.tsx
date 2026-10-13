import { Play, Image, FileText, Gamepad2, BookOpen, HelpCircle } from "lucide-react";
import { DuracaoInput } from "@/components/admin/DuracaoInput";
import { AdminSaveForm } from "@/components/admin/AdminSaveForm";
import { SectionToggle } from "@/components/admin/SectionToggle";
import { CollapsibleCard } from "@/components/admin/CollapsibleCard";
import { ArtigoEditor } from "@/components/editor/ArtigoEditor";
import { MiniEditor } from "@/components/editor/MiniEditor";
import { TabelasCard } from "@/components/admin/TabelasCard";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { AtlasBlocksManager } from "@/components/admin/AtlasBlocksManager";
import { QuizLinker } from "@/components/admin/QuizLinker";
import { atualizarTopicoContent, deletarTopicoContent } from "@/lib/actions/content-structure";
import { upsertVideoContent, deletarVideoContent } from "@/lib/actions/content-media";
import { adicionarImagemContent, criarGrupoImagens } from "@/lib/actions/content-atlas";

type QuizResumido = { id: string; titulo: string; _count: { questoes: number } };

type TopicoData = {
  id: string;
  titulo: string;
  objetivo: string | null;
  descricao_curta: string | null;
  duracao_estimada_min: number | null;
  ordem: number;
  publicado: boolean;
  video_ativo: boolean;
  artigo_ativo: boolean;
  atlas_ativo: boolean;
  tabelas_ativo: boolean;
  area: { id: string; nome: string; disciplina: { id: string; nome: string; curso: { id: string; nome: string } } };
  video: { id: string; titulo: string; descricao: string | null; legenda: string | null; youtube_url: string | null; duracao_seg: number | null } | null;
  artigo: { id: string; content: unknown; tempo_leitura_min: number | null } | null;
  imagens: { id: string; url: string; legenda: string | null; ordem: number }[];
  grupos_imagens: { id: string; titulo: string | null; legenda: string | null; modo_legenda: string; ordem: number; imagens: { id: string; url: string; legenda: string | null }[] }[];
  tabelas: { id: string; titulo: string; tipo: string; cabecalhos: unknown; linhas: { id: string; categoria: string; conteudo: string; valores_extra: unknown }[] }[];
  quizzesVinculados: { quiz: QuizResumido }[];
  todosQuizzes: QuizResumido[];
};

export function TopicoPanel({ data }: { data: TopicoData }) {
  const saveAction = atualizarTopicoContent.bind(null, data.id);
  const deleteAction = deletarTopicoContent.bind(null, data.id, data.area.id);
  const saveVideoAction = upsertVideoContent.bind(null, data.id);
  const removeVideoAction = deletarVideoContent.bind(null, data.id);
  const addImagemAction = adicionarImagemContent.bind(null, data.id);
  const addGrupoAction = criarGrupoImagens.bind(null, data.id);

  const totalImgs = data.imagens.length + data.grupos_imagens.reduce((acc, g) => acc + g.imagens.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
            Tópico · <span style={{ color: "var(--accent)" }}>{data.area.nome}</span>
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{data.titulo}</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full shrink-0"
          style={{
            backgroundColor: data.publicado ? "#22C55E22" : "var(--bg-elevated)",
            color: data.publicado ? "#22C55E" : "var(--text-muted)",
            border: `1px solid ${data.publicado ? "#22C55E" : "var(--border)"}`,
          }}>
          {data.publicado ? "Publicado" : "Borrador"}
        </span>
      </div>

      {/* Secciones colapsables */}
      <div className="flex flex-col gap-3 mb-3">

        {/* Info básica */}
        <CollapsibleCard
          storageKey={`info-${data.id}`}
          icon={<BookOpen className="h-4 w-4" />}
          iconColor="#6366F1"
          label="Información básica"
        >
          <AdminSaveForm id="form-topico-panel" action={saveAction} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
              <input name="titulo" required defaultValue={data.titulo}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Objetivo de aprendizaje</label>
              <MiniEditor name="objetivo" defaultValue={data.objetivo} placeholder="Al finalizar, el alumno podrá..." minRows={5} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción corta</label>
                <input name="descricao_curta" defaultValue={data.descricao_curta ?? ""}
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Orden</label>
                <input name="ordem" type="number" min={0}
                  defaultValue={data.ordem ?? 0}
                  placeholder="0"
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>
          </AdminSaveForm>
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="publicado" form="form-topico-panel"
                defaultChecked={data.publicado} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
            </label>
            <div className="flex gap-2">
              <form action={deleteAction}>
                <button type="submit" className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}>
                  Eliminar
                </button>
              </form>
              <button type="submit" form="form-topico-panel"
                className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}>
                Guardar
              </button>
            </div>
          </div>
        </CollapsibleCard>

        {/* Video */}
        <CollapsibleCard
          storageKey={`video-${data.id}`}
          icon={<Play className="h-4 w-4" />}
          iconColor="#EF4444"
          label="Video"
          action={
            <SectionToggle topicoId={data.id} section="video_ativo" initialValue={data.video_ativo} hasContent={!!data.video} />
          }
        >
          {data.video && (
            <div className="mb-3 p-3 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{data.video.titulo}</p>
                {data.video.youtube_url && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{data.video.youtube_url}</p>
                )}
              </div>
              <form action={removeVideoAction} className="ml-3 shrink-0">
                <button type="submit" className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}>
                  Quitar
                </button>
              </form>
            </div>
          )}

          <form action={saveVideoAction} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título</label>
                <input name="titulo" defaultValue={data.video?.titulo ?? ""}
                  placeholder="ej. Huesos del esqueleto"
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <DuracaoInput defaultSecs={data.video?.duracao_seg ?? null} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>URL del video (YouTube o Vimeo)</label>
              <input name="youtube_url" type="url" defaultValue={data.video?.youtube_url ?? ""}
                placeholder="https://vimeo.com/123456789"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Introducción (texto antes del video)
              </label>
              <MiniEditor name="descricao" defaultValue={data.video?.descricao}
                placeholder="ej. Los anatomistas usan términos específicos..." minRows={4} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Leyenda (texto en el caption bajo el video)
              </label>
              <MiniEditor name="legenda" defaultValue={data.video?.legenda}
                placeholder="ej. Resumen breve del contenido del video..." minRows={3} />
            </div>
            <div className="flex justify-end mt-1">
              <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}>
                {data.video ? "Actualizar video" : "Agregar video"}
              </button>
            </div>
          </form>
        </CollapsibleCard>
      </div>

      <div className="flex flex-col gap-3 mb-3">

        {/* Imágenes */}
        <CollapsibleCard
          storageKey={`imagenes-${data.id}`}
          icon={<Image className="h-4 w-4" />}
          iconColor="#6C63FF"
          label={`Imágenes / Atlas (${totalImgs})`}
          action={
            <SectionToggle topicoId={data.id} section="atlas_ativo" initialValue={data.atlas_ativo} hasContent={totalImgs > 0} />
          }
        >
          <AtlasBlocksManager
            key={[
              ...data.grupos_imagens.flatMap(g => [g.id, ...g.imagens.map(i => i.id)]),
              ...data.imagens.map(i => i.id),
            ].join(",")}
            topicoId={data.id}
            grupos={data.grupos_imagens}
            imagens={data.imagens}
            addImagemAction={addImagemAction}
            addGrupoAction={addGrupoAction}
          />
        </CollapsibleCard>

        {/* Tablas */}
        <TabelasCard topicoId={data.id} tabelas_ativo={data.tabelas_ativo} tabelas={data.tabelas} />
      </div>

      {/* Artículo — full width */}
      <CollapsibleCard
        storageKey={`articulo-${data.id}`}
        icon={<FileText className="h-4 w-4" />}
        iconColor="#F59E0B"
        label="Artículo"
        action={
          <SectionToggle topicoId={data.id} section="artigo_ativo" initialValue={data.artigo_ativo} hasContent={!!data.artigo} />
        }
        className="mb-4"
      >
        <ArtigoEditor
          topicoId={data.id}
          initialContent={(data.artigo?.content as import("@tiptap/react").JSONContent) ?? null}
        />
      </CollapsibleCard>

      {/* Cuestionarios vinculados */}
      <CollapsibleCard
        storageKey={`quizzes-${data.id}`}
        icon={<HelpCircle className="h-4 w-4" />}
        iconColor="#F59E0B"
        label={`Cuestionarios (${data.quizzesVinculados.length})`}
      >
        <QuizLinker
          topicoId={data.id}
          quizzesVinculados={data.quizzesVinculados}
          todosQuizzes={data.todosQuizzes}
        />
      </CollapsibleCard>

      {/* Simulaciones placeholder */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", opacity: 0.6 }}>
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="h-4 w-4" style={{ color: "#22C55E" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Simulaciones</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Disponible en Fase 6</p>
      </div>
    </div>
  );
}
