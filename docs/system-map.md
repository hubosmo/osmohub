# Osmo — Mapa do Sistema

> Documento de referência rápida. Ler antes de implementar qualquer módulo novo.
> Mostra o que **realmente existe hoje**, fluxos do usuário, e dependências entre módulos.
> Complementa `module-map.json` (detalhe por módulo) e `guia-construcao.md` (checklist de fases).

---

## 1. Status Atual do Sistema

### Concluído (em produção)

| Área | O que existe |
|---|---|
| **Fundação** | env.ts (Zod), Prisma singleton, clientes Supabase (browser + server) |
| **Autenticação** | Login, cadastro, verificar-email, callback OAuth, hook useUser, middleware |
| **Layout aluno** | StudentLayout, Header (com mega-menu de cursos), Sidebar, ThemeToggle |
| **Layout admin** | AdminLayout, AdminNavGuard, AdminSaveForm |
| **Dashboard** | Boas-vindas, DashboardCursos, DashboardNavegar, ContinuarUnidad |
| **Navegação de conteúdo** | Cursos → Disciplinas → Áreas → Tópicos (hierarquia completa) |
| **Página de tópico** | Vídeo, Artigo (Tiptap), Atlas (imagens + carrossel), Tabelas, Quiz (placeholder) |
| **Tour de onboarding** | TopicTour (5 passos, localStorage, estilo Kenhub) |
| **Admin — conteúdo** | CRUD Cursos, Disciplinas, Áreas, Tópicos, Atlas, Tabelas, Vídeo, Artigo |
| **Hooks/utils** | useIsMobile, LastTopicTracker, MobileIndiceBar, TopicSearch |

### Pendente (próximas fases)

| Módulo | Bloqueado por |
|---|---|
| Player Mux nativo | Conta Mux + env vars |
| Simulações interativas | DragAndDrop, Matching, FillInBlank, etc. |
| Quiz completo | QuizPlayer, QuizSimulado, QuizBuilder no admin |
| Progresso do aluno | progresso.ts, marcação automática em vídeo/artigo |
| Plano de estudos | plano.ts, UI de plano |
| Biblioteca (busca) | lib/db/busca.ts |
| Auth por role no middleware | Validação ADMIN vs STUDENT |

---

## 2. Hierarquia de Rotas

```
/ (marketing — landing)
├── /login
├── /cadastro
├── /verificar-email
│
├── /cursos                              ← lista todos os cursos
│   └── /[curso]                         ← disciplinas do curso
│       └── /[disciplina]                ← áreas da disciplina
│           └── /[area]                  ← tópicos da área
│               └── /[topico]            ← página unificada do tópico
│
├── /dashboard
│
└── /admin
    ├── /admin/cursos
    │   └── /admin/cursos/[id]           ← painel do curso (disciplinas inline)
    ├── /admin/disciplinas/[id]          ← painel da disciplina (áreas inline)
    ├── /admin/areas/[id]                ← painel da área (tópicos inline)
    ├── /admin/topicos/[id]              ← painel do tópico (vídeo, artigo, atlas, tabelas)
    └── /admin/content                   ← árvore de conteúdo (ContentTree)
```

**Nota:** O admin usa um único ContentTree que renderiza painéis aninhados (Curso → Disciplina → Área → Tópico) sem navegar de página.

---

## 3. Fluxo do Aluno

```
[Landing page]
    ↓ clica "Entrar"
[Login / Cadastro]  →  Supabase Auth  →  sync tabela users
    ↓ autenticado
[Dashboard]
  ├── DashboardWelcome  (nome + hora)
  ├── DashboardCursos   (carrossel de cursos)
  ├── ContinuarUnidad  (último tópico via localStorage)
  └── DashboardNavegar (links rápidos)
    ↓ clica em um curso
[/cursos/[curso]]  →  CursoDisciplinas (grade de disciplinas)
    ↓ clica em disciplina
[/cursos/[curso]/[disciplina]]  →  DisciplinaAreas
  ├── Sidebar: lista de áreas (desktop)
  ├── Tabs scroll horizontal (mobile)
  ├── Card de destaque da área selecionada
  └── Lista de tópicos com badges (vídeo, artigo, duração)
    ↓ clica em tópico
[/cursos/[curso]/[disciplina]/[area]/[topico]]  →  TopicoPage
  ├── TopicTour (1ª visita — floating card 5 passos)
  ├── LastTopicTracker (salva no banco para ContinuarUnidad)
  ├── Breadcrumb sticky (top:0)
  ├── MobileIndiceBar (índice de seções — mobile)
  ├── Sidebar esquerda com links de seção (desktop)
  ├── Título + Badge de status + Objetivos
  └── Seções numeradas (apenas seções ativas):
      ├── TopicVideoSection  (#video)
      ├── ArticuloSection   (#articulo) — ArtigoRenderer Tiptap
      ├── TopicAtlasSection  (#atlas)   — AtlasCarousel + AtlasImageViewer
      ├── TablasSection      (#tablas)
      └── CuestionarioSection (#cuestionario) — placeholder
```

