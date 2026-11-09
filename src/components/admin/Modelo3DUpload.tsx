"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { createClient } from "@/lib/supabase/client";
import { autorizarUploadModelo3d, confirmarUploadModelo3d } from "@/lib/actions/content-modelos3d";
import { BUCKET_MODELOS_3D, MAX_BYTES_MODELO, extensaoValida, formatarTamanho } from "@/lib/modelos3d";

// O arquivo vai direto do navegador ao Storage (URL assinada); o servidor só autoriza e confirma
export function Modelo3DUpload({ modeloId, temArquivo }: { modeloId: string; temArquivo: boolean }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(arquivo: File) {
    if (!extensaoValida(arquivo.name)) return toast.error("El archivo debe ser .glb");
    if (arquivo.size > MAX_BYTES_MODELO) return toast.error(`El archivo supera ${formatarTamanho(MAX_BYTES_MODELO)}`);

    setEnviando(true);
    try {
      const { caminho, token } = await autorizarUploadModelo3d(modeloId, arquivo.name, arquivo.size);
      const { error } = await createClient()
        .storage.from(BUCKET_MODELOS_3D)
        .uploadToSignedUrl(caminho, token, arquivo, { contentType: "model/gltf-binary" });
      if (error) throw new Error(error.message);
      await confirmarUploadModelo3d(modeloId, caminho);
      toast.success("¡Modelo subido!");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir el archivo");
    } finally {
      setEnviando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={entrada} id={`modelo-arquivo-${modeloId}`} type="file" accept=".glb,model/gltf-binary" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void enviar(f); }}
      />
      <LoadingButton
        variant="secondary" loading={enviando} loadingText="Subiendo…" className="w-auto px-4 py-2"
        onClick={() => entrada.current?.click()}
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {temArquivo ? "Reemplazar archivo .glb" : "Subir archivo .glb"}
      </LoadingButton>
      <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
        Formato GLB, hasta {formatarTamanho(MAX_BYTES_MODELO)}. Comprime el modelo antes (Draco) para que cargue rápido en el celular.
      </p>
    </div>
  );
}
