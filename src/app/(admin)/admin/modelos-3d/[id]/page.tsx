import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { z } from "zod";
import { getModelo3dAdmin } from "@/lib/db/modelos3d";
import { env } from "@/lib/env";
import { urlPublicaDoArquivo } from "@/lib/modelos3d";
import { Modelo3DPanel } from "@/components/admin/panels/Modelo3DPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Modelo3dEditPage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const modelo = await getModelo3dAdmin(id);
  if (!modelo) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <Link
        href="/admin/modelos-3d"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-4 w-4" />
        Modelos 3D
      </Link>

      <Modelo3DPanel data={{
        id: modelo.id,
        titulo: modelo.titulo,
        descricao: modelo.descricao,
        licenca: modelo.licenca,
        creditos: modelo.creditos,
        publicado: modelo.publicado,
        tamanho_bytes: modelo.tamanho_bytes,
        arquivo_url: modelo.arquivo_path ? urlPublicaDoArquivo(env.NEXT_PUBLIC_SUPABASE_URL, modelo.arquivo_path) : null,
        pontos: modelo._count.pontos,
        topicos: modelo._count.topicos,
      }} />
    </div>
  );
}
