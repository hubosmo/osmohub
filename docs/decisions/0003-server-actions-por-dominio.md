# 0003 — Um arquivo de server actions por domínio

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
Actions misturadas em um único arquivo crescem sem controle e ficam difíceis de achar.

## Decisão
Cada domínio tem seu arquivo em `src/lib/actions/` (`content-structure`, `content-atlas`, `content-tabelas`, `content-media`, `content-quizzes`, ...). Domínio novo cria arquivo novo; nunca se adiciona action de um domínio no arquivo de outro. Utilitários locais pequenos (`s()`, `revalidate()`) são duplicados por arquivo de propósito.

## Consequências
- Limite de ~300 linhas por arquivo, verificado por `npm run check:size`. Aplicado em 2026-11-05: ao adicionar a proteção de admin, `content-quizzes.ts` passou de 300 e as ações de imagem foram para `content-quiz-imagens.ts`.
- Toda action de admin começa com `await requireAdmin()` ([ADR 0011](0011-autorizacao-admin-em-camadas.md)).
- Queries de banco nunca ficam na action: vão para `src/lib/db/`.
