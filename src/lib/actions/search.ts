"use server";

import { prisma } from "@/lib/db/prisma";

export type TopicResult = {
  id: string;
  titulo: string;
  slug: string;
  areaSlug: string;
  areaNome: string;
  disciplinaSlug: string;
  disciplinaNome: string;
  cursoSlug: string;
  cursoNome: string;
};

// After lower(), only lowercase accented chars remain — same-length strings required by translate()
// á à ã â ä  é è ê ë  í ì î ï  ó ò õ ô ö  ú ù û ü  ñ  ç   = 24 chars
// a a a a a  e e e e  i i i i  o o o o o  u u u u  n  c   = 24 chars
const ACC_FROM = "áàãâäéèêëíìîïóòõôöúùûüñç";
const ACC_TO   = "aaaaaeeeeiiiiooooouuuunc";

type RawRow = {
  id: string;
  titulo: string;
  slug: string;
  area_slug: string;
  area_nome: string;
  disciplina_slug: string;
  disciplina_nome: string;
  curso_slug: string;
  curso_nome: string;
};

export async function buscarTopicos(query: string): Promise<TopicResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const pattern = `%${q}%`;

  const rows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      t.id,
      t.titulo,
      t.slug,
      a.slug  AS area_slug,
      a.nome  AS area_nome,
      d.slug  AS disciplina_slug,
      d.nome  AS disciplina_nome,
      c.slug  AS curso_slug,
      c.nome  AS curso_nome
    FROM   topicos      t
    JOIN   areas        a ON a.id           = t.area_id
    JOIN   disciplinas  d ON d.id           = a.disciplina_id
    JOIN   cursos       c ON c.id           = d.curso_id
    WHERE  t.publicado = true
      AND  translate(lower(t.titulo), ${ACC_FROM}, ${ACC_TO})
           LIKE translate(lower(${pattern}), ${ACC_FROM}, ${ACC_TO})
    ORDER  BY t.titulo ASC
    LIMIT  8
  `;

  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    slug: r.slug,
    areaSlug: r.area_slug,
    areaNome: r.area_nome,
    disciplinaSlug: r.disciplina_slug,
    disciplinaNome: r.disciplina_nome,
    cursoSlug: r.curso_slug,
    cursoNome: r.curso_nome,
  }));
}
