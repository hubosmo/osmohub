# 0015 — Progresso do tópico: artigo lido e quiz aprovado

- **Status:** Aceita
- **Data:** 2026-11-06

## Contexto
`ProgressoTopico` (`video_assistido`, `artigo_lido`) existia no schema, mas nada o usava, e o selo "Incompleta" da página do tópico era um texto fixo igual para todos. Marcar um tópico como concluído exige decidir o que conta, e nem tudo é mensurável: o vídeo é um embed de YouTube/Vimeo (não há como saber se o aluno o assistiu) e atlas e tabelas são só consulta.

## Decisão
Um tópico tem até **duas partes mensuráveis**:
- **Artigo lido:** o fim do artigo fica visível por 2 segundos (`ArtigoLidoTracker`, `IntersectionObserver`). A espera evita que um artigo curto conte como lido só por abrir a página. A action `marcarArtigoLido` grava `artigo_lido = true` para o usuário da sessão.
- **Quiz aprovado:** pelo menos uma tentativa com 70% ou mais em um quiz publicado do tópico, lida do histórico do [ADR 0014](0014-tentativas-de-quiz-pontuacao-no-servidor.md). O limiar é a constante `PONTUACAO_APROVACAO` (`lib/progresso.ts`), a mesma que a tela de resultado usa para o confete e o anel verde.

`calcularStatusTopico` (função pura, testada) combina as partes que o tópico realmente tem: **Incompleta** (nenhuma feita), **En progreso** (algumas) ou **Completa** (todas). Tópico sem artigo nem quiz publicado não mostra status. Vídeo, atlas e tabelas **não** entram.

## Consequências
- O selo da página do tópico passa a refletir o progresso, e o artigo e o quiz ganham um visto no índice lateral e no índice mobile.
- A marcação de leitura é uma heurística: quem rola direto ao fim e espera 2 segundos conta como tendo lido. Aceito, porque o progresso é do próprio aluno e não vale nota.
- O vídeo entra quando houver como medi-lo (decisão de hospedagem em aberto, [ADR 0009](0009-hospedagem-de-video.md)). Nessa hora `calcularStatusTopico` ganha uma terceira parte.
- Ainda não há status na lista de tópicos da área, no dashboard nem uma página "Meu progreso": exigem consultar o progresso de vários tópicos de uma vez.
- Mudar o limiar de 70% muda ao mesmo tempo o confete, o anel do resultado e o critério de "quiz aprovado". As frases motivacionais do resultado têm escala própria (90, 70, 50) e não acompanham essa constante.
