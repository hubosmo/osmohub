# 0005 — Retorno do quiz ao tópico de origem via `?back=`

- **Status:** Aceita
- **Data:** 2026-10-13 (validação adicionada em 2026-11-05)

## Contexto
Um quiz pode estar vinculado a vários tópicos (relação N:N em `TopicoQuiz`). Ao terminar, o aluno precisa voltar ao tópico de onde veio, não a um tópico qualquer.

## Decisão
`TopicQuizSection` recebe o caminho do tópico atual (`backUrl`) e o envia como query param: `/quizzes/[id]/session?back=/cursos/.../[topico]&time=..&attempts=..`. A página da sessão repassa ao `QuizPlayer`, e "Volver al tema" faz `router.push(backUrl)`. Sem `back`, o fallback é `/cursos`.

## Consequências
- O destino é decidido por quem abre o quiz, então funciona para qualquer número de tópicos vinculados.
- O valor de `back` vem da URL e portanto pode ser forjado. A página da sessão o passa por `safeInternalPath` (`src/lib/safe-redirect.ts`): só aceita caminho interno que comece com `/`, sem `//` nem `\`; qualquer outro valor cai no fallback `/cursos`. Sem essa validação, `?back=https://site-externo` levaria o aluno para fora (open redirect).
- Todo parâmetro de URL usado como destino de redirecionamento deve passar por `safeInternalPath`. Também é usado em `auth/callback/route.ts` para o parâmetro `next` do OAuth.
