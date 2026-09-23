"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function str(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

// ─── CURSOS ────────────────────────────────────────────────

export async function criarCurso(formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  const curso = await prisma.curso.create({
    data: {
      nome,
      slug: toSlug(nome),
      descricao: str(formData.get("descricao")) || null,
      icone: str(formData.get("icone")) || null,
      cor_destaque: str(formData.get("cor_destaque")) || null,
    },
  });
  redirect(`/admin/cursos/${curso.id}`);
}

export async function atualizarCurso(id: string, formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  await prisma.curso.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: str(formData.get("descricao")) || null,
      icone: str(formData.get("icone")) || null,
      cor_destaque: str(formData.get("cor_destaque")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidatePath(`/admin/cursos/${id}`);
  revalidatePath("/admin/cursos");
}

export async function deletarCurso(id: string) {
  await prisma.curso.delete({ where: { id } });
  redirect("/admin/cursos");
}

// ─── DISCIPLINAS ───────────────────────────────────────────

export async function criarDisciplina(cursoId: string, formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  const d = await prisma.disciplina.create({
    data: {
      nome,
      slug: toSlug(nome),
      curso_id: cursoId,
      descricao: str(formData.get("descricao")) || null,
      icone: str(formData.get("icone")) || null,
      cor_destaque: str(formData.get("cor_destaque")) || null,
    },
  });
  redirect(`/admin/disciplinas/${d.id}`);
}

export async function atualizarDisciplina(id: string, formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  await prisma.disciplina.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: str(formData.get("descricao")) || null,
      icone: str(formData.get("icone")) || null,
      cor_destaque: str(formData.get("cor_destaque")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidatePath(`/admin/disciplinas/${id}`);
}

export async function deletarDisciplina(id: string, cursoId: string) {
  await prisma.disciplina.delete({ where: { id } });
  redirect(`/admin/cursos/${cursoId}`);
}

// ─── AREAS ─────────────────────────────────────────────────

export async function criarArea(disciplinaId: string, formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  const a = await prisma.area.create({
    data: {
      nome,
      slug: toSlug(nome),
      disciplina_id: disciplinaId,
      descricao: str(formData.get("descricao")) || null,
    },
  });
  redirect(`/admin/areas/${a.id}`);
}

export async function atualizarArea(id: string, formData: FormData) {
  const nome = str(formData.get("nome"));
  if (!nome) return;
  await prisma.area.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: str(formData.get("descricao")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidatePath(`/admin/areas/${id}`);
}

export async function deletarArea(id: string, disciplinaId: string) {
  await prisma.area.delete({ where: { id } });
  redirect(`/admin/disciplinas/${disciplinaId}`);
}

// ─── TÓPICOS ───────────────────────────────────────────────

export async function criarTopico(areaId: string, formData: FormData) {
  const titulo = str(formData.get("titulo"));
  if (!titulo) return;
  const t = await prisma.topico.create({
    data: {
      titulo,
      slug: toSlug(titulo),
      area_id: areaId,
      objetivo: str(formData.get("objetivo")) || null,
    },
  });
  redirect(`/admin/topicos/${t.id}`);
}

export async function atualizarTopico(id: string, formData: FormData) {
  const titulo = str(formData.get("titulo"));
  if (!titulo) return;
  const durMin = parseInt(str(formData.get("duracao_estimada_min")));
  await prisma.topico.update({
    where: { id },
    data: {
      titulo,
      slug: toSlug(titulo),
      objetivo: str(formData.get("objetivo")) || null,
      descricao_curta: str(formData.get("descricao_curta")) || null,
      duracao_estimada_min: isNaN(durMin) ? null : durMin,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidatePath(`/admin/topicos/${id}`);
}

export async function deletarTopico(id: string, areaId: string) {
  await prisma.topico.delete({ where: { id } });
  redirect(`/admin/areas/${areaId}`);
}

// ─── VIDEO ─────────────────────────────────────────────────

export async function upsertVideo(topicoId: string, formData: FormData) {
  const youtube_url = str(formData.get("youtube_url")) || null;
  const titulo = str(formData.get("titulo")) || "Video";
  await prisma.video.upsert({
    where: { topico_id: topicoId },
    create: { topico_id: topicoId, titulo, youtube_url },
    update: { titulo, youtube_url },
  });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

export async function deletarVideo(topicoId: string) {
  await prisma.video.deleteMany({ where: { topico_id: topicoId } });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

// ─── TABELAS ───────────────────────────────────────────

export async function criarTabela(topicoId: string, formData: FormData) {
  const titulo = str(formData.get("titulo"));
  if (!titulo) return;
  const tipo = str(formData.get("tipo")) || "resumen";
  const last = await prisma.tabelaTopico.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.tabelaTopico.create({
    data: { topico_id: topicoId, titulo, tipo, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

export async function deletarTabela(id: string, topicoId: string) {
  await prisma.tabelaTopico.delete({ where: { id } });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

export async function adicionarLinha(tabelaId: string, topicoId: string, formData: FormData) {
  const categoria = str(formData.get("categoria"));
  const conteudo = str(formData.get("conteudo"));
  if (!categoria || !conteudo) return;
  const last = await prisma.tabelaLinha.findFirst({
    where: { tabela_id: tabelaId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.tabelaLinha.create({
    data: { tabela_id: tabelaId, categoria, conteudo, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

export async function deletarLinha(id: string, topicoId: string) {
  await prisma.tabelaLinha.delete({ where: { id } });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

// ─── IMAGENS ───────────────────────────────────────────────

export async function adicionarImagem(topicoId: string, formData: FormData) {
  const url = str(formData.get("url"));
  if (!url) return;
  const legenda = str(formData.get("legenda")) || null;
  const last = await prisma.imagemTopico.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.imagemTopico.create({
    data: { topico_id: topicoId, url, legenda, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidatePath(`/admin/topicos/${topicoId}`);
}

export async function deletarImagem(id: string, topicoId: string) {
  await prisma.imagemTopico.delete({ where: { id } });
  revalidatePath(`/admin/topicos/${topicoId}`);
}
