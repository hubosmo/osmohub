"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, X, Moon, Sun } from "lucide-react";

type Variant = "dark" | "light";

type Props = {
  entityId: string;
  capaUrlDark: string | null;
  capaUrlLight: string | null;
  uploadAction: (id: string, formData: FormData) => Promise<void>;
  aspectRatio?: string;
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 1080;
      const ratio = Math.min(1, MAX_W / img.width);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objUrl);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
        "image/jpeg",
        0.8
      );
    };
    img.onerror = reject;
    img.src = objUrl;
  });
}

export function CapaUploadSection({ entityId, capaUrlDark, capaUrlLight, uploadAction, aspectRatio = "9/16" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Variant>("dark");
  const [pendingDark, setPendingDark] = useState<string | null>(null);
  const [pendingLight, setPendingLight] = useState<string | null>(null);
  const [uploadedDark, setUploadedDark] = useState<string | null>(null);
  const [uploadedLight, setUploadedLight] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentPending = activeTab === "dark" ? pendingDark : pendingLight;
  const currentUploaded = activeTab === "dark" ? uploadedDark : uploadedLight;
  const currentSaved = activeTab === "dark" ? capaUrlDark : capaUrlLight;
  const displaySrc = currentPending ?? currentUploaded ?? currentSaved;
  const currentPreview = currentPending;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressed);
    setCompressedFile(compressed);
    if (activeTab === "dark") setPendingDark(previewUrl);
    else setPendingLight(previewUrl);
  }

  function handleClear() {
    setCompressedFile(null);
    if (activeTab === "dark") setPendingDark(null);
    else setPendingLight(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!compressedFile) return;
    const pendingUrl = activeTab === "dark" ? pendingDark : pendingLight;
    const formData = new FormData();
    formData.append("capa", compressedFile, "capa.jpg");
    formData.append("variant", activeTab);
    startTransition(async () => {
      await uploadAction(entityId, formData);
      setCompressedFile(null);
      if (activeTab === "dark") {
        setUploadedDark(pendingUrl);
        setPendingDark(null);
      } else {
        setUploadedLight(pendingUrl);
        setPendingLight(null);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="rounded-xl p-5 mt-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
        Portada {aspectRatio === "1/1" ? "(formato cuadrado 1:1)" : "(formato Stories 9:16)"}
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ backgroundColor: "var(--bg-elevated)" }}>
        {(["dark", "light"] as Variant[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setCompressedFile(null);
              if (activeTab !== tab) {
                if (activeTab === "dark") setPendingDark(null);
                else setPendingLight(null);
              }
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={
              activeTab === tab
                ? { backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }
                : { color: "var(--text-muted)" }
            }
          >
            {tab === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            {tab === "dark" ? "Tema oscuro" : "Tema claro"}
            {((tab === "dark" && capaUrlDark) || (tab === "light" && capaUrlLight)) && (
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        {/* Preview 9:16 */}
        <div
          className="relative shrink-0 rounded-xl overflow-hidden cursor-pointer"
          style={{
            width: aspectRatio === "1/1" ? 120 : 90,
            aspectRatio,
            backgroundColor: "var(--bg-elevated)",
            border: "1px dashed var(--border)",
          }}
          onClick={() => inputRef.current?.click()}
        >
          {displaySrc ? (
            <img src={displaySrc} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <ImagePlus className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <span className="text-[10px] text-center px-1" style={{ color: "var(--text-muted)" }}>
                Subir imagen
              </span>
            </div>
          )}
        </div>

        {/* Form + actions */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Haz clic en la imagen para seleccionar (JPG, PNG, WebP).
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Se comprimirá automáticamente.{" "}
            {aspectRatio === "1/1"
              ? "Proporción recomendada: 1×1 (ej. 1080×1080 px)."
              : "Proporción recomendada: 9×16 (ej. 1080×1920 px)."}
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {currentPreview && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <X className="h-3 w-3" /> Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={!currentPreview || isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: currentPreview ? "var(--accent)" : "var(--bg-elevated)" }}
            >
              {isPending ? "Subiendo…" : "Guardar portada"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
