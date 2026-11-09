import { z } from "zod";

// ADR 0016
export const NIVEL_MAXIMO = 3;
export const MAX_PASTAS_POR_ALUNO = 100;
export const MAX_ITENS_POR_PASTA = 200;
export const NOME_MAX = 60;
export const DESCRICAO_MAX = 300;

// A pasta da raiz tem nível 1. Cada árvore admite de 1 a NIVEL_MAXIMO níveis, escolhidos pelo aluno ao criar a raiz
// (1 = a pasta guarda os temas direto, sem subpastas). A subpasta herda esse limite da raiz.
export const NIVEIS_ESCOLHIVEIS = [1, 2, 3] as const;

export function niveisValidos(niveis: number): boolean {
  return Number.isInteger(niveis) && niveis >= 1 && niveis <= NIVEL_MAXIMO;
}

// nivelDoPai = null cria uma pasta na raiz (sempre possível). Com pai, só cabe se o pai ainda não está no último nível da árvore.
export function nivelDaNovaPasta(nivelDoPai: number | null, niveisMaxDaArvore: number = NIVEL_MAXIMO): number | null {
  if (nivelDoPai === null) return 1;
  return nivelDoPai < Math.min(niveisMaxDaArvore, NIVEL_MAXIMO) ? nivelDoPai + 1 : null;
}

// Uma pasta aceita subpastas enquanto não está no último nível da sua árvore
export function aceitaSubpastas(nivel: number, niveisMax: number): boolean {
  return nivelDaNovaPasta(nivel, niveisMax) !== null;
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
export type NoPastaComNivel = NoPasta & { nivel: number };

// Ids da pasta e de todas as suas descendentes
export function idsDaArvore(pastas: NoPasta[], raizId: string): string[] {
  const ids = [raizId];
  for (let i = 0; i < ids.length; i++) {
    for (const p of pastas) if (p.pai_id === ids[i] && !ids.includes(p.id)) ids.push(p.id);
  }
  return ids;
}

// Nível mais fundo já usado na árvore da pasta: a profundidade da raiz não pode ficar abaixo disso
export function nivelMaisFundoDaArvore(pastas: NoPastaComNivel[], raizId: string): number {
  const ids = new Set(idsDaArvore(pastas, raizId));
  return pastas.filter((p) => ids.has(p.id)).reduce((m, p) => Math.max(m, p.nivel), 1);
}

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
