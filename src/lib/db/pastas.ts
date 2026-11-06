import { prisma } from "@/lib/db/prisma";
import { MAX_ITENS_POR_PASTA, MAX_PASTAS_POR_ALUNO, nivelDaNovaPasta, type DadosPasta } from "@/lib/pastas";

// Toda função recebe o usuarioId da SESSÃO e o inclui no filtro: pasta de outro usuário se comporta como inexistente.

export type PastaResumo = {
  id: string;
  pai_id: string | null;
  nivel: number;
  nome: string;
  descricao: string | null;
  _count: { itens: number; filhas: number };
};

export async function listarPastasDoUsuario(usuarioId: string): Promise<PastaResumo[]> {
  return prisma.pasta.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { criado_em: "asc" },
    select: {
      id: true, pai_id: true, nivel: true, nome: true, descricao: true,
      _count: { select: { itens: true, filhas: true } },
    },
    take: MAX_PASTAS_POR_ALUNO,
  });
}

export type ResultadoCriarPasta = { ok: true; id: string } | { ok: false; erro: "limite" | "pai" | "nivel" };

export async function criarPasta(
  usuarioId: string,
  dados: DadosPasta & { paiId: string | null },
): Promise<ResultadoCriarPasta> {
  const total = await prisma.pasta.count({ where: { usuario_id: usuarioId } });
  if (total >= MAX_PASTAS_POR_ALUNO) return { ok: false, erro: "limite" };

  let nivelDoPai: number | null = null;
  if (dados.paiId) {
    const pai = await prisma.pasta.findFirst({ where: { id: dados.paiId, usuario_id: usuarioId }, select: { nivel: true } });
    if (!pai) return { ok: false, erro: "pai" };
    nivelDoPai = pai.nivel;
  }

  const nivel = nivelDaNovaPasta(nivelDoPai);
  if (nivel === null) return { ok: false, erro: "nivel" };

  const criada = await prisma.pasta.create({
    data: { usuario_id: usuarioId, pai_id: dados.paiId, nivel, nome: dados.nome, descricao: dados.descricao },
    select: { id: true },
  });
  return { ok: true, id: criada.id };
}

export async function atualizarPasta(usuarioId: string, pastaId: string, dados: DadosPasta): Promise<boolean> {
  const r = await prisma.pasta.updateMany({
    where: { id: pastaId, usuario_id: usuarioId },
    data: { nome: dados.nome, descricao: dados.descricao },
  });
  return r.count > 0;
}

// As subpastas e os itens saem junto (cascata no banco); os tópicos não são tocados
export async function excluirPasta(usuarioId: string, pastaId: string): Promise<boolean> {
  const r = await prisma.pasta.deleteMany({ where: { id: pastaId, usuario_id: usuarioId } });
  return r.count > 0;
}

export async function idsDasPastasComTopico(usuarioId: string, topicoId: string): Promise<string[]> {
  const itens = await prisma.itemPasta.findMany({
    where: { topico_id: topicoId, pasta: { usuario_id: usuarioId } },
    select: { pasta_id: true },
  });
  return itens.map((i) => i.pasta_id);
}

export type ResultadoSalvarTopico = "ok" | "pasta" | "topico" | "limite";

export async function definirTopicoNaPasta(
  usuarioId: string,
  pastaId: string,
  topicoId: string,
  salvar: boolean,
): Promise<ResultadoSalvarTopico> {
  const pasta = await prisma.pasta.findFirst({ where: { id: pastaId, usuario_id: usuarioId }, select: { id: true } });
  if (!pasta) return "pasta";

  if (!salvar) {
    await prisma.itemPasta.deleteMany({ where: { pasta_id: pastaId, topico_id: topicoId } });
    return "ok";
  }

  const jaSalvo = await prisma.itemPasta.findUnique({
    where: { pasta_id_topico_id: { pasta_id: pastaId, topico_id: topicoId } },
    select: { pasta_id: true },
  });
  if (jaSalvo) return "ok";

  const topico = await prisma.topico.findFirst({ where: { id: topicoId, publicado: true }, select: { id: true } });
  if (!topico) return "topico";

  const total = await prisma.itemPasta.count({ where: { pasta_id: pastaId } });
  if (total >= MAX_ITENS_POR_PASTA) return "limite";

  await prisma.itemPasta.createMany({ data: [{ pasta_id: pastaId, topico_id: topicoId }], skipDuplicates: true });
  return "ok";
}

export async function definirItemConcluido(usuarioId: string, pastaId: string, topicoId: string, concluido: boolean): Promise<boolean> {
  const r = await prisma.itemPasta.updateMany({
    where: { pasta_id: pastaId, topico_id: topicoId, pasta: { usuario_id: usuarioId } },
    data: { concluido },
  });
  return r.count > 0;
}

export async function listarItensDaPasta(usuarioId: string, pastaId: string) {
  return prisma.itemPasta.findMany({
    where: { pasta_id: pastaId, pasta: { usuario_id: usuarioId }, topico: { publicado: true } },
    orderBy: { criado_em: "asc" },
    select: {
      concluido: true,
      topico: {
        select: {
          id: true, slug: true, titulo: true, descricao_curta: true,
          area: { select: { slug: true, nome: true, disciplina: { select: { slug: true, curso: { select: { slug: true } } } } } },
        },
      },
    },
    take: MAX_ITENS_POR_PASTA,
  });
}
