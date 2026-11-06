import { prisma } from "@/lib/db/prisma";

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
