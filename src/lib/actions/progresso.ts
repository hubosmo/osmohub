"use server";

import { z } from "zod";
import { getUsuarioSincronizado } from "@/lib/auth/session";
import { existeTopicoPublicado, registrarArtigoLido, registrarVideoAssistido } from "@/lib/db/progresso";

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

// Marca o vídeo do tópico como assistido para o usuário da sessão (o cliente só chama depois de medir a reprodução).
export async function marcarVideoAssistido(topicoId: string): Promise<boolean> {
  const parsed = topicoIdSchema.safeParse(topicoId);
  if (!parsed.success) return false;

  const user = await getUsuarioSincronizado();
  if (!user) return false;

  if (!(await existeTopicoPublicado(parsed.data))) return false;

  await registrarVideoAssistido(user.id, parsed.data);
  return true;
}
