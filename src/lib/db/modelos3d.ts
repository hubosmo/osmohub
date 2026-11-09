import { prisma } from "@/lib/db/prisma";

// Lista a biblioteca de modelos 3D para o painel admin
export async function listarModelos3d() {
  return prisma.modelo3D.findMany({
    orderBy: { criado_em: "desc" },
    select: {
      id: true, titulo: true, arquivo_path: true, tamanho_bytes: true, publicado: true, licenca: true,
      _count: { select: { pontos: true, topicos: true } },
    },
  });
}

export async function getModelo3dAdmin(id: string) {
  return prisma.modelo3D.findUnique({
    where: { id },
    include: {
      _count: { select: { pontos: true, topicos: true } },
      pontos: { orderBy: { ordem: "asc" } },
    },
  });
}

// Biblioteca para o seletor de vínculo no admin (só os que já têm arquivo)
export async function listarModelos3dParaVincular() {
  return prisma.modelo3D.findMany({
    where: { arquivo_path: { not: null } },
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true, publicado: true },
    take: 300,
  });
}

export async function getModelos3dVinculadosAoTopico(topicoId: string) {
  const vinculos = await prisma.topicoModelo3D.findMany({
    where: { topico_id: topicoId },
    orderBy: { ordem: "asc" },
    select: { modelo: { select: { id: true, titulo: true, publicado: true } } },
  });
  return vinculos.map((v) => v.modelo);
}

// Aluno: só modelos publicados e com arquivo, na ordem do vínculo
export async function getModelos3dDoTopico(topicoId: string) {
  const vinculos = await prisma.topicoModelo3D.findMany({
    where: { topico_id: topicoId, modelo: { publicado: true, arquivo_path: { not: null } } },
    orderBy: { ordem: "asc" },
    select: {
      modelo: {
        select: {
          id: true, titulo: true, descricao: true, arquivo_path: true, licenca: true, creditos: true,
          pontos: { orderBy: { ordem: "asc" }, select: { id: true, titulo: true, texto: true, posicao: true, normal: true, orbita: true, alvo: true } },
        },
      },
    },
  });
  return vinculos.map((v) => v.modelo);
}
