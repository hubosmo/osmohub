"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { getGabaritoQuiz } from "@/lib/db/quizzes";
import { registrarTentativa } from "@/lib/db/tentativas";
import { sincronizarUsuario } from "@/lib/db/users";
import { avaliarTentativa } from "@/lib/quiz-scoring";

const entradaSchema = z.object({
  quizId: z.string().uuid(),
  questaoIds: z.array(z.string().uuid()).min(1).max(500),
  respostas: z.array(z.object({
    questaoId: z.string().uuid(),
    opcaoId: z.string().uuid(),
    tentativas: z.number().int().min(1).max(5),
  })).max(500),
  tempoSeg: z.number().int().min(0).max(24 * 3600),
});

export type EntradaTentativa = z.infer<typeof entradaSchema>;

// Grava a tentativa do usuário da sessão. O cliente manda só as respostas: a pontuação é calculada aqui
// com o gabarito do banco. Devolve null (sem lançar) se não houver sessão ou a entrada for inválida.
export async function registrarTentativaQuiz(entrada: EntradaTentativa): Promise<{ pontuacao: number } | null> {
  const parsed = entradaSchema.safeParse(entrada);
  if (!parsed.success) return null;

  const user = await getSessionUser();
  if (!user?.email) return null;

  const { quizId, questaoIds, respostas, tempoSeg } = parsed.data;

  const gabarito = await getGabaritoQuiz(quizId);
  if (!gabarito) return null;

  const avaliada = avaliarTentativa(gabarito, questaoIds, respostas);
  if (!avaliada) return null;

  // Garante a linha em users (a tentativa referencia o usuário por chave estrangeira)
  await sincronizarUsuario({
    id: user.id,
    email: user.email,
    nome: (user.user_metadata?.full_name as string | undefined) ?? user.email.split("@")[0],
  });

  await registrarTentativa({ usuarioId: user.id, quizId, pontuacao: avaliada.pontuacao, tempoSeg, respostas: avaliada.respostas });
  return { pontuacao: avaliada.pontuacao };
}
