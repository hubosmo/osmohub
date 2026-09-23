"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { MiniEditor } from "@/components/editor/MiniEditor";
import { atualizarLegendaImagem } from "@/lib/actions/content";

type Props = {
  imgId: string;
  topicoId: string;
  legenda: string | null;
};

export function ImageLegendaEditor({ imgId, topicoId, legenda }: Props) {
  const [editing, setEditing] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await atualizarLegendaImagem(imgId, topicoId, fd);
      setEditing(false);
    });
  }

  function handleCancel() {
    setEditorKey((k) => k + 1);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 h-5 px-1.5 rounded text-[10px] shrink-0 transition-colors"
        style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
        title="Editar leyenda"
      >
        <Pencil className="h-2.5 w-2.5" />
        {legenda ? "Editar leyenda" : "Añadir leyenda"}
      </button>
    );
  }

  return (
    <div className="w-full mt-2 flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
        <MiniEditor key={editorKey} name="legenda" defaultValue={legenda} placeholder="Descripción de la imagen..." minRows={2} />
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 h-6 px-2.5 rounded text-xs transition-colors"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <X className="h-3 w-3" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1 h-6 px-2.5 rounded text-xs text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Check className="h-3 w-3" />
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