---

## 4. Fluxo do Admin

```
[/admin/content]  →  ContentTree
  ├── Lista de cursos
  └── Clica em curso → CursoPanel (inline no lado direito)
      ├── Editar nome, slug, capa
      ├── Lista de disciplinas
      └── Clica em disciplina → DisciplinaPanel
          ├── Editar nome, slug, capa, cor, ícone
          ├── Lista de áreas
          └── Clica em área → AreaPanel
              ├── Editar nome, slug, capa
              ├── Lista de tópicos
              └── Clica em tópico → TopicoPanel
                  ├── SectionToggle (liga/desliga vídeo, artigo, atlas, tabelas, quiz)
                  ├── VideoUploadSection (YouTube URL ou Mux)
                  ├── ArtigoEditor (Tiptap — MiniEditor)
                  ├── AtlasBlocksManager → GrupoImagensCard / ImageLegendaEditor
                  └── TabelasCard → colunas + linhas
```

---

## 5. Componentes — Mapa de Arquivos

### Layout
```
src/components/layout/
  StudentLayout.tsx     → wrapper px-4 lg:px-8 py-6 para área do aluno
  StudentHeader.tsx     → header com logo, mega-menu cursos, avatar, tema
  Header.tsx            → header alternativo (legado)
  Sidebar.tsx           → sidebar colapsável desktop
  AdminLayout.tsx       → layout admin (sidebar + conteúdo)
  ThemeToggle.tsx       → botão dark/light
  TopLoader.tsx         → barra de progresso de navegação
```

### Aluno
```
src/components/student/
  AreaTopicos.tsx         → página /[area]: lista de tópicos da área
  AtlasCarousel.tsx       → galeria de imagens com slide animation
  AtlasImageViewer.tsx    → imagem standalone com legenda colapsável
  CollapsibleCaption.tsx  → legenda expansível (usada pelo AtlasImageViewer)
  ContinuarUnidad.tsx     → card "Continue de onde parou"
  CursoDisciplinas.tsx    → grade de disciplinas de um curso
  CursosExplorer.tsx      → explorador de cursos
  DashboardCursos.tsx     → carrossel de cursos no dashboard
  DashboardNavegar.tsx    → cards de navegação rápida
  DashboardWelcome.tsx    → boas-vindas com ícone por hora do dia
  DisciplinaAreas.tsx     → página /[disciplina]: seletor de áreas + tópicos
  LastTopicTracker.tsx    → rastreia último tópico acessado (banco)
  MobileIndiceBar.tsx     → índice colapsável de seções (mobile only)
  RichOrPlain.tsx         → renderiza HTML rico ou texto simples
  TablasSection.tsx       → tabelas interativas com blur-reveal
  ThemeAwareCapa.tsx      → imagem que troca entre capa dark/light
  TodosCursos.tsx         → grade de todos os cursos
  TopicAtlasSection.tsx   → orquestra AtlasCarousel + AtlasImageViewer
  TopicSearch.tsx         → busca dentro de um tópico
  TopicTour.tsx           → tour guiado na 1ª visita (Kenhub-style)
  TopicVideoSection.tsx   → player YouTube/Vimeo com toVideoEmbed
```

### Admin
```
src/components/admin/
  AdminNavGuard.tsx         → bloqueia navegação com mudanças não salvas
  AdminSaveForm.tsx         → form wrapper com submit automático
  AtlasActions.tsx          → ações de atlas (adicionar imagem, etc.)
  AtlasBlocksManager.tsx    → gerencia grupos e imagens do atlas
  ContentTree.tsx           → árvore de conteúdo (painel principal)
  DuracaoInput.tsx          → input de duração em minutos
  GrupoImagensCard.tsx      → card de grupo de imagens
  ImageLegendaEditor.tsx    → editor de legenda de imagem
  ImageUploadForm.tsx       → upload de imagem para Supabase Storage
  SectionToggle.tsx         → toggle de seções do tópico (vídeo, artigo, etc.)
  TabelasCard.tsx           → editor de tabela com colunas e linhas
  panels/
    AreaPanel.tsx           → painel de edição de área
    CapaUploadSection.tsx   → upload de capa (curso/disciplina/área)
    CursoPanel.tsx          → painel de edição de curso
    DisciplinaPanel.tsx     → painel de edição de disciplina
    EmptyPanel.tsx          → estado vazio quando nada está selecionado
    TopicoPanel.tsx         → painel completo de edição de tópico
```

