import { prisma } from "@/lib/db/prisma";

// Mantém a tabela users alinhada com o usuário do Supabase Auth. Não lança erro: login e cadastro
// não dependem disso, e o próximo login tenta de novo.
export async function sincronizarUsuario(user: { id: string; email: string; nome: string }): Promise<void> {
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email, nome: user.nome },
      update: { email: user.email },
    });
  } catch (error) {
    console.error("[sincronizarUsuario] falha ao sincronizar com o banco:", error);
  }
}
