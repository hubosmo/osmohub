# 0007 — Transição de página: só fade-in, sem `AnimatePresence`

- **Status:** Aceita
- **Data:** 2026-10-15

## Contexto
A transição com `AnimatePresence mode="sync"` + `exit` fazia a tela piscar. No App Router a página antiga é desmontada de imediato na navegação, então o `exit` nunca roda de verdade e as duas páginas chegavam a coexistir no DOM.

## Decisão
`PageTransition` usa apenas um `motion.div` com `key={pathname}` e fade-in de opacidade (200 ms, sem `scale`). Não se anima a saída da página anterior.

## Consequências
- Não reintroduzir `AnimatePresence` em volta de `children` de página.
- Os tokens `PAGE_VARIANTS` e `PAGE_TRANSITION` em `src/lib/motion.ts` ficaram sem uso: remover quando convier.
- `AnimatePresence` continua valendo para elementos locais (modais, dropdowns, acordeões), onde o componente permanece montado até o fim da saída.
