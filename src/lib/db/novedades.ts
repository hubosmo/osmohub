import { prisma } from "@/lib/db/prisma";
import {
  formatarFecha, hrefDaNovedad,
  type EtiquetaNovedad, type NovedadItem, type NovedadesResumen, type TipoNovedad,
} from "@/lib/novedades";

const SELECT_NOVEDAD = {
  id: true, tipo: true, etiqueta: true, titulo: true, resumen: true, publicado_em: true,
  topico: { select: { slug: true, area: { select: { slug: true, disciplina: { select: { slug: true, curso: { select: { slug: true } } } } } } } },
} as const;

// Novedades mais recentes, marcando como novas as publicadas depois da última vez que o aluno abriu o sino.
export async function getNovedadesDelAlumno(usuarioId: string | null, limite: number): Promise<NovedadesResumen> {
  const [rows, vista] = await Promise.all([
    prisma.novedad.findMany({ orderBy: { publicado_em: "desc" }, take: limite, select: SELECT_NOVEDAD }),
    usuarioId ? prisma.novedadVista.findUnique({ where: { usuario_id: usuarioId }, select: { visto_em: true } }) : null,
  ]);
  const desde = vista?.visto_em ?? null;
  // Contagem de todas as não vistas (não só das 8 listadas), para o número vermelho do sino
  const nuevas = usuarioId ? await prisma.novedad.count({ where: desde ? { publicado_em: { gt: desde } } : {} }) : 0;
  const items: NovedadItem[] = rows.map((n) => ({
    id: n.id,
    tipo: n.tipo as TipoNovedad,
    etiqueta: n.etiqueta as EtiquetaNovedad,
    titulo: n.titulo,
    resumen: n.resumen,
    href: hrefDaNovedad(n.tipo as TipoNovedad, n.topico),
    fecha: formatarFecha(n.publicado_em),
    // Quem nunca abriu o sino vê tudo como novo, mas só se estiver logado
    nueva: usuarioId !== null && (desde === null || n.publicado_em > desde),
  }));
  return { items, nuevas };
}

export async function marcarNovedadesVistas(usuarioId: string) {
  return prisma.novedadVista.upsert({
    where: { usuario_id: usuarioId },
    create: { usuario_id: usuarioId },
    update: { visto_em: new Date() },
    select: { usuario_id: true },
  });
}

// ── Admin ──────────────────────────────────────────────

export function listarNovedadesAdmin() {
  return prisma.novedad.findMany({
    orderBy: { publicado_em: "desc" },
    take: 200,
    select: { ...SELECT_NOVEDAD, topico: { select: { titulo: true } } },
  });
}

// Temas publicados para o seletor do formulário, com o caminho completo para distinguir títulos repetidos
export async function listarTopicosParaNovedad() {
  const topicos = await prisma.topico.findMany({
    where: { publicado: true },
    orderBy: [{ area: { disciplina: { curso: { ordem: "asc" } } } }, { titulo: "asc" }],
    select: { id: true, titulo: true, area: { select: { nome: true, disciplina: { select: { nome: true } } } } },
  });
  return topicos.map((t) => ({ id: t.id, rotulo: `${t.area.disciplina.nome} › ${t.area.nome} › ${t.titulo}` }));
}

export function criarNovedadDb(data: { tipo: TipoNovedad; etiqueta: EtiquetaNovedad; titulo: string; resumen: string | null; topico_id: string | null }) {
  return prisma.novedad.create({ data, select: { id: true } });
}

export function eliminarNovedadDb(id: string) {
  return prisma.novedad.deleteMany({ where: { id } });
}
