"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { MAX_PONTOS_POR_MODELO, dadosPontoSchema, type EntradaPonto } from "@/lib/pontos3d";

// Pontos numerados do Atlas 3D (editor no admin). A ordem define o número mostrado ao aluno.
export type ResultadoPonto = { ok: true; id: string } | { ok: false; erro: string };

function revalidate(modeloId: string) {
  revalidatePath(`/admin/modelos-3d/${modeloId}`);
}

export async function criarPonto3d(modeloId: string, entrada: EntradaPonto): Promise<ResultadoPonto> {
  await requireAdmin();
  const dados = dadosPontoSchema.safeParse(entrada);
  if (!dados.success) return { ok: false, erro: dados.error.issues[0].message };

  const modelo = await prisma.modelo3D.findUnique({ where: { id: modeloId }, select: { id: true } });
  if (!modelo) return { ok: false, erro: "Modelo no encontrado." };

  const [total, ultimo] = await Promise.all([
    prisma.pontoModelo3D.count({ where: { modelo_id: modeloId } }),
    prisma.pontoModelo3D.findFirst({ where: { modelo_id: modeloId }, orderBy: { ordem: "desc" }, select: { ordem: true } }),
  ]);
  if (total >= MAX_PONTOS_POR_MODELO) return { ok: false, erro: `Cada modelo admite hasta ${MAX_PONTOS_POR_MODELO} puntos.` };

  const ponto = await prisma.pontoModelo3D.create({
    data: { modelo_id: modeloId, ordem: (ultimo?.ordem ?? -1) + 1, ...dados.data },
    select: { id: true },
  });
  revalidate(modeloId);
  return { ok: true, id: ponto.id };
}

export async function atualizarPonto3d(pontoId: string, entrada: EntradaPonto): Promise<ResultadoPonto> {
  await requireAdmin();
  const dados = dadosPontoSchema.safeParse(entrada);
  if (!dados.success) return { ok: false, erro: dados.error.issues[0].message };

  const existente = await prisma.pontoModelo3D.findUnique({ where: { id: pontoId }, select: { modelo_id: true } });
  if (!existente) return { ok: false, erro: "El punto no existe." };

  await prisma.pontoModelo3D.update({ where: { id: pontoId }, data: dados.data });
  revalidate(existente.modelo_id);
  return { ok: true, id: pontoId };
}

export async function excluirPonto3d(pontoId: string): Promise<ResultadoPonto> {
  await requireAdmin();
  const existente = await prisma.pontoModelo3D.findUnique({ where: { id: pontoId }, select: { modelo_id: true } });
  if (!existente) return { ok: false, erro: "El punto no existe." };

  await prisma.pontoModelo3D.delete({ where: { id: pontoId } });
  revalidate(existente.modelo_id);
  return { ok: true, id: pontoId };
}
