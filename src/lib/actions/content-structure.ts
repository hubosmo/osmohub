"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

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

function s(v: FormDataEntryValue | null) {
  return String(v ?? "").trim();
}

function revalidate() {
  revalidatePath("/admin/content");
  revalidatePath("/cursos", "layout");
}

// ─── REORDENAÇÃO ───────────────────────────────────────

export async function reordenarItens(
  tipo: "curso" | "disciplina" | "area" | "topico",
  items: { id: string; ordem: number }[]
) {
  await prisma.$transaction(
    items.map(({ id, ordem }) => {
      if (tipo === "curso") return prisma.curso.update({ where: { id }, data: { ordem } });
      if (tipo === "disciplina") return prisma.disciplina.update({ where: { id }, data: { ordem } });
      if (tipo === "area") return prisma.area.update({ where: { id }, data: { ordem } });
      return prisma.topico.update({ where: { id }, data: { ordem } });
    })
  );
  revalidate();
}

// ─── CURSOS ────────────────────────────────────────────

export async function criarCursoContent(formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  const c = await prisma.curso.create({ data: { nome, slug: toSlug(nome) } });
  redirect(`/admin/content?curso=${c.id}`);
}

export async function atualizarCursoContent(id: string, formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  await prisma.curso.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: s(formData.get("descricao")) || null,
      icone: s(formData.get("icone")) || null,
      cor_destaque: s(formData.get("cor_destaque")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidate();
}

export async function deletarCursoContent(id: string) {
  await prisma.curso.delete({ where: { id } });
  redirect("/admin/content");
}

// ─── DISCIPLINAS ───────────────────────────────────────

export async function criarDisciplinaContent(cursoId: string, formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  const d = await prisma.disciplina.create({
    data: { nome, slug: toSlug(nome), curso_id: cursoId },
  });
  redirect(`/admin/content?disciplina=${d.id}`);
}

export async function atualizarDisciplinaContent(id: string, formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  await prisma.disciplina.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: s(formData.get("descricao")) || null,
      icone: s(formData.get("icone")) || null,
      cor_destaque: s(formData.get("cor_destaque")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidate();
}

export async function deletarDisciplinaContent(id: string, cursoId: string) {
  await prisma.disciplina.delete({ where: { id } });
  redirect(`/admin/content?curso=${cursoId}`);
}

// ─── AREAS ─────────────────────────────────────────────

export async function criarAreaContent(disciplinaId: string, formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  const a = await prisma.area.create({
    data: { nome, slug: toSlug(nome), disciplina_id: disciplinaId },
  });
  redirect(`/admin/content?area=${a.id}`);
}

export async function atualizarAreaContent(id: string, formData: FormData) {
  const nome = s(formData.get("nome"));
  if (!nome) return;
  await prisma.area.update({
    where: { id },
    data: {
      nome,
      slug: toSlug(nome),
      descricao: s(formData.get("descricao")) || null,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidate();
}

export async function deletarAreaContent(id: string, disciplinaId: string) {
  await prisma.area.delete({ where: { id } });
  redirect(`/admin/content?disciplina=${disciplinaId}`);
}

// ─── TÓPICOS ───────────────────────────────────────────

export async function criarTopicoContent(areaId: string, formData: FormData) {
  const titulo = s(formData.get("titulo"));
  if (!titulo) return;
  const t = await prisma.topico.create({
    data: {
      titulo,
      slug: toSlug(titulo),
      area_id: areaId,
      objetivo: s(formData.get("objetivo")) || null,
    },
  });
  redirect(`/admin/content?topico=${t.id}`);
}

export async function atualizarTopicoContent(id: string, formData: FormData) {
  const titulo = s(formData.get("titulo"));
  if (!titulo) return;
  const durMin = parseInt(s(formData.get("duracao_estimada_min")));
  await prisma.topico.update({
    where: { id },
    data: {
      titulo,
      slug: toSlug(titulo),
      objetivo: s(formData.get("objetivo")) || null,
      descricao_curta: s(formData.get("descricao_curta")) || null,
      duracao_estimada_min: isNaN(durMin) ? null : durMin,
      ordem: parseInt(s(formData.get("ordem")) || "0") || 0,
      publicado: formData.get("publicado") === "on",
    },
  });
  revalidate();
}

export async function toggleTopicoSection(
  id: string,
  section: "video_ativo" | "artigo_ativo" | "atlas_ativo" | "tabelas_ativo",
  ativo: boolean
) {
  await prisma.topico.update({ where: { id }, data: { [section]: ativo } });
  revalidate();
}

export async function deletarTopicoContent(id: string, areaId: string) {
  await prisma.topico.delete({ where: { id } });
  redirect(`/admin/content?area=${areaId}`);
}

// ─── CAPAS (CURSO / DISCIPLINA / AREA) ─────────────────

async function uploadCapa(
  bucket: string,
  basePath: string,
  formData: FormData,
  saveFn: (url: string, field: "capa_url" | "capa_url_light") => Promise<void>
) {
  const file = formData.get("capa") as File | null;
  if (!file || file.size === 0) return;

  const variant = String(formData.get("variant") ?? "dark") === "light" ? "light" : "dark";
  const field: "capa_url" | "capa_url_light" = variant === "light" ? "capa_url_light" : "capa_url";
  const fullPath = `${basePath}-${variant}.jpg`;
  const bytes = await file.arrayBuffer();

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, bytes, { contentType: "image/jpeg", upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  await saveFn(data.publicUrl, field);
  revalidate();
}

export async function uploadCapaCurso(id: string, formData: FormData) {
  await uploadCapa("capas", `cursos/${id}/capa`, formData, (url, field) =>
    prisma.curso.update({ where: { id }, data: { [field]: url } }).then(() => {})
  );
}

export async function uploadCapaDisciplina(id: string, formData: FormData) {
  await uploadCapa("capas", `disciplinas/${id}/capa`, formData, (url, field) =>
    prisma.disciplina.update({ where: { id }, data: { [field]: url } }).then(() => {})
  );
}

export async function uploadCapaArea(id: string, formData: FormData) {
  await uploadCapa("capas", `areas/${id}/capa`, formData, (url, field) =>
    prisma.area.update({ where: { id }, data: { [field]: url } }).then(() => {})
  );
}
