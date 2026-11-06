# Osmo — Design System (regras de uso)

> Complementa `brand.md` (identidade e paleta). Este documento diz **como aplicar** nos componentes: raio, motion, estados e padrões. Antes de criar qualquer tela ou componente, ler a seção 8.

Fonte dos tokens: `src/app/globals.css` (variáveis em `:root.dark` / `:root.light`). Fonte do movimento: `src/lib/motion.ts`.

---

## 1. Cor

- **Nunca hardcodar cor.** Usar as variáveis: `var(--bg-base | --bg-surface | --bg-elevated | --bg-subtle)`, `var(--border | --border-subtle)`, `var(--text-primary | --text-secondary | --text-muted)`, `var(--accent | --accent-hover | --accent-subtle)`, `var(--success | --warning | --error)`.
- Fundo da página: `--bg-base`. Cards e painéis: `--bg-surface`. Dropdowns, modais e barras: `--bg-elevated`.
- Feedback de acerto/erro usa `--success` e `--error`, não `#22C55E` / `#EF4444`.
- Cor de acento por disciplina vem do banco (`cor_acento`) e é passada como prop, não fixada no componente.
- Sobre imagens, usar `--capa-overlay` para legibilidade do texto.

## 2. Tipografia

Montserrat (carregada em `app/layout.tsx`). Títulos 700, subtítulos 600, corpo 400, labels e UI 500. Rótulos em maiúsculas levam `tracking-wide` ou `tracking-widest`.

## 3. Raio de borda

| Elemento | Classe | Observação |
|---|---|---|
| Botões, inputs, selects | `rounded-lg` | Mesma classe nos dois: lado a lado nunca devem divergir |
| Cards, painéis, itens de lista | `rounded-xl` | |
| Modais, cartões de destaque, cards de resultado | `rounded-2xl` | Elemento "principal" da tela |
| Badges, chips de filtro, avatares, spinners | `rounded-full` | |
| Detalhes internos pequenos | `rounded-md` | Evitar `rounded-sm` |

Uso atual no código: `rounded-lg` 109, `rounded-xl` 75, `rounded-full` 54, `rounded-md` 22, `rounded-2xl` 16, `rounded-sm` 5. A regra acima segue o `brand.md` (botão 8 px, card 12 px) e a padronização do login feita em 2026-10-15.

## 4. Espaçamento

Unidade base de 4 px. Gaps de conteúdo 24 px (desktop) e 16 px (mobile). Largura máxima de conteúdo 1280 px. Preferir `gap` a margens entre irmãos.

## 5. Movimento (`src/lib/motion.ts`)

| Token | Uso |
|---|---|
| `FAST` (150 ms) | Dropdowns e microinterações |
| `STANDARD` (220 ms) | Acordeões e painéis inline |
| `SMOOTH` (300 ms) | Slides e trocas maiores |
| `MODAL_BACKDROP` + `MODAL_PANEL` + `MODAL_TRANSITION` | Modais |
| `DROPDOWN` + `DROPDOWN_ORIGIN` | Menus |
| `ACCORDION_OPEN / CLOSE / STYLE` | Expandir e recolher |
| `LIST_CONTAINER` + `LIST_ITEM` | Listas com entrada escalonada |

Regras:
- Troca de página é só fade-in (`PageTransition`). Não usar `AnimatePresence` em volta de `children` de página ([ADR 0007](decisions/0007-transicao-de-pagina-fade-simples.md)).
- `AnimatePresence` é para elementos que ficam montados até a saída terminar (modais, menus, acordeões).
- Respeitar `prefers-reduced-motion` em animações novas.
- Não criar duração ou easing avulso: usar ou acrescentar um token em `motion.ts`.

## 6. Padrões de interação

**Botão de ação (primário e secundário):** usar `components/ui/LoadingButton.tsx` (`variant="primary" | "secondary"`). Primário: fundo `--accent`, texto branco, `rounded-lg`, `font-semibold`, `py-3`, hover com brilho, `active:scale-[0.98]`. Secundário: transparente, borda `--border`, texto `--text-secondary`, mesmo raio e altura.

**Estado de carregamento de ação** (login, "Volver al tema", salvar): `<LoadingButton loading={...} loadingText="Entrando…">`. Ao ficar `loading`, o botão desabilita, mostra o spinner e troca o texto por um gerúndio, com opacidade reduzida. Nunca deixar o clique sem resposta visual. Em botões novos de ação, não escrever `<button>` + `Loader2` à mão.

