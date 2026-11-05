# 0002 — Responsividade lógica via `useIsMobile`

- **Status:** Em revisão
- **Data:** 2026-09-24

## Contexto
Na época, prefixos responsivos do Tailwind (`md:`, `lg:`) causaram layout quebrado no mobile em `AreaTopicos` (commit "usar JS para detectar viewport em AreaTopicos em vez de Tailwind responsivo"). A regra virou: toda lógica responsiva usa o hook `useIsMobile` (`src/hooks/useIsMobile.ts`, padrão < 768px).

## Decisão
Lógica que muda estrutura ou comportamento por viewport usa `useIsMobile()`. `@media` em `<style>` JSX é aceito para CSS puro.

## Consequências
- Não recriar `useEffect` de viewport dentro de componentes.
- **Pendência:** hoje 23 arquivos usam prefixos (`sm:`, `lg:`), incluindo o login. O Tailwind v4 suporta esses prefixos, então a proibição pode ter sido causada por um bug pontual e não por limitação real. Falta confirmar a causa e então decidir: (a) liberar prefixos para ajustes de CSS puro e manter o hook só para lógica, ou (b) migrar tudo para o hook. Até lá, não criar novo uso de prefixos em componentes de aluno.
