export type Gabarito = {
  questoes: { id: string; opcoes: { id: string; correta: boolean }[] }[];
};

export type RespostaEntrada = { questaoId: string; opcaoId: string; tentativas: number };

export type RespostaAvaliada = { questao_id: string; opcao_id: string; correta: boolean; tentativas: number };

export type TentativaAvaliada = {
  pontuacao: number;
  acertos: number;
  total: number;
  respostas: RespostaAvaliada[];
};

// Pontuação = acertos ÷ questões da sessão (as não respondidas contam como erro), igual à tela de resultado.
// Devolve null se a entrada for inconsistente com o gabarito: questão repetida ou de outro quiz,
// resposta fora da sessão, opção que não pertence à questão.
export function avaliarTentativa(
  gabarito: Gabarito,
  questaoIds: string[],
  respostas: RespostaEntrada[],
): TentativaAvaliada | null {
  const sessao = new Set(questaoIds);
  if (sessao.size === 0 || sessao.size !== questaoIds.length) return null;

  const questoes = new Map(gabarito.questoes.map((q) => [q.id, q]));
  for (const id of sessao) if (!questoes.has(id)) return null;

  const avaliadas = new Map<string, RespostaAvaliada>();
  for (const r of respostas) {
    const questao = questoes.get(r.questaoId);
    if (!questao || !sessao.has(r.questaoId) || avaliadas.has(r.questaoId)) return null;
    const opcao = questao.opcoes.find((o) => o.id === r.opcaoId);
    if (!opcao) return null;
    avaliadas.set(r.questaoId, { questao_id: r.questaoId, opcao_id: r.opcaoId, correta: opcao.correta, tentativas: r.tentativas });
  }

  const lista = [...avaliadas.values()];
  const acertos = lista.filter((r) => r.correta).length;
  return { pontuacao: Math.round((acertos / sessao.size) * 100), acertos, total: sessao.size, respostas: lista };
}
