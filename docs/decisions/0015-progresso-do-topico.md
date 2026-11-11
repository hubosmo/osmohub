# 0015 — Progresso do tópico: artigo lido e quiz aprovado

- **Status:** Aceita
- **Data:** 2026-11-06

## Contexto
`ProgressoTopico` (`video_assistido`, `artigo_lido`) existia no schema, mas nada o usava, e o selo "Incompleta" da página do tópico era um texto fixo igual para todos. Marcar um tópico como concluído exige decidir o que conta, e nem tudo é mensurável: o vídeo é um embed de YouTube/Vimeo (não há como saber se o aluno o assistiu) e atlas e tabelas são só consulta.

## Decisão
Um tópico tem até **duas partes mensuráveis**:
- **Artigo lido (deixou de definir o status em 2026-11-11, ver atualização abaixo):** o fim do artigo fica visível por 2 segundos (`ArtigoLidoTracker`, `IntersectionObserver`). A espera evita que um artigo curto conte como lido só por abrir a página. A action `marcarArtigoLido` grava `artigo_lido = true` para o usuário da sessão.
- **Quiz aprovado:** pelo menos uma tentativa com 70% ou mais em um quiz publicado do tópico, lida do histórico do [ADR 0014](0014-tentativas-de-quiz-pontuacao-no-servidor.md). O limiar é a constante `PONTUACAO_APROVACAO` (`lib/progresso.ts`), a mesma que a tela de resultado usa para o confete e o anel verde.

`calcularStatusTopico` (função pura, testada) combina as partes que o tópico realmente tem: **Incompleta** (nenhuma feita), **En progreso** (algumas) ou **Completa** (todas). Tópico sem artigo nem quiz publicado não mostra status. Vídeo, atlas e tabelas **não** entram.

## Atualização (2026-11-11): o vídeo passa a contar
Com o vídeo em YouTube, Vimeo ou Bunny (os três avisam o progresso por `postMessage`), ele virou a **terceira parte**:
- **Vídeo assistido:** `VideoAssistidoTracker` soma o tempo realmente reproduzido (`FRACAO_VIDEO_ASSISTIDO` = 80 % da duração). Saltos para a frente e voltas atrás não somam, então adiantar o vídeo até o fim não conta. A action `marcarVideoAssistido` grava `video_assistido = true`; o campo já existia no schema, sem migration.
- Vídeo de outro provedor (URL qualquer) continua exibido, mas **não entra** no status (`provedorDoVideo` devolve null).
- `partesDoTopico` devolve as partes com o texto em espanhol; o selo do tópico (`StatusBadgeConDica`) mostra ao passar o mouse, focar ou tocar a lista com visto do que falta, para o aluno saber o que falta.
- O quiz segue como antes: 70 % ou mais em um quiz publicado.
- Quem já estava "Completa" volta a "En progreso" até assistir o vídeo (se o tópico tem vídeo mensurável).
- Limitação: o tempo vem do cliente, então quem quiser burlar consegue. Aceito, pelo mesmo motivo do artigo.

## Consequências
- O selo da página do tópico passa a refletir o progresso, e o artigo e o quiz ganham um visto no índice lateral e no índice mobile.
- A marcação de leitura é uma heurística: quem rola direto ao fim e espera 2 segundos conta como tendo lido. Aceito, porque o progresso é do próprio aluno e não vale nota.
- O vídeo entra quando houver como medi-lo (decisão de hospedagem em aberto, [ADR 0009](0009-hospedagem-de-video.md)). Nessa hora `calcularStatusTopico` ganha uma terceira parte.
- Ainda não há status na lista de tópicos da área, no dashboard nem uma página "Meu progreso": exigem consultar o progresso de vários tópicos de uma vez.
- Mudar o limiar de 70% muda ao mesmo tempo o confete, o anel do resultado e o critério de "quiz aprovado". As frases motivacionais do resultado têm escala própria (90, 70, 50) e não acompanham essa constante.

## Atualização (2026-11-11, 2): o artigo sai do critério
O status do tópico passa a depender só de **vídeo assistido** e **quiz aprovado**. O artigo continua sendo marcado como lido (`ArtigoLidoTracker`) e ganha visto no índice, mas não entra em `calcularStatusTopico` nem na dica do selo. Tópico sem vídeo mensurável e sem quiz publicado **não mostra status** (como já acontecia sem artigo nem quiz).

## Atualização (2026-11-11, 3): artigo como alternativa
Se o tema **não tem vídeo mensurável nem quiz publicado**, o artigo lido passa a ser o critério (`partesDoTopico`). Com vídeo ou quiz, o artigo continua fora. Sem nenhum dos três, não há status.
