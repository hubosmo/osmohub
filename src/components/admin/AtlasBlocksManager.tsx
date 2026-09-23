"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { GripVertical, Trash2, Images, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { GrupoImagensCard } from "./GrupoImagensCard";
import { ImageLegendaEditor } from "./ImageLegendaEditor";
import { ImageUploadForm } from "./ImageUploadForm";
import {
  reordenarBlocosAtlas,
  deletarImagemContent,
} from "@/lib/actions/content";

type ImgBlock = {
  type: "imagem";
  id: string;
  url: string;
  legenda: string | null;
  ordem: number;
};

type GrupoBlock = {
  type: "grupo";
  id: string;
  titulo: string | null;
  legenda: string | null;
  modo_legenda: string;
  ordem: number;
  imagens: { id: string; url: string; legenda: string | null }[];
};

type Block = ImgBlock | GrupoBlock;

type Props = {
  topicoId: string;
  grupos: Omit<GrupoBlock, "type">[];
  imagens: Omit<ImgBlock, "type">[];
  addImagemAction: (fd: FormData) => Promise<void>;
  addGrupoAction: (fd?: FormData) => Promise<void>;
};

export function AtlasBlocksManager({ topicoId, grupos, imagens, addImagemAction, addGrupoAction }: Props) {
  const initialBlocks: Block[] = [
    ...grupos.map(g => ({ ...g, type: "grupo" as const })),
    ...imagens.map(i => ({ ...i, type: "imagem" as const })),
  ].sort((a, b) => a.ordem - b.ordem);

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Keep a ref in sync so handleDragEnd can read current order without stale closure
  const blocksRef = useRef(blocks);
  useEffect(() => { blocksRef.current = blocks; }, [blocks]);

  // DnD state
  const draggedId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  function handleDragStart(id: string, e: React.DragEvent) {
    draggedId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedId.current || draggedId.current === targetId) return;
    dragOverId.current = targetId;
    setBlocks(prev => {
      const from = prev.findIndex(b => b.id === draggedId.current);
      const to   = prev.findIndex(b => b.id === targetId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDragEnd() {
    draggedId.current = null;
    dragOverId.current = null;
    const ordered = blocksRef.current.map(b => ({ type: b.type, id: b.id }));
    startTransition(async () => {
      await reordenarBlocosAtlas(topicoId, ordered);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block) => {
        const isDragging = draggedId.current === block.id;

        return (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleDragStart(block.id, e)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragEnd={handleDragEnd}
            style={{ opacity: isDragging ? 0.4 : 1, transition: "opacity 0.15s" }}
          >
            {block.type === "grupo" ? (
              <div className="flex items-start gap-1.5">
                {/* Drag handle */}
                <div
                  className="mt-2.5 shrink-0 cursor-grab active:cursor-grabbing"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                  title="Arrastrar para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <GrupoImagensCard
                    grupoId={block.id}
                    topicoId={topicoId}
                    titulo={block.titulo}
                    legenda={block.legenda}
                    modo_legenda={block.modo_legenda}
                    ordem={block.ordem}
                    imagens={block.imagens}
                  />
                </div>
              </div>
            ) : (
              /* Imagen individual */
              <div className="flex items-center gap-1.5">
                <div
                  className="shrink-0 cursor-grab active:cursor-grabbing"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                  title="Arrastrar para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <div
                  className="flex-1 flex flex-col p-2.5 rounded-xl"
                  style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  {/* Label */}
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Imagen individual
                  </p>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.url} alt="" className="h-10 w-14 object-cover rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {block.url.split("/").pop()}
                      </p>
                      {block.legenda && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                          {block.legenda.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                    </div>
                    <ImageLegendaEditor imgId={block.id} topicoId={topicoId} legenda={block.legenda} />
                    <form action={deletarImagemContent.bind(null, block.id, topicoId)} className="shrink-0">
                      <button type="submit" className="h-6 w-6 flex items-center justify-center rounded"
                        style={{ color: "var(--error)" }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Botões de adicionar ────────────────── */}
      <div className="flex flex-col gap-2 mt-1">
        {/* Nuevo grupo */}
        <form action={addGrupoAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--accent)", backgroundColor: "transparent" }}
          >
            <Images className="h-3.5 w-3.5 shrink-0" />
            Nuevo grupo (carrusel)
          </button>
        </form>

        {/* Imagen individual */}
        <button
          type="button"
          onClick={() => setShowAddSingle(v => !v)}
          className="w-full flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "transparent" }}
        >
          <ImageIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Imagen individual</span>
          {showAddSingle
            ? <ChevronUp className="h-3.5 w-3.5 shrink-0" />
            : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
        </button>

        {showAddSingle && (
          <div className="rounded-xl p-4" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}>
            <ImageUploadForm
              action={async (fd) => {
                await addImagemAction(fd);
                setShowAddSingle(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
