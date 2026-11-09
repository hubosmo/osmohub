# 0016 — Mi Plan: pastas pessoais do aluno

- **Status:** Aceita
- **Data:** 2026-11-06

## Contexto
O aluno precisa organizar o próprio estudo: criar pastas (com nome, descrição e capa), criar pastas dentro de pastas e guardar nelas os tópicos que quer revisitar. O schema existente (`PlanoEstudos` e `ItemPlano`) era plano e estava vazio, e o ícone de marcador do cabeçalho do tópico não fazia nada. O menu "MI PLAN" aponta para `/plan-de-estudios`, que ainda não tem página.

## Decisão
**Modelo.** `Pasta` (dona, pasta-pai opcional, nome, descrição, ordem) e `ItemPasta` (liga uma pasta a um tópico, com `concluido`). Substituem `PlanoEstudos` e `ItemPlano`. Salvar um tópico cria uma **referência**, não uma cópia: se o tópico for editado, o item acompanha; se for apagado, o item some junto (cascata).

**Regras decididas com o produto:**
- Até **3 níveis** de pastas: a pasta da raiz é o nível 1, e há no máximo dois níveis de subpastas dentro dela. Verificado no servidor.
- **O aluno escolhe a profundidade ao criar a pasta da raiz** (atualizado em 2026-11-09): 1 nível (a pasta guarda os temas direto, sem subpastas), 2 ou 3. Fica gravado em `pastas.niveis_max` e as subpastas herdam o valor da raiz; o banco impede `nivel > niveis_max` (migration `20261109120000_pastas_niveis_max`). Pastas criadas antes ficam com 3. Mudar a profundidade depois da criação não existe ainda. O atalho de criar pasta pelo marcador do tópico usa 3.
- Um tópico pode estar em **várias pastas** (a chave de `ItemPasta` é pasta + tópico).
- Capa: **uma capa padrão para todos**, desenhada no código. Capa enviada pelo aluno fica para uma fase futura, em bucket separado, não listável, com limite de tamanho e de quantidade por aluno. Não se adiciona coluna de capa agora.
- Cada item pode ser **marcado como concluído** manualmente pelo aluno. Isso é independente do status automático do tópico ([ADR 0015](0015-progresso-do-topico.md)); a pasta mostra os dois. Sem datas previstas (o campo `data_prevista` do modelo antigo sai).
- Pastas são **pessoais**: não há compartilhamento. `usuario_id` em toda pasta deixa a porta aberta para isso depois.

**Fluxo.** O marcador do cabeçalho do tópico abre um seletor com as pastas do aluno (em árvore, com caixas de marcar) e permite criar uma pasta ali mesmo; fica preenchido quando o tópico está salvo em alguma. `/plan-de-estudos` lista as pastas da raiz como cards altos (como os cursos) e `/plan-de-estudos/[pasta]` mostra as subpastas (cards como as disciplinas) e os tópicos salvos com o status de cada um. Excluir uma pasta exige confirmação e apaga as subpastas e os itens, nunca os tópicos.

**Limites e validação.** Nome de 1 a 60 caracteres, descrição de até 300, no máximo 100 pastas por aluno e 200 itens por pasta. Toda entrada passa por Zod.

## Consequências
- **Segurança por dono:** as tabelas ficam fechadas para a API pública do Supabase (só o servidor acessa), então a proteção está no nosso código: toda consulta e toda action filtra pelo `usuario_id` da sessão, e um id de pasta de outro usuário se comporta como inexistente. Essas actions são do aluno e entram na lista de actions públicas do `check:auth`.
- Mostrar o status dos tópicos salvos exige consultar o progresso de vários tópicos de uma vez. Essa consulta também serve à lista de tópicos da área e ao dashboard.
- Há uma migration que troca duas tabelas por duas; aplicada pelo fluxo do [ADR 0012](0012-historico-de-migrations-reiniciado.md) (gerada em banco local, aplicada no Supabase com `db:deploy`).
- Fora do escopo agora: upload de capa, reordenar pastas e itens por arrastar, mover pasta entre pais, compartilhar.
