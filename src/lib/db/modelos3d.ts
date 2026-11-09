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
    },
  });
}
