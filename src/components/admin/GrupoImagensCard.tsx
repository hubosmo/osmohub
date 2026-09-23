"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { ImageUploadForm } from "./ImageUploadForm";
import { ImageLegendaEditor } from "./ImageLegendaEditor";
import {
  deletarGrupoImagens,
  atualizarTituloGrupo,
  adicionarImagemAoGrupo,
  deletarImagemContent,
  reordenarImagensGrupo,
  atualizarModoLegendaGrupo,
} from "@/lib/actions/content";
import { MiniEditor } from "@/components/editor/MiniEditor";

type Imagem = { id: string; url: string; legenda: string | null };

type Props = {
  grupoId: string;
  topicoId: string;
  titulo: string | null;
  legenda: string | null;
  modo_legenda: string;
  ordem: number;
  imagens: Imagem[];
};

export function GrupoImagensCard({ grupoId, topicoId, titulo, legenda, modo_legenda, ordem, imagens }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [localImagens, setLocalImagens] = useState<Imagem[]>(imagens);
  const [isPending, startTransition] = useTransition();

  // Keep ref in sync for stale-closure-free drag end
  const imRef = useRef(localImagens);
  useEffect(() => { imRef.current = localImagens; }, [localImagens]);

  // Sync images when props change (after remount via key)
  useEffect(() => { setLocalImagens(imagens); }, [imagens]);

  // DnD within group
  const draggedImgId = useRef<string | null>(null);

  function handleImgDragStart(id: string, e: React.DragEvent) {
    draggedImgId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleImgDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedImgId.current || draggedImgId.current === targetId) return;
    setLocalImagens(prev => {
      const from = prev.findIndex(i => i.id === draggedImgId.current);
      const to   = prev.findIndex(i => i.id === targetId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleImgDragEnd() {
    draggedImgId.current = null;
    const ids = imRef.current.map(i => i.id);
    startTransition(async () => {
      await reordenarImagensGrupo(grupoId, topicoId, ids);
    });
  }

  const deleteGrupoAction  = deletarGrupoImagens.bind(null, grupoId, topicoId);
  const updateTitleAction  = atualizarTituloGrupo.bind(null, grupoId, topicoId);
  const addImageAction     = adicionarImagemAoGrupo.bind(null, grupoId, topicoId);
  const updateModoAction   = atualizarModoLegendaGrupo.bind(null, grupoId, topicoId);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ borderBottom: collapsed ? "none" : "1px solid var(--border)", backgroundColor: "var(--bg-surface)" }}
      >
        <span className="text-[11px] font-semibold shrink-0" style={{ color: "var(--text-muted)" }}>
          Grupo {ordem + 1}
        </span>

        {editingTitle ? (
          <form
            action={async (fd) => { await updateTitleAction(fd); setEditingTitle(false); }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              name="titulo"
              defaultValue={titulo ?? ""}
              placeholder="Nombre del grupo (ej: Plano coronal)"
              autoFocus
              className="flex-1 h-7 px-2 rounded text-xs outline-none"
              style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--accent)", color: "var(--text-primary)" }}
            />
            <button type="submit" className="text-xs px-2 py-1 rounded font-medium text-white shrink-0"
              style={{ backgroundColor: "var(--accent)" }}>
              OK
            </button>
            <button type="button" onClick={() => setEditingTitle(false)}
              className="text-xs px-2 py-1 rounded shrink-0"
              style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }}>
              ✕
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-xs text-left truncate hover:underline"
            style={{ color: titulo ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {titulo ?? "Sin nombre — clic para nombrar"}
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {localImagens.length} img
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="h-6 w-6 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          <form action={deleteGrupoAction}>
            <button type="submit" className="h-6 w-6 flex items-center justify-center rounded"
              style={{ color: "var(--error)" }}
              title="Eliminar grupo y sus imágenes">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      {!collapsed && (
        <div className="p-3 flex flex-col gap-3">

          {/* Modo de legenda */}
          <div className="flex flex-col gap-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Leyenda
            </p>
            <div className="flex gap-2">
              <form action={updateModoAction}>
                <input type="hidden" name="modo_legenda" value="individual" />
                <button type="submit"
                  className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: modo_legenda === "individual" ? "var(--accent)" : "var(--bg-base)",
                    color: modo_legenda === "individual" ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${modo_legenda === "individual" ? "var(--accent)" : "var(--border)"}`,
                  }}>
                  Individual
                </button>
              </form>
              <form action={updateModoAction}>
                <input type="hidden" name="modo_legenda" value="unica" />
                <button type="submit"
                  className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: modo_legenda === "unica" ? "var(--accent)" : "var(--bg-base)",
                    color: modo_legenda === "unica" ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${modo_legenda === "unica" ? "var(--accent)" : "var(--border)"}`,
                  }}>
                  Única para todas
                </button>
              </form>
            </div>

            {/* Legenda única — campo visível só quando modo = unica */}
            {modo_legenda === "unica" && (
              <form action={updateModoAction} className="flex flex-col gap-2">
                <input type="hidden" name="modo_legenda" value="unica" />
                <MiniEditor name="legenda" defaultValue={legenda} placeholder="Leyenda que se mostrará en todas las imágenes del grupo..." minRows={2} />
                <div className="flex justify-end">
                  <button type="submit" className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ backgroundColor: "var(--accent)" }}>
                    Guardar leyenda
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Lista de imagens (com DnD) */}
          {localImagens.length > 0 && (
            <div className="flex flex-col gap-2">
              {localImagens.map((img) => {
                const isDragging = draggedImgId.current === img.id;
                const removeAction = deletarImagemContent.bind(null, img.id, topicoId);
                return (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleImgDragStart(img.id, e)}
                    onDragOver={(e) => handleImgDragOver(e, img.id)}
                    onDragEnd={handleImgDragEnd}
                    style={{ opacity: isDragging ? 0.4 : 1, transition: "opacity 0.15s" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="shrink-0 cursor-grab active:cursor-grabbing"
                        style={{ color: "var(--text-muted)", opacity: 0.5 }}
                        title="Arrastrar para reordenar">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1 flex items-center gap-3 p-2 rounded-lg"
                        style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-10 w-14 object-cover rounded shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                            {img.url.split("/").pop()}
                          </p>
                          {img.legenda && (
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                              {img.legenda.replace(/<[^>]+>/g, "")}
                            </p>
                          )}
                        </div>
                        {/* Legenda individual só aparece no modo individual */}
                        {modo_legenda === "individual" && (
                          <ImageLegendaEditor imgId={img.id} topicoId={topicoId} legenda={img.legenda} />
                        )}
                        <form action={removeAction} className="shrink-0">
                          <button type="submit" className="h-6 w-6 flex items-center justify-center rounded"
                            style={{ color: "var(--error)" }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload para este grupo */}
          <ImageUploadForm action={addImageAction} compact />
        </div>
      )}
    </div>
  );
}
