import { prisma } from "@/lib/db/prisma";
import { PONTUACAO_APROVACAO, calcularStatusTopico, type StatusTopico } from "@/lib/progresso";

export async function getProgressoTopico(usuarioId: string, topicoId: string): Promise<{ artigoLido: boolean }> {
  const row = await prisma.progressoTopico.findUnique({
    where: { usuario_id_topico_id: { usuario_id: usuarioId, topico_id: topicoId } },
    select: { artigo_lido: true },
  });
  return { artigoLido: row?.artigo_lido ?? false };
}

export async function registrarArtigoLido(usuarioId: string, topicoId: string) {
  return prisma.progressoTopico.upsert({
    where: { usuario_id_topico_id: { usuario_id: usuarioId, topico_id: topicoId } },
    create: { usuario_id: usuarioId, topico_id: topicoId, artigo_lido: true },
    update: { artigo_lido: true },
    select: { topico_id: true },
  });
}

export async function existeTopicoPublicado(topicoId: string): Promise<boolean> {
  const topico = await prisma.topico.findFirst({ where: { id: topicoId, publicado: true }, select: { id: true } });
  return topico !== null;
}

// Status (artigo lido e quiz aprovado) de vários tópicos de uma vez, com a mesma regra da página do tópico.
export async function getStatusDosTopicos(usuarioId: string, topicoIds: string[]): Promise<Record<string, StatusTopico | null>> {
  if (topicoIds.length === 0) return {};

  const [topicos, progresso] = await Promise.all([
    prisma.topico.findMany({
      where: { id: { in: topicoIds } },
      select: {
        id: true,
        artigo_ativo: true,
        artigo: { select: { id: true } },
        quizzes: { select: { quiz: { select: { id: true, publicado: true } } } },
      },
    }),
    prisma.progressoTopico.findMany({
      where: { usuario_id: usuarioId, topico_id: { in: topicoIds } },
      select: { topico_id: true, artigo_lido: true },
    }),
  ]);

  const quizIds = topicos.flatMap((t) => t.quizzes.map((q) => q.quiz.id));
  const melhorPorQuiz = new Map<string, number>();
  if (quizIds.length > 0) {
    const melhores = await prisma.tentativaQuiz.groupBy({
      by: ["quiz_id"],
      where: { usuario_id: usuarioId, quiz_id: { in: quizIds } },
      _max: { pontuacao: true },
    });
    for (const m of melhores) melhorPorQuiz.set(m.quiz_id, m._max.pontuacao ?? 0);
  }

  const lidos = new Set(progresso.filter((p) => p.artigo_lido).map((p) => p.topico_id));
  const resultado: Record<string, StatusTopico | null> = {};
  for (const t of topicos) {
    const publicados = t.quizzes.map((q) => q.quiz).filter((q) => q.publicado);
    resultado[t.id] = calcularStatusTopico({
      temArtigo: t.artigo_ativo && t.artigo !== null,
      artigoLido: lidos.has(t.id),
      temQuiz: publicados.length > 0,
      quizAprovado: publicados.some((q) => (melhorPorQuiz.get(q.id) ?? 0) >= PONTUACAO_APROVACAO),
    });
  }
  return resultado;
}
