import { prisma } from "@/lib/db/prisma";
import type { RespostaAvaliada } from "@/lib/quiz-scoring";

export type ResumoTentativas = { ultima: number; melhor: number; total: number };

export async function registrarTentativa(dados: {
  usuarioId: string;
  quizId: string;
  pontuacao: number;
  tempoSeg: number;
  respostas: RespostaAvaliada[];
}) {
  return prisma.tentativaQuiz.create({
    data: {
      usuario_id: dados.usuarioId,
      quiz_id: dados.quizId,
      pontuacao: dados.pontuacao,
      tempo_gasto_seg: dados.tempoSeg,
      respostas: dados.respostas,
    },
    select: { id: true },
  });
}

// Última e melhor pontuação e nº de tentativas do aluno em cada quiz
export async function getResumoTentativas(usuarioId: string, quizIds: string[]): Promise<Record<string, ResumoTentativas>> {
  if (quizIds.length === 0) return {};

  const tentativas = await prisma.tentativaQuiz.findMany({
    where: { usuario_id: usuarioId, quiz_id: { in: quizIds } },
    orderBy: { criado_em: "desc" },
    select: { quiz_id: true, pontuacao: true },
    take: 500,
  });

  const resumo: Record<string, ResumoTentativas> = {};
  for (const t of tentativas) {
    const atual = resumo[t.quiz_id];
    if (!atual) resumo[t.quiz_id] = { ultima: t.pontuacao, melhor: t.pontuacao, total: 1 };
    else {
      atual.melhor = Math.max(atual.melhor, t.pontuacao);
      atual.total += 1;
    }
  }
  return resumo;
}
