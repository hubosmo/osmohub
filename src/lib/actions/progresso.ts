"use server";

import { z } from "zod";
import { getUsuarioSincronizado } from "@/lib/auth/session";
import { existeTopicoPublicado, registrarArtigoLido } from "@/lib/db/progresso";

const topicoIdSchema = z.string().uuid();

// Marca o artigo do tópico como lido para o usuário da sessão. Devolve false (sem lançar) se não houver sessão,
// o id for inválido ou o tópico não existir ou não estiver publicado.
export async function marcarArtigoLido(topicoId: string): Promise<boolean> {
  const parsed = topicoIdSchema.safeParse(topicoId);
  if (!parsed.success) return false;

  const user = await getUsuarioSincronizado();
  if (!user) return false;

  if (!(await existeTopicoPublicado(parsed.data))) return false;

  await registrarArtigoLido(user.id, parsed.data);
  return true;
}
