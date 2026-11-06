# Osmo — Guia de Construção

> Documento vivo. Marcar cada item como concluído conforme avança.
> Status: `[ ]` pendente · `[x]` concluído · `[~]` em progresso · `[-]` bloqueado
> Última reconciliação com o código: 2026-11-06 (cada item foi conferido contra os arquivos). Decisões e o porquê: `docs/decisions/`.

---

## Fase 0 — Fundação ✅ (concluída)

- [x] Criar documentação de contexto (`docs/`)
- [x] Inicializar projeto Next.js 16 + TypeScript + Tailwind v4
- [x] Instalar dependências base (Supabase, Prisma, TanStack Query, Zustand, Lucide)
- [x] Configurar sistema de temas dark/light com tokens CSS
- [x] Configurar fonte Montserrat via `next/font`
- [x] Estrutura de pastas por contexto (student, admin, editor, simulations)
- [x] Configurar Prisma + conectar Supabase
- [x] Criar schema completo do banco (21 tabelas hoje)
- [x] Rodar migração inicial no Supabase (histórico reiniciado com um baseline em 2026-11-05, [ADR 0012](decisions/0012-historico-de-migrations-reiniciado.md))
- [x] Middleware de autenticação (Supabase SSR)
- [x] Criar `lib/env.ts` com validação Zod
- [x] Criar clientes Supabase (browser + server)
- [x] Primeiro commit no git

---

## Fase 1 — Design System & Layout Base ✅ (concluída)

### 1.1 shadcn/ui
- [x] Instalar e configurar shadcn/ui
- [x] Adaptar tema do shadcn com tokens da Osmo (brand colors)
- [x] Instalar componentes base: Button, Input, Card, Badge, Dialog, Dropdown, Separator, Skeleton, Sonner (toast)

### 1.2 Componentes de Layout
- [x] `components/layout/Sidebar.tsx` — navegação lateral com colapso
- [x] `components/layout/Header.tsx` — barra superior (busca, avatar, notificações)
- [x] `components/layout/StudentLayout.tsx` — layout raiz da área do aluno
- [x] `components/layout/AdminLayout.tsx` — layout raiz do admin
- [x] `components/layout/ThemeToggle.tsx` — botão dark/light
- [x] Drawer mobile: gaveta no header (`layout/header/MobileDrawer.tsx`)

### 1.3 Providers
- [x] `QueryProvider` (TanStack Query)
- [x] `ThemeProvider` (dark/light com persistência em localStorage)
- [x] Providers adicionados no `layout.tsx` raiz

---

## Fase 2 — Autenticação

- [x] Página `/login` — form com email/senha
- [x] Página `/cadastro` — form de registro
- [ ] Página `/recuperar-senha` (o link "¿Olvidaste tu contraseña?" do login leva a 404)
- [x] Server Actions de auth (login, cadastro, logout)
- [x] Página `/verificar-email` — aviso pós-cadastro para confirmar e-mail
- [x] Callback de OAuth do Supabase (`/auth/callback`)
- [x] Sincronizar usuário Supabase Auth → tabela `users` (trigger + upsert nas actions)
- [x] Proteção por papel: o middleware exige login; o papel ADMIN é verificado no layout do admin e em cada server action ([ADR 0011](decisions/0011-autorizacao-admin-em-camadas.md))
- [x] Hook `useUser()` para acesso ao usuário no client
- [ ] Login com Google (o botão existe, mas não faz nada)
- [ ] Política de senha de 8 caracteres (o formulário promete 8; o Supabase aceita 6)
- [ ] Páginas `/terminos` e `/privacidad` (o cadastro exige aceitar e linka para elas; hoje dão 404)

---

## Fase 3 — Área do Aluno (Conteúdo)

### 3.1 Dashboard
- [x] Página `/dashboard`
- [x] Card de boas-vindas com nome do aluno (com ícone por hora do dia)
- [x] Bloco "Continue de onde parou" (último tópico acessado, salvo no banco e no navegador)
- [ ] Grid de disciplinas com progresso
- [ ] Bloco do plano de estudos (próximos itens)
- [ ] Stats rápidas (vídeos, artigos, simulações, pontuação)

### 3.2 Navegação de Conteúdo
- [x] Hierarquia: Curso → Disciplina → Área → Tópico (modelo Kenhub)
- [x] Página `/cursos` — grid de todos os cursos
- [x] Página `/cursos/[curso]` — disciplinas do curso
- [x] Página `/cursos/[curso]/[disciplina]` — áreas da disciplina
- [x] Página `/cursos/[curso]/[disciplina]/[area]` — tópicos da área
- [x] Breadcrumb de navegação em todas as páginas
- [x] `lib/db/cursos.ts` — queries: listarCursos, getCursoPorSlug, getDisciplinaPorSlug, getAreaPorSlug, getTopicoPorSlug

