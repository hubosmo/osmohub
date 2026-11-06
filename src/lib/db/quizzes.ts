import { prisma } from "@/lib/db/prisma";

// Lista todos os quizzes para o painel admin
export async function listarQuizzes() {
  return prisma.quiz.findMany({
    orderBy: { criado_em: "desc" },
    include: {
      _count: { select: { questoes: true, topicos: true } },
    },
  });
}

// Busca um quiz completo com questões para edição no admin
export async function getQuizAdmin(id: string) {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questoes: {
        orderBy: { ordem: "asc" },
        include: {
          opcoes: { orderBy: { ordem: "asc" } },
        },
        // termo incluído via model (select implícito)
      },
      topicos: {
        include: {
          topico: {
            select: {
              id: true,
              titulo: true,
              area: {
                select: {
                  nome: true,
                  disciplina: { select: { nome: true, curso: { select: { nome: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
}

// Busca quizzes vinculados a um tópico (para a página do aluno)
export async function getQuizzesDoTopico(topicoId: string) {
  const junctions = await prisma.topicoQuiz.findMany({
    where: { topico_id: topicoId },
    orderBy: { ordem: "asc" },
    include: {
      quiz: {
        include: {
          _count: { select: { questoes: true } },
        },
      },
    },
  });
  return junctions.map((j) => j.quiz);
}

// Quiz publicado com questões e opções para a sessão do aluno (inclui a resposta correta: só usar no servidor)
export async function getQuizParaSessao(id: string) {
  return prisma.quiz.findUnique({
    where: { id, publicado: true },
    select: {
      id: true,
      titulo: true,
      capa_url: true,
      questoes: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          enunciado: true,
          tipo: true,
          imagem_url: true,
          explicacao: true,
          termo: true,
          opcoes: {
            orderBy: { ordem: "asc" },
            select: { id: true, texto: true, imagem_url: true, correta: true },
          },
        },
      },
    },
  });
}

// Gabarito de um quiz publicado (ids das questões e opções com a marca de correta), para avaliar tentativas no servidor
export async function getGabaritoQuiz(id: string) {
  return prisma.quiz.findUnique({
    where: { id, publicado: true },
    select: {
      questoes: {
        select: { id: true, opcoes: { select: { id: true, correta: true } } },
      },
    },
  });
}

// Busca imagens já existentes no projeto para reusar em questões
export async function listarImagensDisponiveis(topicoId?: string) {
  const where = topicoId ? { topico_id: topicoId } : {};
  return prisma.imagemTopico.findMany({
    where,
    select: { id: true, url: true, legenda: true, topico_id: true },
    orderBy: { ordem: "asc" },
    take: 200,
  });
}
