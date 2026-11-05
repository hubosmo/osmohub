# 0009 — Hospedagem de vídeo além do Vimeo gratuito

- **Status:** Proposta
- **Data:** 2026-10-15

## Contexto
Hoje o vídeo do tópico é um embed de YouTube/Vimeo (`toVideoEmbed` em `TopicVideoSection.tsx`). O Vimeo gratuito limita upload (cerca de 5 GB no total) e mostra marca. O `CLAUDE.md` e o `lib/env.ts` já preveem Mux, mas a integração não existe. A meta é atender cerca de 250 a 300 alunos.

## Alternativas
- **Mux:** melhor API e analytics; modo de teste com marca d'água para desenvolvimento.
- **Cloudflare Stream:** bem mais barato na lista de preços; o projeto já planeja Cloudflare R2.
- Opções de plano gratuito (Dailymotion, Streamable, Vidyard e Wistia gratuitos): limites de vídeos e duração inviabilizam produção.

## Decisão
Pendente. Direção atual: desenvolver em modo de teste do Mux (custo zero) e comparar com Cloudflare Stream antes do lançamento.

## Consequências
- Estimativas de custo para 250 a 300 alunos (cenário médio): Cloudflare Stream na casa de dezenas de dólares por mês, Mux na casa de uma centena. **São estimativas feitas a partir de preços de lista de memória; confirmar nas tabelas oficiais antes de decidir.**
- A decisão afeta `Video` no schema (`mux_playback_id`), `TopicVideoSection` e o upload no admin.
