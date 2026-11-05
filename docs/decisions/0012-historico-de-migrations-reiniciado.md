# 0012 — Histórico de migrations reiniciado com um baseline

- **Status:** Aceita
- **Data:** 2026-11-05

## Contexto
O banco do Supabase já era idêntico ao `schema.prisma` (`prisma migrate diff` vazio), mas o histórico em arquivo não reproduzia isso: a migration `init` cria 14 tabelas e a seguinte (`grupos_imagens`) altera `imagens_topico`, que nenhuma migration cria. Em um banco vazio a segunda migration falha (erro P3006). Tabelas como `imagens_topico`, `tabelas_topico`, `tabelas_linhas` e `topico_quizzes` foram criadas fora do Prisma Migrate, provavelmente com `db push`. Há um único banco, compartilhado por desenvolvimento e produção.

## Decisão
Reiniciar o histórico: as 3 migrations antigas saem do diretório (continuam no git) e entram uma única `20261105180000_baseline` com o schema completo (21 tabelas, 4 enums, nenhum comando destrutivo). Validado aplicando-a em um Postgres local vazio: o resultado é idêntico ao `schema.prisma`.

Fluxo daqui em diante:
- Criar migration: contra banco **local** (`npx prisma dev -n osmo -d`), com `DATABASE_URL` e `DIRECT_URL` apontando para ele, e `npm run db:migrate`.
- Aplicar no Supabase: `npm run db:deploy` (nunca apaga dados). Nunca `db push` nem `migrate dev` no Supabase.
- `scripts/db-guard.mjs` bloqueia `db:migrate` quando `DATABASE_URL` não é local, porque o `migrate dev` pode propor resetar o banco.

## Consequências
- **Banco real alinhado em 2026-11-05** (só metadados; nenhuma tabela foi alterada). Foram apagadas as 3 linhas antigas de `_prisma_migrations` e registrado o baseline com `npx prisma migrate resolve --applied 20261105180000_baseline`. Resultado: `migrate status` diz "up to date" e o diff contra o schema é vazio. Antes de apagar, as linhas foram salvas em backup e conferidas (exatamente as 3 esperadas, todas aplicadas).
- O baseline nunca deve ser executado em um banco que já tem as tabelas (daria erro de "already exists").
- O `init` antigo descrevia `quizzes` com `topico_id` (um quiz por tópico), sem `capa_url` nem `publicado`; essa forma só existe agora no histórico do git.
