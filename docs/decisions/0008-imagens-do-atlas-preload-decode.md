# 0008 — Imagens do atlas: preload + decode antes de trocar

- **Status:** Aceita
- **Data:** 2026-10-15

## Contexto
Ao navegar entre slides, a imagem nova aparecia como um bloco pequeno (skeleton) e ao recarregar a página havia flash branco. Causas:
1. `AtlasCarousel` remonta o `AtlasImageViewer` a cada slide (`key={idx}`), então qualquer preload interno ao viewer era descartado.
2. Checar `img.complete` em `useEffect` acontece depois do primeiro paint.
3. O skeleton usava altura fixa de 180 px, menor que o container congelado do carrossel.

## Decisão
- `AtlasCarousel` pré-carrega o slide seguinte e o anterior (`new Image()`) a cada mudança de índice.
- `AtlasImageViewer` detecta imagem em cache com `useLayoutEffect` (antes do paint) e, quando o `src` muda sem remontar, carrega e `decode()` a nova imagem antes de trocar a visível.
- O skeleton ocupa `height: 100%` do container.
- A lógica de carregar e decodificar fica em `preloadImage` (`src/lib/image-preload.ts`), e o preload de vizinhas em `useImagePreload` (`src/hooks/`), para não duplicar `new Image()` nos componentes.

## Consequências
- Na primeira visita, em conexão lenta, ainda pode aparecer o skeleton, mas agora com a altura certa e sem encolher.
- Qualquer novo componente que troque imagens por slide deve seguir o mesmo padrão: preload dos vizinhos e skeleton com a altura do container.
