import { prisma } from "@/lib/db/prisma";
import {
  formatarFecha, hrefDaNovedad,
  type EtiquetaNovedad, type NovedadItem, type NovedadesResumen, type TipoNovedad,
} from "@/lib/novedades";

const SELECT_NOVEDAD = {
  id: true, tipo: true, etiqueta: true, titulo: true, resumen: true, publicado_em: true,
  topico: { select: { slug: true, area: { select: { slug: true, disciplina: { select: { slug: true, curso: { select: { slug: true } } } } } } } },
} as const;

type FilaNovedad = Awaited<ReturnType<typeof buscarFilas>>[number];

function buscarFilas(limite: number, desvio: number) {
  return prisma.novedad.findMany({ orderBy: { publicado_em: "desc" }, skip: desvio, take: limite, select: SELECT_NOVEDAD });
}

function paraItem(n: FilaNovedad, usuarioId: string | null, desde: Date | null): NovedadItem {
  return {
    id: n.id,
    tipo: n.tipo as TipoNovedad,
    etiqueta: n.etiqueta as EtiquetaNovedad,
    titulo: n.titulo,
    resumen: n.resumen,
    href: hrefDaNovedad(n.tipo as TipoNovedad, n.topico),
    fecha: formatarFecha(n.publicado_em),
    // Quem nunca abriu o sino vê tudo como novo, mas só se estiver logado
    nueva: usuarioId !== null && (desde === null || n.publicado_em > desde),
  };
}

async function ultimaVista(usuarioId: string | null): Promise<Date | null> {
  if (!usuarioId) return null;
  const vista = await prisma.novedadVista.findUnique({ where: { usuario_id: usuarioId }, select: { visto_em: true } });
  return vista?.visto_em ?? null;
}

// Novedades mais recentes, marcando como novas as publicadas depois da última vez que o aluno marcou como vistas.
export async function getNovedadesDelAlumno(usuarioId: string | null, limite: number): Promise<NovedadesResumen> {
  const [rows, desde] = await Promise.all([buscarFilas(limite, 0), ultimaVista(usuarioId)]);
  // Contagem de todas as não vistas (não só das listadas), para o número vermelho do sino
  const nuevas = usuarioId ? await prisma.novedad.count({ where: desde ? { publicado_em: { gt: desde } } : {} }) : 0;
  return { items: rows.map((n) => paraItem(n, usuarioId, desde)), nuevas };
}

// Uma página do histórico (botão "Ver más" de /novedades): `desvio` itens já mostrados e o total para a contagem.
export async function getPaginaNovedades(usuarioId: string | null, desvio: number, limite: number): Promise<{ items: NovedadItem[]; total: number }> {
  const [rows, desde, total] = await Promise.all([buscarFilas(limite, desvio), ultimaVista(usuarioId), prisma.novedad.count()]);
  return { items: rows.map((n) => paraItem(n, usuarioId, desde)), total };
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
