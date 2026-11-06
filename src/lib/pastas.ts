import { z } from "zod";

// ADR 0016
export const NIVEL_MAXIMO = 3;
export const MAX_PASTAS_POR_ALUNO = 100;
export const MAX_ITENS_POR_PASTA = 200;
export const NOME_MAX = 60;
export const DESCRICAO_MAX = 300;

// A pasta da raiz tem nível 1. Só se cria subpasta se o pai ainda não está no último nível.
export function nivelDaNovaPasta(nivelDoPai: number | null): number | null {
  if (nivelDoPai === null) return 1;
  return nivelDoPai < NIVEL_MAXIMO ? nivelDoPai + 1 : null;
}

export const dadosPastaSchema = z.object({
  nome: z.string().trim().min(1, "Escribe un nombre.").max(NOME_MAX, `El nombre admite hasta ${NOME_MAX} caracteres.`),
  descricao: z
    .string()
    .trim()
    .max(DESCRICAO_MAX, `La descripción admite hasta ${DESCRICAO_MAX} caracteres.`)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type DadosPasta = z.output<typeof dadosPastaSchema>;

export type NoPasta = { id: string; pai_id: string | null };

// Ordena em profundidade (cada pasta seguida das suas filhas) e informa a profundidade, para listar em árvore.
// Irmãs mantêm a ordem de entrada; pasta cujo pai não está na lista é tratada como raiz.
export function ordenarEmArvore<T extends NoPasta>(pastas: T[]): (T & { profundidade: number })[] {
  const ids = new Set(pastas.map((p) => p.id));
  const filhasDe = new Map<string | null, T[]>();
  for (const p of pastas) {
    const chave = p.pai_id && ids.has(p.pai_id) ? p.pai_id : null;
    filhasDe.set(chave, [...(filhasDe.get(chave) ?? []), p]);
  }
  const saida: (T & { profundidade: number })[] = [];
  const visitar = (pai: string | null, profundidade: number) => {
    for (const p of filhasDe.get(pai) ?? []) {
      saida.push({ ...p, profundidade });
      visitar(p.id, profundidade + 1);
    }
  };
  visitar(null, 0);
  return saida;
}
