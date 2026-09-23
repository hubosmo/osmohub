import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Image, Play, FileText, Gamepad2, Table2, Plus, Trash2 } from "lucide-react";
import { getTopicoAdmin } from "@/lib/db/admin";
import {
  atualizarTopico,
  deletarTopico,
  upsertVideo,
  deletarVideo,
  adicionarImagem,
  deletarImagem,
  criarTabela,
  deletarTabela,
  adicionarLinha,
  deletarLinha,
} from "@/lib/actions/admin";

export default async function EditarTopicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topico = await getTopicoAdmin(id);
  if (!topico) notFound();

  const { area } = topico;
  const { disciplina } = area;

  const saveAction = atualizarTopico.bind(null, id);
  const deleteAction = deletarTopico.bind(null, id, area.id);
  const saveVideoAction = upsertVideo.bind(null, id);
  const removeVideoAction = deletarVideo.bind(null, id);
  const addImagemAction = adicionarImagem.bind(null, id);
  const createTabelaAction = criarTabela.bind(null, id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href="/admin/cursos" className="hover:underline" style={{ color: "var(--accent)" }}>Cursos</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/admin/cursos/${disciplina.curso.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
          {disciplina.curso.nome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/admin/disciplinas/${disciplina.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
          {disciplina.nome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/admin/areas/${area.id}`} className="hover:underline" style={{ color: "var(--accent)" }}>
          {area.nome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate max-w-[160px]">{topico.titulo}</span>
      </div>

      {/* Info básica */}
      <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Información básica</h2>
        <form id="form-topico" action={saveAction} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Título *</label>
            <input name="titulo" required defaultValue={topico.titulo}
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Objetivo de aprendizaje</label>
            <textarea name="objetivo" rows={2} defaultValue={topico.objetivo ?? ""}
              placeholder="Al finalizar, el alumno podrá..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Descripción corta</label>
              <input name="descricao_curta" defaultValue={topico.descricao_curta ?? ""}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Duración estimada (min)</label>
              <input name="duracao_estimada_min" type="number" min={1}
                defaultValue={topico.duracao_estimada_min ?? ""}
                placeholder="ej. 15"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </form>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="publicado" form="form-topico" defaultChecked={topico.publicado} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Publicado</span>
          </label>
          <div className="flex gap-2">
            <form action={deleteAction}>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--error)", border: "1px solid var(--error)" }}>
                Eliminar tópico
              </button>
            </form>
            <button type="submit" form="form-topico" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EF444422" }}>
            <Play className="h-4 w-4" style={{ color: "#EF4444" }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Video</h2>
          {topico.video && (
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "#22C55E22", color: "#22C55E" }}>
              Activo
            </span>
          )}
        </div>

        {topico.video && (
          <div className="mb-4 p-3 rounded-lg flex items-center justify-between"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{topico.video.titulo}</p>
              {topico.video.youtube_url && (
                <p className="text-xs truncate max-w-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {topico.video.youtube_url}
                </p>
              )}
            </div>
            <form action={removeVideoAction}>
              <button type="submit" className="text-xs px-3 py-1.5 rounded-lg ml-4"
                style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}>
                Quitar
              </button>
            </form>
          </div>
        )}

        <form action={saveVideoAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                {topico.video ? "Actualizar título" : "Título"}
              </label>
              <input name="titulo" defaultValue={topico.video?.titulo ?? ""}
                placeholder="ej. Huesos del esqueleto"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>URL de YouTube</label>
              <input name="youtube_url" type="url" defaultValue={topico.video?.youtube_url ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              {topico.video ? "Actualizar video" : "Agregar video"}
            </button>
          </div>
        </form>
      </div>

      {/* Imágenes */}
      <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6C63FF22" }}>
            <Image className="h-4 w-4" style={{ color: "#6C63FF" }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Imágenes ({topico.imagens.length})
          </h2>
        </div>

        {topico.imagens.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {topico.imagens.map((img) => {
              const removeAction = deletarImagem.bind(null, img.id, id);
              return (
                <div key={img.id} className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.legenda ?? ""} className="h-12 w-16 object-cover rounded-md shrink-0"
                    onError={undefined} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{img.url}</p>
                    {img.legenda && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{img.legenda}</p>
                    )}
                  </div>
                  <form action={removeAction} className="shrink-0">
                    <button type="submit" className="text-xs px-2 py-1 rounded"
                      style={{ color: "var(--error)", border: "1px solid var(--error)", backgroundColor: "transparent" }}>
                      ×
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}

        <form action={addImagemAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>URL de imagen *</label>
              <input name="url" required type="url" placeholder="https://..."
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Leyenda (opcional)</label>
              <input name="legenda" placeholder="ej. Vista anterior del fémur"
                className="w-full h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              Agregar imagen
            </button>
          </div>
        </form>
      </div>

      {/* Tabelas de resumo */}
      <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00A6FF22" }}>
            <Table2 className="h-4 w-4" style={{ color: "#00A6FF" }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Tablas de resumen ({topico.tabelas.length})
          </h2>
        </div>

        {/* Tabelas existentes */}
        {topico.tabelas.map((tabela) => {
          const removeTabelaAction = deletarTabela.bind(null, tabela.id, id);
          const addLinhaAction = adicionarLinha.bind(null, tabela.id, id);

          return (
            <div key={tabela.id} className="mb-5 rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border)" }}>
              {/* Header da tabela */}
              <div className="flex items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tabela.titulo}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {tabela.tipo}
                  </span>
                </div>
                <form action={removeTabelaAction}>
                  <button type="submit" title="Eliminar tabla"
                    className="h-7 w-7 rounded flex items-center justify-center"
                    style={{ color: "var(--error)" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

              {/* Linhas */}
              <div style={{ backgroundColor: "var(--bg-surface)" }}>
                {tabela.linhas.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Sin filas aún</p>
                ) : (
                  tabela.linhas.map((linha, li) => {
                    const removeLinhaAction = deletarLinha.bind(null, linha.id, id);
                    return (
                      <div key={linha.id} className="grid grid-cols-[180px_1fr_32px] gap-3 items-start px-4 py-2.5"
                        style={{ borderBottom: li < tabela.linhas.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <p className="text-xs font-semibold pt-0.5" style={{ color: "var(--text-primary)" }}>
                          {linha.categoria}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                          {linha.conteudo}
                        </p>
                        <form action={removeLinhaAction}>
                          <button type="submit" title="Eliminar fila"
                            className="h-6 w-6 flex items-center justify-center rounded"
                            style={{ color: "var(--text-muted)" }}>
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </form>
                      </div>
                    );
                  })
                )}

                {/* Adicionar linha */}
                <form action={addLinhaAction}
                  className="grid grid-cols-[180px_1fr_auto] gap-2 items-end p-3"
                  style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Categoría *</label>
                    <input name="categoria" required placeholder="ej. Extremo proximal"
                      className="w-full h-8 px-2.5 rounded text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Contenido *</label>
                    <input name="conteudo" required placeholder="ej. Cabeza del fémur, trocánter mayor..."
                      className="w-full h-8 px-2.5 rounded text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <button type="submit"
                    className="h-8 px-3 rounded text-xs font-medium text-white flex items-center gap-1 shrink-0"
                    style={{ backgroundColor: "var(--accent)" }}>
                    <Plus className="h-3.5 w-3.5" /> Fila
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {/* Nova tabela */}
        <form action={createTabelaAction} className="flex gap-3 items-end pt-2">
          <div className="flex-1">
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
              Título de nueva tabla *
            </label>
            <input name="titulo" required placeholder="ej. Puntos clave sobre el fémur"
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="w-36">
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>Tipo</label>
            <select name="tipo"
              className="w-full h-9 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option value="resumen">Resumen</option>
              <option value="estudio">Estudio</option>
            </select>
          </div>
          <button type="submit"
            className="h-9 px-4 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 shrink-0"
            style={{ backgroundColor: "var(--accent)" }}>
            <Plus className="h-4 w-4" /> Tabla
          </button>
        </form>
      </div>

      {/* Artículo — placeholder */}
      <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", opacity: 0.7 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F59E0B22" }}>
            <FileText className="h-4 w-4" style={{ color: "#F59E0B" }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Artículo</h2>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            Próximamente
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          El editor Tiptap estará disponible en la Fase 5 del proyecto.
        </p>
      </div>

      {/* Simulaciones — placeholder */}
      <div className="rounded-xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", opacity: 0.7 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#22C55E22" }}>
            <Gamepad2 className="h-4 w-4" style={{ color: "#22C55E" }} />
          </div>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Simulaciones y Quiz</h2>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            Próximamente
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Quiz interactivo y simulaciones serán habilitados en fases posteriores.
        </p>
      </div>
    </div>
  );
}
