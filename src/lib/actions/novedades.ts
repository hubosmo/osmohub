"use server";

import { z } from "zod";
import { getSessionUser, getUsuarioSincronizado } from "@/lib/auth/session";
import { getPaginaNovedades, marcarNovedadesVistas } from "@/lib/db/novedades";
import { NOVEDADES_POR_PAGINA, type NovedadItem } from "@/lib/novedades";

// Guarda que o aluno da sessão abriu o sino agora (apaga o ponto azul). Devolve false sem lançar se não houver sessão.
export async function marcarNovedadesVistasAction(): Promise<boolean> {
  const user = await getUsuarioSincronizado();
  if (!user) return false;
  await marcarNovedadesVistas(user.id);
  return true;
}

// Próxima página do histórico para o botão "Ver más". Sem sessão ou com desvio inválido devolve lista vazia.
export async function cargarMasNovedades(desvio: number): Promise<{ items: NovedadItem[]; total: number }> {
  const parsed = z.number().int().min(0).max(100000).safeParse(desvio);
  const user = await getSessionUser();
  if (!parsed.success || !user) return { items: [], total: 0 };
  return getPaginaNovedades(user.id, parsed.data, NOVEDADES_POR_PAGINA);
}
