import { prisma } from "./prisma";

export function getNavData() {
  return prisma.curso.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      disciplinas: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          slug: true,
          nome: true,
          cor_destaque: true,
          areas: {
            where: { publicado: true },
            orderBy: { ordem: "asc" },
            select: { id: true, slug: true, nome: true },
          },
        },
      },
    },
  });
}

export function getDashboardCursos() {
  return prisma.curso.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      descricao: true,
      capa_url: true,
      capa_url_light: true,
      cor_destaque: true,
      icone: true,
      _count: { select: { disciplinas: { where: { publicado: true } } } },
    },
  });
}

export function getDashboardData() {
  return prisma.disciplina.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
    select: {
      id: true,
      slug: true,
      nome: true,
      icone: true,
      cor_destaque: true,
      curso: { select: { slug: true } },
      areas: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          slug: true,
          nome: true,
          descricao: true,
          _count: { select: { topicos: { where: { publicado: true } } } },
        },
      },
    },
  });
}

export function listarCursos() {
  return prisma.curso.findMany({
    where: { publicado: true },
    orderBy: { ordem: "asc" },
    include: {
      disciplinas: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          slug: true,
          nome: true,
          descricao: true,
          icone: true,
          cor_destaque: true,
          _count: { select: { areas: true } },
        },
      },
    },
  });
}

export function getCursoPorSlug(slug: string) {
  return prisma.curso.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      nome: true,
      descricao: true,
      capa_url: true,
      capa_url_light: true,
      icone: true,
      cor_destaque: true,
      disciplinas: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          slug: true,
          nome: true,
          descricao: true,
          icone: true,
          cor_destaque: true,
          capa_url: true,
          capa_url_light: true,
          _count: { select: { areas: { where: { publicado: true } } } },
        },
      },
    },
  });
}

export function getDisciplinaPorSlug(cursoSlug: string, disciplinaSlug: string) {
  return prisma.disciplina.findFirst({
    where: { slug: disciplinaSlug, curso: { slug: cursoSlug } },
    include: {
      curso: { select: { slug: true, nome: true } },
      areas: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          slug: true,
          nome: true,
          descricao: true,
          capa_url: true,
          capa_url_light: true,
          topicos: {
            where: { publicado: true },
            orderBy: { ordem: "asc" },
            select: {
              id: true,
              slug: true,
              titulo: true,
              descricao_curta: true,
              duracao_estimada_min: true,
              video: { select: { id: true } },
              artigo: { select: { id: true } },
            },
          },
        },
      },
    },
  });
}

export function getAreaPorSlug(
  cursoSlug: string,
  disciplinaSlug: string,
  areaSlug: string
) {
  return prisma.area.findFirst({
    where: {
      slug: areaSlug,
      disciplina: { slug: disciplinaSlug, curso: { slug: cursoSlug } },
    },
    include: {
      disciplina: {
        select: {
          slug: true,
          nome: true,
          cor_destaque: true,
          curso: { select: { slug: true, nome: true } },
        },
      },
      topicos: {
        where: { publicado: true },
        orderBy: { ordem: "asc" },
        include: {
          video: { select: { id: true } },
          artigo: { select: { id: true, content: true, tempo_leitura_min: true } },
        },
      },
    },
  });
}

export function getTopicoPorSlug(
  cursoSlug: string,
  disciplinaSlug: string,
  areaSlug: string,
  topicoSlug: string
) {
  return prisma.topico.findFirst({
    where: {
      slug: topicoSlug,
      area: {
        slug: areaSlug,
        disciplina: { slug: disciplinaSlug, curso: { slug: cursoSlug } },
      },
    },
    include: {
      area: {
        select: {
          slug: true,
          nome: true,
          disciplina: {
            select: {
              slug: true,
              nome: true,
              curso: { select: { slug: true, nome: true } },
            },
          },
          topicos: {
            where: { publicado: true },
            orderBy: { ordem: "asc" },
            select: { id: true, slug: true, titulo: true, ordem: true },
          },
        },
      },
      video: { select: { id: true, titulo: true, descricao: true, legenda: true, youtube_url: true, mux_playback_id: true, thumbnail_url: true, duracao_seg: true } },
      artigo: { select: { id: true, content: true, tempo_leitura_min: true } },
      imagens: {
        where: { grupo_id: null },
        orderBy: { ordem: "asc" },
        select: { id: true, url: true, legenda: true, ordem: true },
      },
      grupos_imagens: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          titulo: true,
          legenda: true,
          modo_legenda: true,
          ordem: true,
          imagens: {
            orderBy: { ordem: "asc" },
            select: { id: true, url: true, legenda: true },
          },
        },
      },
      tabelas: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          titulo: true,
          tipo: true,
          cabecalhos: true,
          linhas: {
            orderBy: { ordem: "asc" },
            select: { id: true, categoria: true, conteudo: true, valores_extra: true },
          },
        },
      },
      _count: { select: { quizzes: true, imagens: true, grupos_imagens: true } },
    },
  });
}
