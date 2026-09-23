import { prisma } from "./prisma";

export function listarCursosAdmin() {
  return prisma.curso.findMany({
    orderBy: { ordem: "asc" },
    include: { _count: { select: { disciplinas: true } } },
  });
}

export function getCursoAdmin(id: string) {
  return prisma.curso.findUnique({
    where: { id },
    include: {
      disciplinas: {
        orderBy: { ordem: "asc" },
        include: { _count: { select: { areas: true } } },
      },
    },
  });
}

export function getDisciplinaAdmin(id: string) {
  return prisma.disciplina.findUnique({
    where: { id },
    include: {
      curso: { select: { id: true, nome: true } },
      areas: {
        orderBy: { ordem: "asc" },
        include: { _count: { select: { topicos: true } } },
      },
    },
  });
}

export function getAreaAdmin(id: string) {
  return prisma.area.findUnique({
    where: { id },
    include: {
      disciplina: {
        select: {
          id: true,
          nome: true,
          curso: { select: { id: true, nome: true } },
        },
      },
      topicos: { orderBy: { ordem: "asc" } },
    },
  });
}

export function getTopicoAdmin(id: string) {
  return prisma.topico.findUnique({
    where: { id },
    include: {
      area: {
        select: {
          id: true,
          nome: true,
          disciplina: {
            select: {
              id: true,
              nome: true,
              curso: { select: { id: true, nome: true } },
            },
          },
        },
      },
      video: true,
      artigo: { select: { id: true, content: true, tempo_leitura_min: true } },
      imagens: { where: { grupo_id: null }, orderBy: { ordem: "asc" } },
      grupos_imagens: {
        orderBy: { ordem: "asc" },
        include: { imagens: { orderBy: { ordem: "asc" } } },
      },
      tabelas: {
        orderBy: { ordem: "asc" },
        include: { linhas: { orderBy: { ordem: "asc" } } },
      },
    },
  });
}

export function getTabelaAdmin(id: string) {
  return prisma.tabelaTopico.findUnique({
    where: { id },
    include: { linhas: { orderBy: { ordem: "asc" } } },
  });
}

export function getFullTreeAdmin() {
  return prisma.curso.findMany({
    orderBy: { ordem: "asc" },
    select: {
      id: true, nome: true, icone: true, publicado: true,
      disciplinas: {
        orderBy: { ordem: "asc" },
        select: {
          id: true, nome: true, icone: true, publicado: true,
          areas: {
            orderBy: { ordem: "asc" },
            select: {
              id: true, nome: true, publicado: true,
              topicos: {
                orderBy: { ordem: "asc" },
                select: { id: true, titulo: true, publicado: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function getStatsAdmin() {
  const [cursos, disciplinas, areas, topicos, usuarios] = await Promise.all([
    prisma.curso.count(),
    prisma.disciplina.count(),
    prisma.area.count(),
    prisma.topico.count(),
    prisma.user.count(),
  ]);
  return { cursos, disciplinas, areas, topicos, usuarios };
}
