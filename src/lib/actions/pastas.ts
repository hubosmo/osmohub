"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUsuarioSincronizado } from "@/lib/auth/session";
import { atualizarPasta, criarPasta, definirItemConcluido, definirTopicoNaPasta, excluirPasta } from "@/lib/db/pastas";
import { MAX_ITENS_POR_PASTA, MAX_PASTAS_POR_ALUNO, NIVEL_MAXIMO, dadosPastaSchema } from "@/lib/pastas";

// Actions do aluno (Mi Plan). Cada uma usa o usuário da SESSÃO e a camada de dados filtra pelo dono: um id de
// pasta de outro usuário se comporta como inexistente. Devolvem o erro em espanhol, nunca lançam.
export type ResultadoAcao = { ok: true; id?: string } | { ok: false; erro: string };

const idSchema = z.string().uuid();
const SEM_SESSAO = "Inicia sesión para continuar.";
const FALHA = "No se pudo completar la acción. Intenta de nuevo.";

const revalidar = () => revalidatePath("/plan-de-estudios", "layout");

export async function criarPastaAction(entrada: { paiId?: string | null; nome: string; descricao?: string }): Promise<ResultadoAcao> {
  const dados = dadosPastaSchema.safeParse({ nome: entrada.nome, descricao: entrada.descricao });
  if (!dados.success) return { ok: false, erro: dados.error.issues[0].message };

  const paiId = entrada.paiId ?? null;
  if (paiId !== null && !idSchema.safeParse(paiId).success) return { ok: false, erro: FALHA };

  const user = await getUsuarioSincronizado();
  if (!user) return { ok: false, erro: SEM_SESSAO };

  const r = await criarPasta(user.id, { ...dados.data, paiId });
  if (!r.ok) {
    const erros = {
      limite: `Alcanzaste el límite de ${MAX_PASTAS_POR_ALUNO} carpetas.`,
      nivel: `Las carpetas admiten hasta ${NIVEL_MAXIMO} niveles.`,
      pai: "La carpeta superior no existe.",
    };
    return { ok: false, erro: erros[r.erro] };
  }
  revalidar();
  return { ok: true, id: r.id };
}

export async function atualizarPastaAction(pastaId: string, entrada: { nome: string; descricao?: string }): Promise<ResultadoAcao> {
  const dados = dadosPastaSchema.safeParse(entrada);
  if (!dados.success) return { ok: false, erro: dados.error.issues[0].message };
  if (!idSchema.safeParse(pastaId).success) return { ok: false, erro: FALHA };

  const user = await getUsuarioSincronizado();
  if (!user) return { ok: false, erro: SEM_SESSAO };

  if (!(await atualizarPasta(user.id, pastaId, dados.data))) return { ok: false, erro: "La carpeta no existe." };
  revalidar();
  return { ok: true };
}

export async function excluirPastaAction(pastaId: string): Promise<ResultadoAcao> {
  if (!idSchema.safeParse(pastaId).success) return { ok: false, erro: FALHA };

  const user = await getUsuarioSincronizado();
  if (!user) return { ok: false, erro: SEM_SESSAO };

  if (!(await excluirPasta(user.id, pastaId))) return { ok: false, erro: "La carpeta no existe." };
  revalidar();
  return { ok: true };
}

export async function salvarTopicoNaPastaAction(pastaId: string, topicoId: string, salvar: boolean): Promise<ResultadoAcao> {
  if (!idSchema.safeParse(pastaId).success || !idSchema.safeParse(topicoId).success) return { ok: false, erro: FALHA };

  const user = await getUsuarioSincronizado();
  if (!user) return { ok: false, erro: SEM_SESSAO };

  const r = await definirTopicoNaPasta(user.id, pastaId, topicoId, salvar);
  if (r === "ok") {
    revalidar();
    return { ok: true };
  }
  const erros = {
    pasta: "La carpeta no existe.",
    topico: "Este tema no está disponible.",
    limite: `Cada carpeta admite hasta ${MAX_ITENS_POR_PASTA} temas.`,
  };
  return { ok: false, erro: erros[r] };
}

export async function marcarItemConcluidoAction(pastaId: string, topicoId: string, concluido: boolean): Promise<ResultadoAcao> {
  if (!idSchema.safeParse(pastaId).success || !idSchema.safeParse(topicoId).success) return { ok: false, erro: FALHA };

  const user = await getUsuarioSincronizado();
  if (!user) return { ok: false, erro: SEM_SESSAO };

  if (!(await definirItemConcluido(user.id, pastaId, topicoId, concluido))) return { ok: false, erro: "El tema no está en la carpeta." };
  revalidar();
  return { ok: true };
}