### 3.3 Página de Tópico (unificada)
- [x] Página `/cursos/[curso]/[disciplina]/[area]/[topico]`
- [x] Seção de vídeo (YouTube embed / placeholder se sem vídeo)
- [x] Seção de artigo (renderizador Tiptap)
- [ ] Seção de simulações vinculadas
- [x] Seção de quiz (cards com configuração de sessão e histórico do aluno)
- [x] Atlas de imagens (imagem única, carrossel com preload, lupa) e tabelas de resumo
- [x] Tour de onboarding, busca de tópicos, índice lateral (desktop) e índice recolhível (mobile)
- [x] Navegação anterior/próximo tópico
- [~] Marcação automática de progresso: artigo lido e quiz aprovado definem o status do tópico ([ADR 0015](decisions/0015-progresso-do-topico.md)); faltam vídeo e simulações

---

## Fase 4 — Player de Vídeo

- [ ] Criar conta Mux e configurar variáveis de ambiente
- [ ] Componente `VideoPlayer.tsx` com `@mux/mux-player-react`
- [x] Embed de YouTube/Vimeo (`TopicVideoSection`, miniatura em `lib/video/thumbnail.ts`). Decisão de hospedagem própria pendente: [ADR 0009](decisions/0009-hospedagem-de-video.md)
- [ ] Registrar `video_assistido = true` ao atingir 90% do vídeo
- [ ] Thumbnail com skeleton durante carregamento

---

## Fase 5 — Artigo Interativo (Editor Tiptap)

### 5.1 Setup Tiptap
- [x] Instalar Tiptap e extensões base
- [ ] Extensões customizadas: `SimulacaoBlock`, `QuizInlineBlock`, `CalloutBlock`

### 5.2 Renderizador de artigo (área do aluno)
- [x] Componente `editor/ArtigoRenderer.tsx` — renderiza JSON Tiptap como HTML
- [x] Estilos tipográficos para artigo (`.artigo-content` em `globals.css`; callouts dependem do bloco customizado)
- [ ] Renderização de bloco `simulation` → busca simulação e renderiza componente
- [ ] Barra de progresso de leitura
- [x] Marcação automática `artigo_lido = true` ao chegar ao fim do artigo e permanecer 2 segundos (`ArtigoLidoTracker`)

### 5.3 Editor de artigo (admin)
- [x] Componente `editor/ArtigoEditor.tsx` com barra de ferramentas (negrito, itálico, sublinhado, títulos, listas, alinhamento, cor, destaque, link)
- [ ] Upload de imagem inline → Supabase Storage
- [ ] Inserção de bloco simulação via busca da biblioteca
- [ ] Preview do artigo em tempo real

---

## Fase 6 — Simulações

- [ ] Componente base `SimulacaoWrapper.tsx` (carrega tipo e renderiza)
- [ ] `DragAndDrop.tsx` — arrastar para categorias
- [ ] `Matching.tsx` — conectar pares
- [ ] `FillInBlank.tsx` — completar lacunas
- [ ] `Ordering.tsx` — ordenar sequências
- [ ] `LabelImage.tsx` — identificar partes de imagem
- [ ] `CustomHtml.tsx` — iframe sandboxed com postMessage
- [ ] Registrar conclusão de simulação no progresso do aluno

---

## Fase 7 — Quiz

- [x] Componente `QuizPlayer.tsx` — sessão full-screen: config, questões com feedback visual, tela de resultado
- [x] Card `TopicQuizSection.tsx` — card de cuestionario na página de tópico (portada, botão, "Lo que aprenderás")
- [x] Rota `/quizzes/[id]/session` — página standalone (sem sidebar/header do aluno)
- [x] Suporte aos 3 tipos de questão: VERDADEIRO_FALSO, MULTIPLA_ESCOLHA, ESCOLHA_IMAGEM
- [x] Auto-advance após resposta correta (1.2s) e errada (2.2s)
- [x] Menu: silenciar, encerrar antecipado
- [ ] Componente `QuizSimulado.tsx` (modo simulado com tempo rígido — fase futura)
- [x] Histórico de tentativas salvo no banco (`registrarTentativaQuiz`; pontuação calculada no servidor, [ADR 0014](decisions/0014-tentativas-de-quiz-pontuacao-no-servidor.md))
- [x] Última pontuação, melhor e nº de tentativas no card do quiz
- [ ] Quiz inline no artigo (`QuizInlineBlock`)

---

## Fase 8 — Painel Admin

