import { Play, Image, FileText, Gamepad2 } from "lucide-react";
import { AdminSaveForm } from "@/components/admin/AdminSaveForm";
import { SectionToggle } from "@/components/admin/SectionToggle";
import { ArtigoEditor } from "@/components/editor/ArtigoEditor";
import { MiniEditor } from "@/components/editor/MiniEditor";
import { TabelasCard } from "@/components/admin/TabelasCard";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { AtlasBlocksManager } from "@/components/admin/AtlasBlocksManager";
import {
  atualizarTopicoContent,
  deletarTopicoContent,
  upsertVideoContent,
  deletarVideoContent,
  adicionarImagemContent,
  criarGrupoImagens,
} from "@/lib/actions/content";

type TopicoData = {
  id: string;
  titulo: string;
  objetivo: string | null;
  descricao_curta: string | null;
  duracao_estimada_min: number | null;
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
  tabelas: { id: string; titulo: string; tipo: string; cabecalhos: string[]; linhas: { id: string; categoria: string; conteudo: string; valores_extra: string[] }[] }[];
};

function SectionHeader({
  icon, label, color,
  topicoId, section, ativo, hasContent,
}: {
  icon: React.ReactNode; label: string; color: string;
  topicoId: string;
  section: "video_ativo" | "artigo_ativo" | "atlas_ativo" | "tabelas_ativo";
  ativo: boolean;
  hasContent: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{label}</h3>
      <SectionToggle topicoId={topicoId} section={section} initialValue={ativo} hasContent={hasContent} />
    </div>
  );
}

export function TopicoPanel({ data }: { data: TopicoData }) {
  const saveAction = atualizarTopicoContent.bind(null, data.id);
  const deleteAction = deletarTopicoContent.bind(null, data.id, data.area.id);
  const saveVideoAction = upsertVideoContent.bind(null, data.id);
  const removeVideoAction = deletarVideoContent.bind(null, data.id);
  const addImagemAction = adicionarImagemContent.bind(null, data.id);
  const addGrupoAction = criarGrupoImagens.bind(null, data.id);

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

      {/* Fila 1: Info básica + Video */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">

        {/* Info básica */}
        <div className="rounded-xl p-5 flex flex-col" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>Información básica</h3>
          <AdminSaveForm id="form-topico-panel" action={saveAction} className="flex flex-col gap-3 flex-1">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
              <input name="titulo" required defaultValue={data.titulo}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Objetivo de aprendizaje</label>
              <MiniEditor name="objetivo" defaultValue={data.objetivo} placeholder="Al finalizar, el alumno podrá..." minRows={5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción corta</label>
                <input name="descricao_curta" defaultValue={data.descricao_curta ?? ""}
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Duración (min)</label>
                <input name="duracao_estimada_min" type="number" min={1}
                  defaultValue={data.duracao_estimada_min ?? ""}
                  placeholder="ej. 15"
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
        </div>

        {/* Video */}
        <div className="rounded-xl p-5 flex flex-col" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <SectionHeader icon={<Play className="h-4 w-4" />} label="Video" color="#EF4444"
            topicoId={data.id} section="video_ativo" ativo={data.video_ativo} hasContent={!!data.video} />

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

          <form action={saveVideoAction} className="flex flex-col gap-3 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título</label>
                <input name="titulo" defaultValue={data.video?.titulo ?? ""}
                  placeholder="ej. Huesos del esqueleto"
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Duración (seg)</label>
                <input name="duracao_seg" type="number" min={1} defaultValue={data.video?.duracao_seg ?? ""}
                  placeholder="ej. 716"
                  className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
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
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                Leyenda (texto en el caption bajo el video)
              </label>
              <MiniEditor name="legenda" defaultValue={data.video?.legenda}
                placeholder="ej. Resumen breve del contenido del video..." minRows={3} />
            </div>
            <div className="flex justify-end mt-auto">
              <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}>
                {data.video ? "Actualizar video" : "Agregar video"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fila 2: Imágenes + Tablas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">

        {/* Imágenes */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          {(() => {
            const totalImgs = data.imagens.length + data.grupos_imagens.reduce((acc, g) => acc + g.imagens.length, 0);
            return (
              <SectionHeader
                icon={<Image className="h-4 w-4" />}
                label={`Imágenes / Atlas (${totalImgs})`}
                color="#6C63FF"
                topicoId={data.id}
                section="atlas_ativo"
                ativo={data.atlas_ativo}
                hasContent={totalImgs > 0}
              />
            );
          })()}

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
        </div>

        {/* Tablas */}
        <TabelasCard topicoId={data.id} tabelas_ativo={data.tabelas_ativo} tabelas={data.tabelas} />
      </div>

      {/* Artículo — full width */}
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <SectionHeader
          icon={<FileText className="h-4 w-4" />}
          label="Artículo"
          color="#F59E0B"
          topicoId={data.id}
          section="artigo_ativo"
          ativo={data.artigo_ativo}
          hasContent={!!data.artigo}
        />
        <ArtigoEditor
          topicoId={data.id}
          initialContent={(data.artigo?.content as import("@tiptap/react").JSONContent) ?? null}
        />
      </div>

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
