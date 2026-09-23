"use client";

import { useState } from "react";
import { Plus, ImageIcon, ChevronDown, ChevronUp, Images } from "lucide-react";
import { ImageUploadForm } from "./ImageUploadForm";

type Props = {
  addImagemAction: (fd: FormData) => Promise<void>;
  // criarGrupoImagens is bound with topicoId so takes no args, but <form action> passes FormData
  addGrupoAction: (fd?: FormData) => Promise<void>;
};

export function AtlasActions({ addImagemAction, addGrupoAction }: Props) {
  const [showSingle, setShowSingle] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* Botão: nuevo grupo */}
      <form action={addGrupoAction}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors border"
          style={{ borderColor: "var(--border)", color: "var(--accent)", backgroundColor: "transparent" }}
        >
          <Images className="h-3.5 w-3.5" />
          Nuevo grupo (carrusel)
        </button>
      </form>

      {/* Botão toggle: imagem individual */}
      <button
        type="button"
        onClick={() => setShowSingle((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors border"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "transparent" }}
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Imagen individual
        {showSingle
          ? <ChevronUp className="h-3 w-3 ml-auto" />
          : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {showSingle && (
        <div
          className="rounded-xl p-4"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-elevated)" }}
        >
          <ImageUploadForm
            action={async (fd) => {
              await addImagemAction(fd);
              setShowSingle(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
