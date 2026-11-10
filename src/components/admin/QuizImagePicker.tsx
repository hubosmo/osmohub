"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Images, BookImage, X, Loader2, Check } from "lucide-react";
import { uploadImagemQuiz, listarImagensGaleria } from "@/lib/actions/content-quiz-imagens";
import { Modal } from "@/components/ui/Modal";
import { COMPRESSAO_ATLAS, comprimirImagem } from "@/lib/comprimir-imagem";
import { formatarTamanho } from "@/lib/modelos3d";

interface GaleriaData {
  quiz: { id: string; url: string; nome: string }[];
  atlas: { id: string; url: string; nome: string }[];
}

interface Props {
  quizId: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  compact?: boolean;
}

export function QuizImagePicker({ quizId, value, onChange, label, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "gallery" | "atlas">("upload");
  const [galeria, setGaleria] = useState<GaleriaData | null>(null);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [optimizando, setOptimizando] = useState(false);
  const [infoOtimizacao, setInfoOtimizacao] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    setOpen(true);
    if (tab !== "upload" && !galeria) loadGallery();
  }

  function loadGallery() {
    setLoadingGallery(true);
    startTransition(async () => {
      const data = await listarImagensGaleria();
      setGaleria(data);
      setLoadingGallery(false);
    });
  }

  function handleTabChange(t: "upload" | "gallery" | "atlas") {
    setTab(t);
    if (t !== "upload" && !galeria) loadGallery();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;
    // Reduz antes do envio e deixa no input a versão leve, que é a que handleUpload lê
    setOptimizando(true);
    const { arquivo, antes, depois, reduziu } = await comprimirImagem(original, COMPRESSAO_ATLAS);
    setOptimizando(false);
    if (reduziu) {
      const dt = new DataTransfer();
      dt.items.add(arquivo);
      if (fileRef.current) fileRef.current.files = dt.files;
      setInfoOtimizacao(`Optimizada: ${formatarTamanho(antes)} → ${formatarTamanho(depois)}`);
    } else {
      setInfoOtimizacao(null);
    }
    setPreview(URL.createObjectURL(arquivo));
  }

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      try {
        const { url } = await uploadImagemQuiz(quizId, fd);
        onChange(url);
        setOpen(false);
        setPreview(null);
        setInfoOtimizacao(null);
        if (fileRef.current) fileRef.current.value = "";
        // Refresh galeria
        const data = await listarImagensGaleria();
        setGaleria(data);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function selectFromGallery(url: string) {
    onChange(url);
    setOpen(false);
  }

  function clearImage() {
    onChange("");
    setPreview(null);
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    borderRadius: 8,
    fontSize: 11,
    padding: "4px 10px",
    cursor: "pointer",
  };

  const tabs: { key: "upload" | "gallery" | "atlas"; label: string; icon: React.ReactNode }[] = [
    { key: "upload",  label: "Subir",   icon: <Upload    className="h-3.5 w-3.5" /> },
    { key: "gallery", label: "Galería", icon: <Images    className="h-3.5 w-3.5" /> },
    { key: "atlas",   label: "Atlas",   icon: <BookImage className="h-3.5 w-3.5" /> },
  ];

  const currentList = tab === "atlas" ? (galeria?.atlas ?? []) : (galeria?.quiz ?? []);

  return (
    <div>
      {label && (
        <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative shrink-0" style={{ width: compact ? 48 : 72, height: compact ? 36 : 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="w-full h-full rounded object-cover"
              style={{ border: "1px solid var(--border)" }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--error)", color: "#fff", fontSize: 10 }}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <div
            className="shrink-0 rounded flex items-center justify-center"
            style={{
              width: compact ? 48 : 72,
              height: compact ? 36 : 48,
              backgroundColor: "var(--bg-elevated)",
              border: "1px dashed var(--border)",
            }}
          >
            <Images className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        <button
          type="button"
          onClick={openPicker}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
          style={inputStyle}
        >
          {value ? "Cambiar imagen" : "Agregar imagen"}
        </button>
      </div>

      {/* Modal */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          label="Seleccionar imagen"
          panelClassName="overflow-hidden flex flex-col"
          panelStyle={{ maxHeight: "80vh" }}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Seleccionar imagen
          </p>
          <button type="button" onClick={() => setOpen(false)} style={{ color: "var(--text-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className="flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors"
              style={{
                borderColor: tab === key ? "var(--accent)" : "transparent",
                color: tab === key ? "var(--accent)" : "var(--text-muted)",
                marginBottom: -1,
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
          {tab === "upload" && (
            <div className="flex flex-col gap-4">
              {preview && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="w-full max-h-48 object-contain" style={{ backgroundColor: "var(--bg-elevated)" }} />
                </div>
              )}

              <label
                className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer py-8 transition-opacity hover:opacity-80"
                style={{
                  border: "2px dashed var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">
                  {preview ? "Cambiar archivo" : "Clic para seleccionar imagen"}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                  {optimizando ? "Optimizando…" : infoOtimizacao ?? "JPG, PNG, WebP — se optimiza automáticamente"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { void handleFileChange(e); }}
                />
              </label>

              <button
                type="button"
                onClick={handleUpload}
                disabled={!preview || isPending || optimizando}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isPending ? "Subiendo..." : "Subir imagen"}
              </button>
            </div>
          )}

          {(tab === "gallery" || tab === "atlas") && (
            <div>
              {loadingGallery ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              ) : currentList.length === 0 ? (
                <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
                  {tab === "atlas" ? "Sin imágenes de atlas disponibles." : "Sin imágenes en la galería aún."}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {currentList.map((img) => {
                    const selected = img.url === value;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => selectFromGallery(img.url)}
                        className="relative aspect-square rounded-lg overflow-hidden transition-all hover:opacity-90"
                        title={img.nome}
                        style={{
                          border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.nome} className="w-full h-full object-cover" />
                        {selected && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                          >
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        </Modal>
    </div>
  );
}
