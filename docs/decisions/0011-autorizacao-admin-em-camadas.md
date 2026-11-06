# 0011 — Autorização do admin em camadas

- **Status:** Aceita
- **Data:** 2026-11-05

## Contexto
Até aqui só havia verificação de login: o middleware tinha um `TODO: verificar role ADMIN` e nenhuma das 54 server actions de conteúdo checava o papel. Qualquer usuário logado podia abrir `/admin` ou chamar uma action diretamente (uma server action é um endpoint HTTP; esconder o botão não protege). As actions de upload usam a chave service role do Supabase, que ignora as regras de acesso do banco.

## Decisão
Três camadas, todas baseadas em `src/lib/auth/admin.ts`:
1. **Middleware:** exige sessão válida em rotas de aluno e de admin; falha fechada (sessão que não pode ser validada conta como deslogado; sem Supabase configurado em produção, redireciona ao login). Não checa o papel, porque roda no edge, sem Prisma, e o papel pode estar só na tabela `users`.
2. **`(admin)/layout.tsx`:** `getAdminUser()`; quem não é admin vai para `/dashboard`.
3. **Cada server action de admin** começa com `await requireAdmin();` (lança "No autorizado"). Esta é a camada que realmente protege os dados.

Papel ADMIN = `app_metadata.role === "ADMIN"` (só o servidor grava) ou `users.role = ADMIN`. Fallback com o e-mail de `ADMIN_EMAIL` apenas se o banco falhar e o e-mail estiver confirmado. `user_metadata` nunca vale como papel, pois o usuário edita o próprio.

## Consequências
- Todo arquivo novo em `src/lib/actions/` é tratado como admin. `npm run check:auth` (AST) falha se uma action exportada não começar com `requireAdmin()`. Actions públicas ficam numa lista explícita em `scripts/check-admin-actions.mjs`: `auth.ts`, `search.ts`, `content-ultimo-topico.ts`.
- `/quizzes/*` passou a exigir login (antes abria sem sessão). Se um dia houver quiz público, isso precisa de um ADR novo.
- O callback OAuth passou a validar `next` com `safeInternalPath` (antes `?next=@site-externo` redirecionava para fora).
- **Não coberto:** as queries de `lib/db/admin.ts` confiam no layout (layouts não re-executam em toda navegação interna); `buscarTopicos` é pública e só devolve títulos de tópicos publicados.
- **Supabase, verificado em 2026-11-06 (somente leitura, exceto onde indicado):**
  - Dados: RLS ligado nas 21 tabelas de `public`, sem nenhuma política. As roles `anon` e `authenticated` não têm `SELECT`, `INSERT`, `UPDATE` nem `DELETE` nelas; a chave pública recebe `permission denied`. Todo acesso a dados passa pelo servidor (Prisma e chave de serviço).
  - Storage, falha encontrada e corrigida: as políticas "Upload de capas via service role" (`INSERT`) e "Upsert de capas via service role" (`UPDATE`) em `storage.objects` valiam para a role `public` e só exigiam `bucket_id = 'capas'`, deixando qualquer visitante enviar e sobrescrever imagens apesar do nome. Foram removidas. Auditoria do bucket: 30 arquivos, todos nas pastas do app, sem sinais de abuso. Depois da correção, o upload e a sobrescrita com a chave pública são recusados (403), o upload pelo servidor continua funcionando e a leitura pública não mudou.
  - O bucket `capas` limita arquivos a 10 MB e a JPEG, PNG e WebP.
- **Regra para o Storage:** não criar política de escrita (`INSERT`, `UPDATE`, `DELETE`) em `storage.objects` para `public`, `anon` ou `authenticated`. O app grava sempre com a chave de serviço, que ignora o RLS, então essas políticas nunca são necessárias. O nome de uma política não limita a quem ela vale: o que vale é a coluna `roles` e a expressão.
- Cada action faz uma chamada ao Supabase Auth e uma consulta ao banco; aceitável para o volume do admin.
- **Verificado manualmente em 2026-11-06:** o pedido da action de criar quiz, copiado de uma sessão de admin e reexecutado no console de uma sessão de aluno, retornou 500; o log mostrou a consulta de papel em `users` e `Error: No autorizado` em `requireAdmin`, sem nenhum `INSERT` em `quizzes`. Na mesma sessão, um login com refresh token inválido foi redirecionado para `/login` pelo middleware (falha fechada).
