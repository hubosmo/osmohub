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

// ─── LINHAS ────────────────────────────────────────────

export async function adicionarLinhaContent(
  tabelaId: string,
  topicoId: string,
  formData: FormData
) {
  const categoria = s(formData.get("categoria"));
  const conteudo = s(formData.get("conteudo"));
  if (!categoria || !conteudo) return;

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
