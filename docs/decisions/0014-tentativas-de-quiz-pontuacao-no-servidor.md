# 0014 — Tentativas de quiz: a pontuação é calculada no servidor

- **Status:** Aceita
- **Data:** 2026-11-06

## Contexto
A tabela `tentativas_quiz` existia, mas nenhum código a gravava: o resultado de uma sessão aparecia na tela e se perdia. Gravar o `pontuacao` que o navegador calcula (`correctCount`) deixaria o histórico depender de um número que o próprio cliente pode alterar.

## Decisão
Ao terminar a sessão (última questão, tempo esgotado ou "encerrar"), o `QuizPlayer` chama a server action `registrarTentativaQuiz` com **só as respostas**: o quiz, as questões que compuseram a sessão, a opção final escolhida em cada uma, quantas tentativas levou e o tempo. O servidor:
1. valida a forma da entrada com Zod e exige uma sessão válida;
2. carrega o gabarito do quiz publicado (`getGabaritoQuiz`) e calcula a pontuação em `avaliarTentativa` (`src/lib/quiz-scoring.ts`, função pura testada): acertos ÷ questões da sessão, questões sem resposta contam como erro, igual à tela de resultado;
3. rejeita entradas inconsistentes (questão repetida ou de outro quiz, opção que não pertence à questão, resposta fora da sessão);
4. garante a linha em `users` e grava em `tentativas_quiz` (`respostas` em JSON com `questao_id`, `opcao_id`, `correta`, `tentativas`).

A action é do aluno, não do admin: fica na lista de actions públicas de `scripts/check-admin-actions.mjs` e autentica pela sessão. Falhas não lançam erro e não atrapalham a tela de resultado.

## Consequências
- O card do quiz na página do tópico mostra última pontuação, melhor e número de tentativas (`getResumoTentativas`).
- Limite conhecido: o aluno escolhe quais questões fazem parte da sessão (por termo e por tempo), então pode mandar uma sessão de 1 questão e obter 100%. Como o histórico é para o próprio aluno e não vale nota, isso é aceito; se um dia houver nota oficial, a sessão (lista de questões) precisa ser sorteada e guardada no servidor.
- Não há limite de frequência de gravação. Um aluno poderia encher a própria tabela de tentativas; o volume esperado não justifica um limitador agora.
- `modo` (`PRATICA` ou `SIMULADO`) e `tempo_limite_seg` do quiz continuam sem uso.
