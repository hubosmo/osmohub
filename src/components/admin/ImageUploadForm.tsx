"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Link2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { MiniEditor } from "@/components/editor/MiniEditor";

type Props = {
  action: (formData: FormData) => Promise<void>;
  compact?: boolean;
};

export function ImageUploadForm({ action, compact = false }: Props) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editorKey, setEditorKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se aceptan archivos de imagen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // Assign to input
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileRef.current) fileRef.current.files = dt.files;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const url = (fd.get("url") as string | null)?.trim();
    if ((!file || file.size === 0) && !url) {
      toast.error("Selecciona un archivo o ingresa una URL.");
      return;
    }
    startTransition(async () => {
      try {
        await action(fd);
        toast.success("¡Imagen agregada!");
        formRef.current?.reset();
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
        setEditorKey((k) => k + 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        toast.error(`Error al agregar: ${msg}`);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        {(["upload", "url"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: mode === m ? "var(--accent)" : "var(--bg-elevated)",
              color: mode === m ? "#fff" : "var(--text-muted)",
            }}
          >
            {m === "upload" ? <Upload className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            {m === "upload" ? "Subir archivo" : "URL"}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div>
          {preview ? (
            <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="w-full max-h-40 object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 cursor-pointer transition-colors"
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                backgroundColor: dragOver ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--bg-base)",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <ImageIcon className="h-7 w-7" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Arrastra una imagen o <span style={{ color: "var(--accent)" }}>haz clic para seleccionar</span>
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                JPG, PNG, WebP · máx. 5 MB
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            name="file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div>
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
      )}

      {/* Legenda */}
      {!compact && (
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
            Leyenda (opcional)
          </label>
          <MiniEditor key={editorKey} name="legenda" placeholder="Descripción de la imagen..." minRows={3} />
        </div>
      )}

      {/* Botão */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {isPending ? "Subiendo…" : compact ? "Agregar" : "Agregar imagen"}
        </button>
      </div>
    </form>
  );
}