### 8.1 Layout e Navegação Admin
- [x] Layout admin com sidebar (`AdminLayout`)
- [x] Proteção de rota por role ADMIN (layout + `requireAdmin` em todas as actions, verificado com conta de aluno)

### 8.2 Gestão de Conteúdo
- [x] CRUD de Disciplinas (com upload de capa)
- [x] CRUD de Áreas
- [x] CRUD de Tópicos (vídeo por URL, artigo, atlas, tabelas e quizzes vinculados)
- [ ] Upload de vídeo (Mux direct upload flow): hoje o vídeo é informado por URL
- [x] Editor de artigo (Tiptap) no painel do tópico; faltam upload de imagem inline e blocos customizados
- [x] Reordenação drag-and-drop de cursos, disciplinas, áreas e tópicos (`ContentTree`)

### 8.3 Biblioteca de Simulações
- [ ] Listagem de simulações
- [ ] Criador por tipo (formulário dinâmico por `TipoSimulacao`)
- [ ] Upload de HTML5 customizado
- [ ] Preview de simulação antes de salvar

### 8.4 Quiz Builder
- [x] Schema N:N: `Quiz` standalone + junction `TopicQuiz` + campos `capa_url` e `publicado`, e `termo` em cada questão
- [x] `lib/db/quizzes.ts` — listarQuizzes, getQuizAdmin, getQuizzesDoTopico, listarImagensDisponiveis
- [x] `lib/actions/content-quizzes.ts` — CRUD quiz/questão/opção + vincular/desvincular tópico
- [x] `/admin/quizzes` — lista de quizzes com status + botão criar
- [x] `/admin/quizzes/[id]` — editor completo: info básica, portada, termos, questões
- [x] `QuizPanel.tsx` — builder com 3 tipos de questão (múltiple opción, V/F, elegir imagen)
- [x] `QuizLinker.tsx` — seletor no TopicoPanel para vincular/desvincular quizzes
- [x] Upload de imagem no enunciado (via Supabase Storage — bucket `capas/quizzes/{id}/`)
- [x] Reuso de imagens existentes via picker visual (galeria unificada: quizzes + Atlas)

### 8.5 Usuários
- [ ] Listagem de alunos com busca
- [ ] Detalhes de progresso por aluno

---

## Fase 9 — Plano de Estudos (Mi Plan)

> Pastas pessoais do aluno com subpastas e tópicos salvos. Desenho e regras em [ADR 0016](decisions/0016-mi-plan-pastas-do-aluno.md).

- [ ] Modelo `Pasta` e `ItemPasta` (substituem `PlanoEstudos` e `ItemPlano`) e migration
- [ ] Regras puras: limite de 3 níveis, validação de nome e descrição, limites por aluno
- [ ] Consultas e actions do aluno, sempre filtradas pelo dono (`usuario_id` da sessão)
- [ ] Página `/plan-de-estudios`: pastas da raiz como cards altos e "Nueva carpeta"
- [ ] Página `/plan-de-estudios/[pasta]`: subpastas (cards como as disciplinas) e tópicos salvos
- [ ] Criar, editar (nome e descrição) e excluir pasta, com confirmação
- [ ] Capa padrão da pasta (upload de capa: fase futura, em bucket separado)
- [ ] Marcador do tópico abre o seletor de pastas (um tópico em várias pastas, criar pasta ali mesmo)
- [ ] Marcar item como concluído e mostrar o status automático do tópico
- [ ] Bloco de próximos itens no dashboard
- [ ] Fora do escopo por ora: reordenar por arrastar, mover pasta, compartilhar

---

## Fase 10 — Progresso & Biblioteca

- [ ] Página `/meu-progresso` com gráficos por disciplina
- [ ] Streak de dias estudados
- [ ] Histórico de quizzes
- [ ] Página `/biblioteca` com busca e filtros
- [ ] Favoritar tópicos

---

## Fase 11 — Polish & Deploy

