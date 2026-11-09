"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BUCKET_MODELOS_3D, MAX_BYTES_MODELO, caminhoDoArquivo, dadosModeloSchema, extensaoValida,
} from "@/lib/modelos3d";

function revalidate(id?: string) {
  revalidatePath("/admin/modelos-3d");
  if (id) revalidatePath(`/admin/modelos-3d/${id}`);
}

export async function criarModelo3d(fd: FormData): Promise<string> {
  await requireAdmin();
  const titulo = (fd.get("titulo") as string | null)?.trim();
  if (!titulo) throw new Error("Título obrigatório");
  const modelo = await prisma.modelo3D.create({ data: { titulo }, select: { id: true } });
  revalidate();
  return modelo.id;
}

export async function atualizarModelo3d(modeloId: string, fd: FormData): Promise<void> {
  await requireAdmin();
  const dados = dadosModeloSchema.safeParse({
    titulo: fd.get("titulo") ?? "",
    descricao: (fd.get("descricao") as string | null) ?? undefined,
    licenca: (fd.get("licenca") as string | null) ?? undefined,
    creditos: (fd.get("creditos") as string | null) ?? undefined,
    publicado: fd.get("publicado") === "on",
  });
  if (!dados.success) throw new Error(dados.error.issues[0].message);
  await prisma.modelo3D.update({ where: { id: modeloId }, data: dados.data });
  revalidate(modeloId);
}

// Remove o arquivo do bucket (melhor esforço: o registro no banco é a fonte da verdade)
async function removerArquivo(caminho: string | null | undefined) {
  if (!caminho) return;
  await createAdminClient().storage.from(BUCKET_MODELOS_3D).remove([caminho]).catch(() => undefined);
}

export async function excluirModelo3d(modeloId: string): Promise<void> {
  await requireAdmin();
  const modelo = await prisma.modelo3D.findUnique({ where: { id: modeloId }, select: { arquivo_path: true } });
  await prisma.modelo3D.delete({ where: { id: modeloId } });
  await removerArquivo(modelo?.arquivo_path);
  revalidate();
}

// O GLB tem dezenas de MB: sobe direto do navegador para o Storage com uma URL assinada de uso único
// (passar pelo servidor estouraria o limite de corpo da Vercel). O servidor só autoriza e depois confirma.
export type UploadAutorizado = { caminho: string; token: string };

export async function autorizarUploadModelo3d(modeloId: string, nomeArquivo: string, tamanho: number): Promise<UploadAutorizado> {
  await requireAdmin();
  if (!extensaoValida(nomeArquivo)) throw new Error("El archivo debe ser .glb");
  if (!Number.isFinite(tamanho) || tamanho <= 0) throw new Error("Archivo inválido");
  if (tamanho > MAX_BYTES_MODELO) throw new Error(`El archivo supera ${MAX_BYTES_MODELO / (1024 * 1024)} MB`);
  const existe = await prisma.modelo3D.findUnique({ where: { id: modeloId }, select: { id: true } });
  if (!existe) throw new Error("Modelo no encontrado");

  const caminho = caminhoDoArquivo(modeloId);
  const { data, error } = await createAdminClient().storage.from(BUCKET_MODELOS_3D).createSignedUploadUrl(caminho);
  if (error || !data) throw new Error(error?.message ?? "No se pudo autorizar el envío");
  return { caminho, token: data.token };
}

// Depois do envio: confere que o arquivo existe no bucket, grava o caminho e apaga o arquivo anterior
export async function confirmarUploadModelo3d(modeloId: string, caminho: string): Promise<void> {
  await requireAdmin();
  if (!caminho.startsWith(`${modeloId}/`) || !extensaoValida(caminho)) throw new Error("Ruta inválida");

  const [pasta, nome] = caminho.split("/");
  const { data, error } = await createAdminClient().storage.from(BUCKET_MODELOS_3D).list(pasta, { search: nome, limit: 5 });
  const arquivo = data?.find((f) => f.name === nome);
  if (error || !arquivo) throw new Error("El archivo no llegó al almacenamiento");
  const tamanho = Number((arquivo.metadata as { size?: number } | null)?.size ?? 0);
  if (tamanho > MAX_BYTES_MODELO) {
    await removerArquivo(caminho);
    throw new Error("El archivo supera el tamaño máximo");
  }

  const anterior = await prisma.modelo3D.findUnique({ where: { id: modeloId }, select: { arquivo_path: true } });
  await prisma.modelo3D.update({ where: { id: modeloId }, data: { arquivo_path: caminho, tamanho_bytes: tamanho || null } });
  if (anterior?.arquivo_path && anterior.arquivo_path !== caminho) await removerArquivo(anterior.arquivo_path);
  revalidate(modeloId);
}