### Editor
```
src/components/editor/
  ArtigoRenderer.tsx  → renderiza JSON Tiptap como HTML (área do aluno)
  MiniEditor.tsx      → editor Tiptap simplificado (admin)
```

---

## 6. Server Actions — Domínios

```
src/lib/actions/
  auth.ts                    → login, cadastro, logout, getUser
  search.ts                  → busca de conteúdo
  content-ultimo-topico.ts   → salvarUltimoTopico (usado pelo LastTopicTracker)
  content-structure.ts       → CRUD: curso, disciplina, área, tópico, capas, reordenar
  content-atlas.ts           → imagens standalone + grupos de imagens
  content-tabelas.ts         → tabelas e linhas
  content-media.ts           → vídeo e artigo (upsert, deletar, salvar)
```

**Regra:** cada domínio novo → arquivo novo. Nunca misturar domínios.

---

## 7. Queries de Banco — Arquivos

```
src/lib/db/
  prisma.ts     → singleton Prisma Client
  cursos.ts     → listarCursos, getCursoPorSlug, getDisciplinaPorSlug,
                  getAreaPorSlug, getTopicoPorSlug (hierarquia completa)
  admin.ts      → queries admin (listagem, contagens)
```

**Pendentes:** `progresso.ts`, `plano.ts`, `simulacoes.ts`, `quizzes.ts`

---

## 8. Dependências entre Módulos

```
foundation.env
  └── foundation.supabase
  └── foundation.prisma

foundation.prisma
  └── lib/db/* (todas as queries)

foundation.supabase
  └── auth.* (login, cadastro, sessão)
  └── middleware

lib/db/cursos.ts
  └── student.disciplinas (DisciplinaAreas, AreaTopicos)
  └── student.topico (TopicoPage)
  └── admin.content (ContentTree + panels)

lib/actions/content-structure.ts
  └── admin panels: ContentTree, CursoPanel, DisciplinaPanel, AreaPanel, TopicoPanel, SectionToggle

lib/actions/content-atlas.ts
  └── AtlasBlocksManager, GrupoImagensCard, ImageLegendaEditor

lib/actions/content-tabelas.ts
  └── TabelasCard

lib/actions/content-media.ts
  └── TopicoPanel (vídeo), ArtigoEditor

hooks/useIsMobile.ts
  └── AreaTopicos, DisciplinaAreas, TablasSection, StudentHeader, + todos os componentes responsivos

layout.student → student.dashboard → student.disciplinas → student.topico
layout.admin → admin.content → [panels] → [server actions] → [lib/db]
```

---

## 9. Variáveis de Ambiente (lib/env.ts)

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente Supabase admin (server only) |
| `DATABASE_URL` | Prisma (pooled) |
| `DIRECT_URL` | Prisma (direto — migrações) |
| `MUX_TOKEN_ID` | API Mux |
| `MUX_TOKEN_SECRET` | API Mux |
| `MUX_WEBHOOK_SECRET` | Verificação de webhook Mux |

---

## 10. Tabelas do Banco (Prisma Schema)

```
users                → alunos e admins (role: STUDENT | ADMIN)
cursos               → cursos (slug, nome, capa_url)
disciplinas          → disciplinas de um curso (slug, cor_acento, icone)
areas                → áreas de uma disciplina (slug, capa_url, capa_url_light)
topicos              → tópicos de uma área (slug + flags: video_ativo, artigo_ativo, atlas_ativo, tabelas_ativo)
videos               → URL YouTube/Vimeo ou mux_playback_id por tópico
artigos              → content JSON (Tiptap) por tópico
imagens              → imagens standalone do atlas (ordem, url, legenda)
grupos_imagens       → grupos de carrossel (título, modo_legenda)
imagens_grupo        → imagens dentro de um grupo (ordem, url, legenda)
tabelas              → tabelas por tópico (titulo, tipo, cabecalhos JSON)
linhas_tabela        → linhas de uma tabela (categoria, conteudo, valores_extra JSON)
progresso_topicos    → video_assistido, artigo_lido, simulacoes_concluidas por (user, topico)
tentativas_quiz      → histórico de quizzes do aluno
planos_estudos       → planos nomeados por aluno
itens_plano          → tópicos no plano + ordem + concluido
simulacoes           → biblioteca de simulações reutilizáveis (tipo, config JSON)
topico_simulacoes    → vinculo simulação ↔ tópico
quizzes              → quizzes por tópico
questoes             → questões de um quiz
opcoes               → opções de uma questão (texto, correta)
```
