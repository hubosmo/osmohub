# 0018 — Novedades: feed manual de novidades de conteúdo

- **Status:** Aceita
- **Data:** 2026-11-11

## Contexto
O aluno não tinha como saber que um vídeo, atlas, atlas 3D ou questionário foi adicionado ou melhorado. O sino de notificações do header existia, mas só mostrava "Sin notificaciones nuevas". Referência: a seção "Novedades" do Kenhub.

## Decisão
- **Um feed único**, ordenado por data, e cada item é **por fragmento** (tipo `VIDEO`, `ATLAS`, `ATLAS_3D`, `CUESTIONARIO`, `ARTICULO`, `TABLAS` ou `TEMA`) com a etiqueta **Nuevo** ou **Mejora**. Cada item pode apontar para um tema; o clique leva à seção do tipo (`#video`, `#atlas3d`…), reaproveitando os ids de `TopicSections`.
- **Publicação manual**: o admin escolhe o que vira novedad em `/admin/novedades` (tipo, etiqueta, título, resumo, tema). Automático gerava ruído (corrigir um typo viraria novidade).
- **O sino** (`NovedadesBell`, desktop e celular) mostra as 8 mais recentes, com "Ver todo →" para `/novedades` (até 100). Ponto azul quando há novedades publicadas depois da última vez que o aluno abriu o sino.
- **"Visto" em tabela própria** (`novedades_vistas`, uma linha por aluno, `visto_em`), e não uma coluna em `users`: assim a migration não altera uma tabela que todas as consultas de usuário leem, e o app continua funcionando mesmo se a migration ainda não foi aplicada (o layout captura o erro e o sino fica vazio).
- A novedad vale para **todos os alunos** (sem filtro por curso). Isso fica para uma fase posterior.

## Consequências
- Exige a migration `20261111180000_novedades` (2 enums e 2 tabelas, nada destrutivo). Gerada com `prisma migrate diff` entre o schema antigo e o novo, **sem aplicar** no Supabase compartilhado: aplicar com `npm run db:deploy` depois de aprovado.
- Apagar um tema mantém a novedad (o vínculo vira nulo, `onDelete: SetNull`); apagar um aluno apaga o seu "visto".
- Pendente (fase 2): selo "Nuevo/Actualizado" nas seções e nos cartões dos temas; opção "Publicar como novedad" dentro do painel de cada seção do admin.
