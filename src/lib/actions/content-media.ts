"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { fetchBunnyDuration, parseBunnyUrl } from "@/lib/video/bunny";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function revalidate() {
  revalidatePath("/admin/content");
  revalidatePath("/cursos", "layout");
}

// ─── VIDEO ─────────────────────────────────────────────

export async function upsertVideoContent(topicoId: string, formData: FormData) {
  await requireAdmin();
  const youtube_url = s(formData.get("youtube_url")) || null;
  const titulo = s(formData.get("titulo")) || "Video";
  const descricao = s(formData.get("descricao")) || null;
  const legenda = s(formData.get("legenda")) || null;
  const durRaw = parseInt(s(formData.get("duracao_seg")));
  let duracao_seg = isNaN(durRaw) || durRaw <= 0 ? null : durRaw;
  // Vídeo do Bunny sem duração digitada: busca na API do Bunny
  const bunny = parseBunnyUrl(youtube_url);
  if (bunny && duracao_seg === null) duracao_seg = await fetchBunnyDuration(bunny.libraryId, bunny.videoId);
  await prisma.video.upsert({
    where: { topico_id: topicoId },
    create: { topico_id: topicoId, titulo, youtube_url, descricao, legenda, duracao_seg },
    update: { titulo, youtube_url, descricao, legenda, duracao_seg },
  });
  revalidate();
}

export async function deletarVideoContent(topicoId: string) {
  await requireAdmin();
  await prisma.video.deleteMany({ where: { topico_id: topicoId } });
  revalidate();
}

// ─── ARTIGO ────────────────────────────────────────────

export async function salvarArtigo(topicoId: string, content: object) {
  await requireAdmin();
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
