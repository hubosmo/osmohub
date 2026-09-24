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

// ─── IMAGENS ───────────────────────────────────────────

export async function adicionarImagemContent(topicoId: string, formData: FormData) {
  let url = s(formData.get("url"));

  // Se vier um arquivo, fazer upload para o Storage
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

// ─── TABELAS ───────────────────────────────────────────

export async function criarTabelaContent(topicoId: string, formData: FormData) {
  const titulo = s(formData.get("titulo"));
  if (!titulo) return;
  const tipo = s(formData.get("tipo")) || "resumen";
  const last = await prisma.tabelaTopico.findFirst({
    where: { topico_id: topicoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.tabelaTopico.create({
    data: { topico_id: topicoId, titulo, tipo, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidate();
}

export async function deletarTabelaContent(id: string, topicoId: string) {
  await prisma.tabelaTopico.delete({ where: { id } });
  revalidate();
}

export async function adicionarLinhaContent(
  tabelaId: string,
  topicoId: string,
  formData: FormData
) {
  const categoria = s(formData.get("categoria"));
  const conteudo = s(formData.get("conteudo"));
  if (!categoria || !conteudo) return;

  // Collect extra column values (extra_0, extra_1, ...)
  const valores_extra: string[] = [];
  let i = 0;
  while (formData.has(`extra_${i}`)) {
    valores_extra.push(s(formData.get(`extra_${i}`)));
    i++;
  }

  const last = await prisma.tabelaLinha.findFirst({
    where: { tabela_id: tabelaId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  await prisma.tabelaLinha.create({
    data: { tabela_id: tabelaId, categoria, conteudo, valores_extra, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidate();
}

export async function deletarLinhaContent(id: string, topicoId: string) {
  await prisma.tabelaLinha.delete({ where: { id } });
  revalidate();
}

export async function atualizarLinhaContent(id: string, topicoId: string, formData: FormData) {
  const categoria = s(formData.get("categoria"));
  const conteudo = s(formData.get("conteudo"));
  if (!categoria || !conteudo) return;
  const extras = Array.from(formData.entries())
    .filter(([k]) => k.startsWith("extra_"))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => String(v));
  await prisma.tabelaLinha.update({
    where: { id },
    data: { categoria, conteudo, valores_extra: extras },
  });
  revalidate();
}

export async function atualizarTituloTabela(tabelaId: string, topicoId: string, formData: FormData) {
  const titulo = s(formData.get("titulo"));
  if (!titulo) return;
  await prisma.tabelaTopico.update({ where: { id: tabelaId }, data: { titulo } });
  revalidate();
}

export async function adicionarColunaTabela(tabelaId: string, topicoId: string, formData: FormData) {
  const header = s(formData.get("header"));
  if (!header) return;
  const tabela = await prisma.tabelaTopico.findUnique({ where: { id: tabelaId }, select: { cabecalhos: true } });
  const atual = (tabela?.cabecalhos as string[]) ?? [];
  await prisma.tabelaTopico.update({ where: { id: tabelaId }, data: { cabecalhos: [...atual, header] } });
  revalidate();
}

export async function removerColunaTabela(tabelaId: string, topicoId: string, index: number) {
  const tabela = await prisma.tabelaTopico.findUnique({ where: { id: tabelaId }, select: { cabecalhos: true } });
  const atual = (tabela?.cabecalhos as string[]) ?? [];
  await prisma.tabelaTopico.update({ where: { id: tabelaId }, data: { cabecalhos: atual.filter((_, i) => i !== index) } });
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

// ─── CAPAS (CURSO / DISCIPLINA) ────────────────────────

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
