# 0004 — Sessão de quiz em route group próprio

- **Status:** Aceita
- **Data:** 2026-10-13

## Contexto
A sessão de quiz (`/quizzes/[id]/session`) é tela cheia, sem header nem sidebar do aluno. Por isso ela vive em `src/app/(quiz)/`, fora de `(student)/`.

## Decisão
O route group `(quiz)` tem layout próprio. Como o `UserProvider` só existe em `(student)/layout.tsx`, o layout do `(quiz)` busca o usuário no Supabase e provê o seu próprio `UserProvider`.

## Consequências
- Qualquer componente que use `useUser()` dentro de `(quiz)` depende desse layout. Sem ele a tela mostrava "Estudiante" em vez do nome real (bug corrigido em 2026-10-15).
- Ao criar um novo route group com `useUser()`, repetir esse padrão ou extrair um layout compartilhado.
