"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function revalidate() {
  revalidatePath("/admin/content");
  revalidatePath("/cursos", "layout");
}

// ─── VIDEO ─────────────────────────────────────────────

export async function upsertVideoContent(topicoId: string, formData: FormData) {
  const youtube_url = s(formData.get("youtube_url")) || null;
  const titulo = s(formData.get("titulo")) || "Video";
  const descricao = s(formData.get("descricao")) || null;
  const legenda = s(formData.get("legenda")) || null;
  const durRaw = parseInt(s(formData.get("duracao_seg")));
  const duracao_seg = isNaN(durRaw) || durRaw <= 0 ? null : durRaw;
  await prisma.video.upsert({
    where: { topico_id: topicoId },
    create: { topico_id: topicoId, titulo, youtube_url, descricao, legenda, duracao_seg },
    update: { titulo, youtube_url, descricao, legenda, duracao_seg },
  });
  revalidate();
}

export async function deletarVideoContent(topicoId: string) {
  await prisma.video.deleteMany({ where: { topico_id: topicoId } });
  revalidate();
}

// ─── ARTIGO ────────────────────────────────────────────

export async function salvarArtigo(topicoId: string, content: object) {
  const topico = await prisma.topico.findUnique({
    where: { id: topicoId },
    select: { titulo: true },
  });
  if (!topico) throw new Error("Tópico no encontrado");

  await prisma.artigo.upsert({
    where: { topico_id: topicoId },
    update: { content },
    create: { topico_id: topicoId, titulo: topico.titulo, content },
  });
  revalidate();
}
