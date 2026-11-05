# 0013 — Estado vindo do navegador sem `setState` dentro de `useEffect`

- **Status:** Aceita
- **Data:** 2026-11-05

## Contexto
O React 19 (regra `react-hooks/set-state-in-effect`) acusou 10 erros. Em quase todos o código lia `localStorage` ou `sessionStorage` dentro de um `useEffect` e chamava `setState` em seguida, para lembrar um card aberto, o tema, o tour já visto, o padrão de tempo do quiz. Isso causa uma renderização extra e foi copiado em vários componentes.

## Decisão
- Valor persistido no navegador: `useLocalStorageValue(chave)` ou `useSessionStorageValue(chave)` (`src/hooks/useStoredValue.ts`, baseados em `useSyncExternalStore`). No servidor e na hidratação o valor é `null`, então o HTML não diverge; depois da hidratação passa a valer o valor salvo.
- UI que só existe no navegador: `useIsClient()`. Exemplo: o tour só aparece se `isClient && ainda não visto`, para não piscar para quem já viu.
- Escolha do usuário que deve vencer o valor salvo: guardar a escolha em estado próprio (`null` até escolher) e usar `escolha ?? valorSalvo ?? padrão` (ver `TopicQuizSection`).
- Estado que espelha props: derivar durante a renderização (`if (prop !== anterior) { setAnterior(prop); setLocal(prop); }`), não em efeito (ver `GrupoImagensCard`).
- Reset de estado causado por uma ação do usuário (ex.: apagar a busca): fazer no handler do evento, não no efeito.
- Valor lido só na renderização que muda com um evento de arraste: espelhar a ref em estado apenas para o estilo (`AtlasBlocksManager`).

## Consequências
- Se o storage estiver bloqueado, o valor continua funcionando na sessão (cópia em memória), mas não persiste.
- Mudança de comportamento aceita: com `sessionStorage` bloqueado, o splash e o tour agora aparecem a cada carregamento completo da página (antes nunca apareciam).
- Não criar novo `useEffect` que só leia storage e chame `setState`: usar os hooks acima.
