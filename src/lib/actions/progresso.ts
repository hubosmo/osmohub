"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { existeTopicoPublicado, registrarArtigoLido } from "@/lib/db/progresso";
import { sincronizarUsuario } from "@/lib/db/users";

const topicoIdSchema = z.string().uuid();

// Marca o artigo do tópico como lido para o usuário da sessão. Devolve false (sem lançar) se não houver sessão,
// o id for inválido ou o tópico não existir ou não estiver publicado.
export async function marcarArtigoLido(topicoId: string): Promise<boolean> {
  const parsed = topicoIdSchema.safeParse(topicoId);
  if (!parsed.success) return false;

  const user = await getSessionUser();
  if (!user?.email) return false;

  if (!(await existeTopicoPublicado(parsed.data))) return false;

  // Garante a linha em users (o progresso referencia o usuário por chave estrangeira)
  await sincronizarUsuario({
    id: user.id,
    email: user.email,
    nome: (user.user_metadata?.full_name as string | undefined) ?? user.email.split("@")[0],
  });

  await registrarArtigoLido(user.id, parsed.data);
  return true;
}
