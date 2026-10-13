"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function revalidate() {
  revalidatePath("/admin/content");
  revalidatePath("/cursos", "layout");
}

// ─── GRUPOS DE IMAGENS ────────────────────────────────

export async function criarGrupoImagens(topicoId: string, _fd?: FormData) {
  const last = await prisma.grupoImagensTopico.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.grupoImagensTopico.create({
    data: { topico_id: topicoId, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidate();
}

export async function atualizarTituloGrupo(grupoId: string, topicoId: string, formData: FormData) {
  const titulo = s(formData.get("titulo")) || null;
  await prisma.grupoImagensTopico.update({ where: { id: grupoId }, data: { titulo } });
  revalidate();
}

export async function reordenarBlocosAtlas(
  topicoId: string,
  blocks: { type: "imagem" | "grupo"; id: string }[]
) {
  await prisma.$transaction(
    blocks.map((b, idx) =>
      b.type === "imagem"
        ? prisma.imagemTopico.update({ where: { id: b.id }, data: { ordem: idx } })
        : prisma.grupoImagensTopico.update({ where: { id: b.id }, data: { ordem: idx } })
    )
  );
  revalidate();
}

export async function deletarGrupoImagens(grupoId: string, topicoId: string) {
  await prisma.grupoImagensTopico.deleteMany({ where: { id: grupoId } });
  revalidate();
}

export async function reordenarImagensGrupo(
  grupoId: string,
  topicoId: string,
  imagemIds: string[]
) {
  await prisma.$transaction(
    imagemIds.map((id, idx) =>
      prisma.imagemTopico.update({ where: { id }, data: { ordem: idx } })
    )
  );
  revalidate();
}

export async function atualizarModoLegendaGrupo(grupoId: string, topicoId: string, formData: FormData) {
  const modo = s(formData.get("modo_legenda")) as "individual" | "unica";
  const legenda = s(formData.get("legenda")) || null;
  await prisma.grupoImagensTopico.update({
    where: { id: grupoId },
    data: { modo_legenda: modo, legenda: modo === "unica" ? legenda : null },
  });
  revalidate();
}

export async function adicionarImagemAoGrupo(grupoId: string, topicoId: string, formData: FormData) {
  let url = s(formData.get("url"));
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `topicos/${topicoId}/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("capas")
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("capas").getPublicUrl(storagePath);
    url = data.publicUrl;
  }
  if (!url) return;
  const last = await prisma.imagemTopico.findFirst({
    where: { grupo_id: grupoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.imagemTopico.create({
    data: {
      topico_id: topicoId,
      grupo_id: grupoId,
      url,
      legenda: s(formData.get("legenda")) || null,
      ordem: (last?.ordem ?? -1) + 1,
    },
  });
  revalidate();
}

// ─── IMAGENS STANDALONE ───────────────────────────────

export async function adicionarImagemContent(topicoId: string, formData: FormData) {
  let url = s(formData.get("url"));

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const storagePath = `topicos/${topicoId}/${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("capas")
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });
    if (error) {
      console.error("[adicionarImagem] Storage error:", error);
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from("capas").getPublicUrl(storagePath);
    url = data.publicUrl;
  }

  if (!url) return;

  const last = await prisma.imagemTopico.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.imagemTopico.create({
    data: {
      topico_id: topicoId,
      url,
      legenda: s(formData.get("legenda")) || null,
      ordem: (last?.ordem ?? -1) + 1,
    },
  });
  revalidate();
}

export async function atualizarLegendaImagem(id: string, topicoId: string, formData: FormData) {
  const legenda = s(formData.get("legenda")) || null;
  await prisma.imagemTopico.update({ where: { id }, data: { legenda } });
  revalidate();
}

export async function deletarImagemContent(id: string, topicoId: string) {
  await prisma.imagemTopico.delete({ where: { id } });
  revalidate();
}
