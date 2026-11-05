# 0010 — Modelos 3D nos tópicos

- **Status:** Proposta
- **Data:** 2026-10-15

## Contexto
Alguns tópicos principais ganhariam com um modelo 3D interativo (anatomia, estruturas biológicas).

## Alternativas
- **Embed do Sketchfab:** zero infraestrutura, grande biblioteca; carrega marca e dependência externa.
- **`<model-viewer>` do Google com arquivos GLB próprios** (Supabase Storage ou R2): sem marca, controle total da UI; exige baixar, licenciar e hospedar os modelos.
- Fontes de modelos livres citadas: NIH 3D Print Exchange, BodyParts3D, modelos Sketchfab com licença CC. **Conferir a licença de cada modelo antes de usar.**

## Decisão
Pendente. Direção sugerida: validar com Sketchfab e migrar os conteúdos principais para `<model-viewer>`.

## Consequências
- Seria uma nova seção de tópico seguindo o padrão `Topic*Section.tsx`, com flag `modelo3d_ativo` no `Topico` e um modelo de dados para o vínculo.
