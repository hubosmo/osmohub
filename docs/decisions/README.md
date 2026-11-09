# Registro de Decisões (ADRs)

Cada decisão técnica ou de produto relevante vira um arquivo curto aqui. O objetivo é que ninguém (nem a IA) refaça uma discussão já resolvida ou quebre um padrão sem saber por quê.

## Quando criar um ADR

- Escolha entre alternativas reais (biblioteca, serviço, padrão de código).
- Regra que o código deve seguir daqui para frente.
- Correção de bug cuja causa revela uma regra ("nunca faça X porque Y").

Não criar para: ajuste visual pontual, bugfix sem lição geral.

## Como criar

1. Copiar o template abaixo para `NNNN-titulo-curto.md` (próximo número livre).
2. Preencher em até ~20 linhas. Se passar disso, a decisão está grande demais: quebrar.
3. Adicionar a linha no índice desta página.
4. Nunca apagar um ADR. Se a decisão mudar, criar um novo e marcar o antigo como `Substituída por NNNN`.

## Status possíveis

`Proposta` (ainda não decidida) · `Aceita` (vale hoje) · `Em revisão` (há dúvida aberta) · `Substituída`

## Template

```md
# NNNN — Título

- **Status:** Aceita
- **Data:** AAAA-MM-DD

## Contexto
O problema e as alternativas consideradas.

## Decisão
O que ficou decidido, em uma frase direta.

## Consequências
O que passa a valer no código. Riscos e pendências.
```

## Índice

| # | Decisão | Status |
|---|---|---|
| [0001](0001-idioma-es-419.md) | Idioma da interface: espanhol latino | Aceita |
| [0002](0002-viewport-via-hook.md) | Responsividade lógica via `useIsMobile` | Em revisão |
| [0003](0003-server-actions-por-dominio.md) | Um arquivo de server actions por domínio | Aceita |
| [0004](0004-quiz-fora-do-layout-student.md) | Sessão de quiz em route group próprio | Aceita |
| [0005](0005-retorno-do-quiz-via-back.md) | Retorno do quiz ao tópico de origem via `?back=` | Aceita |
| [0006](0006-tentativas-em-questoes-binarias.md) | Questões com 2 opções têm sempre 1 tentativa | Aceita |
| [0007](0007-transicao-de-pagina-fade-simples.md) | Transição de página: só fade-in, sem `AnimatePresence` | Aceita |
| [0008](0008-imagens-do-atlas-preload-decode.md) | Imagens do atlas: preload + decode antes de trocar | Aceita |
| [0009](0009-hospedagem-de-video.md) | Hospedagem de vídeo além do Vimeo gratuito | Proposta |
| [0010](0010-modelos-3d.md) | Modelos 3D nos tópicos | Proposta |
| [0011](0011-autorizacao-admin-em-camadas.md) | Autorização do admin em camadas (middleware, layout, actions) | Aceita |
| [0012](0012-historico-de-migrations-reiniciado.md) | Histórico de migrations reiniciado com um baseline | Aceita |
| [0013](0013-estado-no-navegador-sem-setstate-em-efeito.md) | Estado do navegador sem `setState` dentro de `useEffect` | Aceita |
| [0014](0014-tentativas-de-quiz-pontuacao-no-servidor.md) | Tentativas de quiz: a pontuação é calculada no servidor | Aceita |
| [0015](0015-progresso-do-topico.md) | Progresso do tópico: artigo lido e quiz aprovado | Aceita |
| [0016](0016-mi-plan-pastas-do-aluno.md) | Mi Plan: pastas pessoais do aluno | Aceita |
| [0017](0017-atlas-3d-biblioteca-de-modelos.md) | Atlas 3D: biblioteca de modelos separada, vinculada aos tópicos | Aceita |