**Input:** altura e raio iguais ao botão (`rounded-lg`), borda `1.5px solid var(--border)`, foco com borda `--accent` e anel `0 0 0 3px` em acento com 12% de opacidade, ícone à esquerda. Referência: `components/auth/AuthInput.tsx`.

**Modal:** backdrop `rgba(0,0,0,0.65)`, clique fora fecha, painel `rounded-2xl` com `MODAL_PANEL`, `max-height: 90dvh` com rolagem interna. Referência: `TopicQuizSection.tsx` (modal de configuração).

**Imagem que carrega** (atlas, capas): skeleton com a altura do container, fade-in de 200 ms quando pronta, preload das vizinhas em carrosséis com `useImagePreload(urls)` (`hooks/`) e `preloadImage(src)` (`lib/image-preload.ts`) ([ADR 0008](decisions/0008-imagens-do-atlas-preload-decode.md)).

**Responsividade:** lógica por viewport usa `useIsMobile()` ([ADR 0002](decisions/0002-viewport-via-hook.md), em revisão).

## 7. Textos

Todo texto visível em espanhol latino ([ADR 0001](decisions/0001-idioma-es-419.md)). Botão diz o que faz ("Comenzar", "Volver al tema"). Erro diz o que houve e como resolver.

## 8. Antes de criar UI nova

1. O padrão já existe? Procurar na seção 6 e em `components/student/` e `components/ui/`. Reusar antes de criar.
2. Cores só por variável; raio pela tabela da seção 3.
3. Mesmo bloco em 2 lugares: extrair antes do 3º (`CLAUDE.md`).
4. Estado de loading, vazio e erro definidos, não só o caminho feliz.
5. Funciona em tema claro e escuro.
6. Arquivo dentro dos limites de tamanho (`CLAUDE.md`).

---

## 9. Estado atual e dívida (medido em 2026-11-05)

**Componentes base não adotados.** `components/ui/` (shadcn) quase não é usado: `button` é importado em 1 arquivo, `sonner` em 1, e `input`, `card`, `badge`, `dialog`, `skeleton`, `separator`, `dropdown-menu` em 0. Em contrapartida há 153 `<button>` e 59 `<input>` escritos à mão com estilo inline. É daqui que nascem divergências visuais. Caminho recomendado, sem reescrever tudo de uma vez: criar `Button`, `Input` e `Modal` próprios do Osmo seguindo a seção 6 (ou adaptar os de `ui/`), e migrar por tela quando ela for tocada.

**Cor hardcoded.** 30 arquivos `.tsx` têm cor hex literal. O `#00A6FF` aparece 46 vezes e `#22C55E` / `#EF4444` outras 46, apesar de existirem `--accent`, `--success` e `--error`. O login resolve tema com ternários de hex (`isDark ? "#17263A" : "#FFFFFF"`) em vez de variáveis.

**Modais próprios.** 4 modais são feitos à mão com `fixed inset-0` (`ConfirmModal`, `QuizImagePicker`, `TopicQuizSection`, `AdminNavGuard`), cada um com seu fundo e animação, apesar de existir `ui/dialog.tsx`.

**Spinner e loading.** `animate-spin` aparece em 9 arquivos com variações de tamanho e texto. O `LoadingButton` já existe e é usado no login e em "Volver al tema"; os demais botões com spinner (`ConfirmModal`, `QuestaoRow`, `QuizImagePicker`, `verificar-email`) devem migrar quando forem tocados.

**Lint.** Zero erros (eram 18, corrigidos em 2026-11-05; ver [ADR 0013](decisions/0013-estado-no-navegador-sem-setstate-em-efeito.md)). Restam 26 avisos, com teto em `--max-warnings 26`: 13 de `no-unused-vars`, 4 de `no-unused-expressions`, 4 de `no-img-element`, 1 de `alt-text`, 1 de `exhaustive-deps` e 3 diretivas `eslint-disable` sem efeito. Corrigir avisos e baixar o teto em `package.json`.

**Tokens órfãos.** `PAGE_VARIANTS` e `PAGE_TRANSITION` em `motion.ts` não são mais usados.

**Arquivos acima do limite.** Nenhum arquivo passa dos limites do `CLAUDE.md` (verificados por `npm run check:size`, com `scripts/file-size-baseline.json` vazio): qualquer arquivo novo acima do limite quebra o `check`. Arquivos grandes sem limite definido no `CLAUDE.md`: `ContentTree.tsx` 495, `TopicTour.tsx` 480, `TopicQuizSection.tsx` 468, `TabelasCard.tsx` 390.