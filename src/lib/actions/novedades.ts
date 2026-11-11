"use server";

import { getUsuarioSincronizado } from "@/lib/auth/session";
import { marcarNovedadesVistas } from "@/lib/db/novedades";

// Guarda que o aluno da sessão abriu o sino agora (apaga o ponto azul). Devolve false sem lançar se não houver sessão.
export async function marcarNovedadesVistasAction(): Promise<boolean> {
  const user = await getUsuarioSincronizado();
  if (!user) return false;
  await marcarNovedadesVistas(user.id);
  return true;
}