- [~] SEO: metadata dinâmica por página (existe em algumas páginas; falta cobrir o conteúdo do aluno)
- [~] Loading skeletons em todas as listas (só atlas e "continuar" têm)
- [ ] Error boundaries e páginas de erro (404, 500): não existem `not-found.tsx` nem `error.tsx`
- [ ] Testes E2E das rotas críticas
- [~] Configurar Vercel (variáveis de ambiente de produção): o deploy existe; conferir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_EMAIL`
- [ ] Configurar domínio personalizado
- [x] RLS do Supabase em produção (verificado em 2026-11-06: tabelas fechadas e política de escrita do Storage corrigida, [ADR 0011](decisions/0011-autorizacao-admin-em-camadas.md))
- [ ] Auditoria de performance (Lighthouse)

---

## Qualidade e Segurança ✅ (concluído em 2026-11)

- [x] Autorização do admin em camadas: middleware, layout e `requireAdmin()` em todas as 54 actions ([ADR 0011](decisions/0011-autorizacao-admin-em-camadas.md))
- [x] Redirects validados (`safeInternalPath`) em `?back=` e no callback do OAuth
- [x] Histórico de migrations que reproduz o banco em um Postgres vazio ([ADR 0012](decisions/0012-historico-de-migrations-reiniciado.md)); `db:migrate` bloqueado contra banco remoto
- [x] `npm run check`: limites de tamanho de arquivo, proteção das actions de admin, acesso a dados só em `lib/`, cores hex travadas, typecheck e lint com zero erros e zero avisos
- [x] Componentes compartilhados: `LoadingButton`, `Modal`, `AuthShell`, hooks de estado no navegador ([ADR 0013](decisions/0013-estado-no-navegador-sem-setstate-em-efeito.md))
- [x] Documentação: 14 ADRs, `design-system.md`, `system-map.md`

---

## Sistema de Animações ✅ (concluído)

> Implementado via **Framer Motion** (`framer-motion ^13`). Toda animação nova deve usar as variantes de `src/lib/motion.ts` — nunca criar variantes inline.

### Variantes disponíveis em `src/lib/motion.ts`

| Exportação | Uso |
|---|---|
| `PAGE_VARIANTS` + `PAGE_TRANSITION` | Sem uso: a troca de página é só um fade-in em `PageTransition` ([ADR 0007](decisions/0007-transicao-de-pagina-fade-simples.md)) |
| `MODAL_BACKDROP` + `MODAL_PANEL` + `MODAL_TRANSITION` | Modais centralizados com backdrop |
| `BOTTOM_SHEET` + `SHEET_TRANSITION` | Drawers mobile que sobem do rodapé |
| `OVERLAY` | Backdrop de qualquer overlay (fade simples) |
| `INLINE_PANEL` | Painéis que abrem lateralmente (admin) |
| `DROPDOWN` + `DROPDOWN_ORIGIN` | Dropdowns (scaleY + fade) |
| `LIST_CONTAINER` + `LIST_ITEM` | Listas com stagger entre itens |
| `FAST` · `STANDARD` · `SMOOTH` | Transições de tempo reutilizáveis |

### Como implementar

**Transição de página** — automática: fade-in de 200 ms em `PageTransition`, já nos layouts `StudentLayout` e `AdminLayout`. Não usar `AnimatePresence` em volta de páginas. Não adicionar em rotas com animação própria (ex: `/quizzes/*/session`).

**Modal novo:** usar `components/ui/Modal.tsx`, que já traz fundo, animação, clique fora, Escape e `role="dialog"`. Nunca escrever `fixed inset-0` à mão.
```tsx
import { Modal } from "@/components/ui/Modal";

<Modal open={open} onClose={() => setOpen(false)} label="Título para leitores de tela" maxWidth="max-w-md">
  {/* conteúdo */}
</Modal>
```

**Dropdown novo:**
```tsx
import { motion, AnimatePresence } from "framer-motion";
import { DROPDOWN, DROPDOWN_ORIGIN, FAST } from "@/lib/motion";

<AnimatePresence>
  {open && (
    <motion.div variants={DROPDOWN} initial="initial" animate="animate" exit="exit"
      transition={FAST} style={DROPDOWN_ORIGIN} className="absolute ...">
      {/* itens */}
    </motion.div>
  )}
</AnimatePresence>
```

**Painel inline admin:**
```tsx
import { motion, AnimatePresence } from "framer-motion";
import { INLINE_PANEL, STANDARD } from "@/lib/motion";

<AnimatePresence>
  {panelOpen && (
    <motion.div variants={INLINE_PANEL} initial="initial" animate="animate" exit="exit"
      transition={STANDARD}>
      {/* painel */}
    </motion.div>
  )}
</AnimatePresence>
```

### Exceções — NÃO usar `PageTransition`

- `/quizzes/*/session` — o `QuizPlayer` tem sua própria animação de slide entre questões
- Páginas de autenticação (`(auth)`) — têm layout próprio (`AuthShell`), sem `PageTransition`

---

## Ordem de Construção Recomendada

```
Fase 1 → Fase 2 → Fase 3.1 → Fase 3.2 → Fase 4 → Fase 5 →
Fase 6 → Fase 7 → Fase 3.3 (completo) → Fase 8 → Fase 9 → Fase 10 → Fase 11
```

> Construir a área do aluno antes do admin permite testar o produto real mais cedo.
> O admin é construído em paralelo ou logo depois, alimentando o conteúdo real.
