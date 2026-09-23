# Osmo — Guia de Construção

> Documento vivo. Marcar cada item como concluído conforme avança.
> Status: `[ ]` pendente · `[x]` concluído · `[~]` em progresso · `[-]` bloqueado

---

## Fase 0 — Fundação ✅ (concluída)

- [x] Criar documentação de contexto (`docs/`)
- [x] Inicializar projeto Next.js 16 + TypeScript + Tailwind v4
- [x] Instalar dependências base (Supabase, Prisma, TanStack Query, Zustand, Lucide)
- [x] Configurar sistema de temas dark/light com tokens CSS
- [x] Configurar fonte Montserrat via `next/font`
- [x] Estrutura de pastas por contexto (student, admin, editor, simulations)
- [x] Configurar Prisma + conectar Supabase
- [x] Criar schema completo do banco (14 tabelas)
- [x] Rodar migração inicial no Supabase
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
- [ ] Drawer mobile (sidebar colapsável em telas pequenas) — pendente

### 1.3 Providers
- [x] `QueryProvider` (TanStack Query)
- [x] `ThemeProvider` (dark/light com persistência em localStorage)
- [x] Providers adicionados no `layout.tsx` raiz

---

## Fase 2 — Autenticação

- [x] Página `/login` — form com email/senha
- [x] Página `/cadastro` — form de registro
- [ ] Página `/recuperar-senha`
- [x] Server Actions de auth (login, cadastro, logout)
- [x] Página `/verificar-email` — aviso pós-cadastro para confirmar e-mail
- [x] Callback de OAuth do Supabase (`/auth/callback`)
- [x] Sincronizar usuário Supabase Auth → tabela `users` (trigger + upsert nas actions)
- [ ] Proteção de rotas no middleware validando role (STUDENT/ADMIN)
- [x] Hook `useUser()` para acesso ao usuário no client

---

## Fase 3 — Área do Aluno (Conteúdo)

### 3.1 Dashboard
- [x] Página `/dashboard`
- [x] Card de boas-vindas com nome do aluno (com ícone por hora do dia)
- [ ] Bloco "Continue de onde parou" (último tópico acessado)
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
- [x] Seção de artigo (placeholder — editor Tiptap na Fase 5)
- [ ] Seção de simulações vinculadas
- [ ] Seção de quiz
- [x] Navegação anterior/próximo tópico
- [ ] Marcação automática de progresso

---

## Fase 4 — Player de Vídeo

- [ ] Criar conta Mux e configurar variáveis de ambiente
- [ ] Componente `VideoPlayer.tsx` com `@mux/mux-player-react`
- [ ] Suporte a fallback YouTube/Vimeo (embed iframe)
- [ ] Registrar `video_assistido = true` ao atingir 90% do vídeo
- [ ] Thumbnail com skeleton durante carregamento

---

## Fase 5 — Artigo Interativo (Editor Tiptap)

### 5.1 Setup Tiptap
- [ ] Instalar Tiptap e extensões base
- [ ] Extensões customizadas: `SimulacaoBlock`, `QuizInlineBlock`, `CalloutBlock`

### 5.2 Renderizador de artigo (área do aluno)
- [ ] Componente `ArtigoRenderer.tsx` — renderiza JSON Tiptap como HTML
- [ ] Estilos tipográficos para artigo (headings, listas, callouts)
- [ ] Renderização de bloco `simulation` → busca simulação e renderiza componente
- [ ] Barra de progresso de leitura
- [ ] Marcação automática `artigo_lido = true` ao rolar até o final

### 5.3 Editor de artigo (admin)
- [ ] Componente `ArtigoEditor.tsx` com barra de ferramentas
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

- [ ] Componente `QuizPlayer.tsx` (modo prática)
- [ ] Componente `QuizSimulado.tsx` (com timer)
- [ ] Tela de resultado com pontuação e explicações
- [ ] Histórico de tentativas
- [ ] Quiz inline no artigo (`QuizInlineBlock`)

---

## Fase 8 — Painel Admin

### 8.1 Layout e Navegação Admin
- [ ] Layout admin com sidebar (`AdminLayout`)
- [ ] Proteção de rota por role ADMIN

### 8.2 Gestão de Conteúdo
- [ ] CRUD de Disciplinas (com upload de capa)
- [ ] CRUD de Áreas
- [ ] CRUD de Tópicos
- [ ] Upload de vídeo (Mux direct upload flow)
- [ ] Editor de artigo completo (Tiptap)
- [ ] Reordenação drag-and-drop de áreas e tópicos

### 8.3 Biblioteca de Simulações
- [ ] Listagem de simulações
- [ ] Criador por tipo (formulário dinâmico por `TipoSimulacao`)
- [ ] Upload de HTML5 customizado
- [ ] Preview de simulação antes de salvar

### 8.4 Quiz Builder
- [ ] Criar quiz e adicionar questões
- [ ] Upload de imagem no enunciado
- [ ] Definir modo e tempo limite

### 8.5 Usuários
- [ ] Listagem de alunos com busca
- [ ] Detalhes de progresso por aluno

---

## Fase 9 — Plano de Estudos

- [ ] Página `/plano-de-estudos`
- [ ] Criar e nomear planos
- [ ] Adicionar tópicos ao plano (busca ou navegação)
- [ ] Reordenação de itens
- [ ] Marcar item como concluído
- [ ] Bloco de próximos itens no dashboard

---

## Fase 10 — Progresso & Biblioteca

- [ ] Página `/meu-progresso` com gráficos por disciplina
- [ ] Streak de dias estudados
- [ ] Histórico de quizzes
- [ ] Página `/biblioteca` com busca e filtros
- [ ] Favoritar tópicos

---

## Fase 11 — Polish & Deploy

- [ ] SEO: metadata dinâmica por página
- [ ] Loading skeletons em todas as listas
- [ ] Error boundaries e páginas de erro (404, 500)
- [ ] Testes E2E das rotas críticas
- [ ] Configurar Vercel (variáveis de ambiente de produção)
- [ ] Configurar domínio personalizado
- [ ] RLS do Supabase em produção
- [ ] Auditoria de performance (Lighthouse)

---

## Ordem de Construção Recomendada

```
Fase 1 → Fase 2 → Fase 3.1 → Fase 3.2 → Fase 4 → Fase 5 →
Fase 6 → Fase 7 → Fase 3.3 (completo) → Fase 8 → Fase 9 → Fase 10 → Fase 11
```

> Construir a área do aluno antes do admin permite testar o produto real mais cedo.
> O admin é construído em paralelo ou logo depois, alimentando o conteúdo real.
