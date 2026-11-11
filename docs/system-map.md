# Osmo — Mapa do Sistema

> Documento de referência rápida. Ler antes de implementar qualquer módulo novo.
> Mostra o que **realmente existe hoje**, fluxos do usuário, e dependências entre módulos.
> Complementa `module-map.json` (detalhe por módulo) e `guia-construcao.md` (checklist de fases).
> Regras visuais: `design-system.md`. Decisões já tomadas e o porquê: `decisions/`.
> Última verificação contra o código: 2026-11-05.

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
| **Página de tópico** | Vídeo, Artigo (Tiptap), Atlas (imagens + carrossel), Tabelas, Cuestionario (card + configuração de sessão) |
| **Quiz — aluno** | Sessão em tela cheia (`QuizPlayer`): timer em contagem regressiva, 1 ou 2 tentativas, navegação para questões já respondidas, filtro por termo, tela de resultado personalizada, retorno ao tópico de origem |
| **Quiz — admin** | `/admin/quizzes` (lista) e `/admin/quizzes/[id]` (builder: questões, opções, imagens, termos, publicar), vínculo N:N a tópicos (`QuizLinker`) |
| **Tour de onboarding** | TopicTour (5 passos, +1 de Atlas 3D quando o tópico tem modelos, localStorage, estilo Kenhub) |
| **Admin — conteúdo** | CRUD Cursos, Disciplinas, Áreas, Tópicos, Atlas, Tabelas, Vídeo (embed), Artigo |
| **Hooks/utils** | useIsMobile, LastTopicTracker, MobileIndiceBar, TopicSearch |

### Pendente (próximas fases)

| Módulo | Bloqueado por |
|---|---|
| Hospedagem de vídeo própria | Decisão em [ADR 0009](decisions/0009-hospedagem-de-video.md) (Mux vs Cloudflare Stream) |
| Simulações interativas | DragAndDrop, Matching, FillInBlank, etc. (pasta `components/simulations/` vazia) |
| Quiz: modo simulado | `modo` e `tempo_limite_seg` do quiz existem no schema mas não são lidos; as tentativas já são gravadas ([ADR 0014](decisions/0014-tentativas-de-quiz-pontuacao-no-servidor.md)) |
| Progresso do aluno: vídeo e visões agregadas | Vídeo assistido (80 %), artigo lido e quiz aprovado já definem o status do tópico ([ADR 0015](decisions/0015-progresso-do-topico.md)). Falta mostrar o status na lista da área, no dashboard e em "Meu progreso" |
| Plano de estudos (Mi plan) | pastas.ts, components/student/pastas/ |
| Biblioteca (busca) | lib/db/busca.ts |
| Revisão de segurança restante | Queries de `lib/db/admin.ts` sem guarda própria. RLS e Storage foram verificados e corrigidos em 2026-11-06 (ver [ADR 0011](decisions/0011-autorizacao-admin-em-camadas.md)) |

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
├── /quizzes/[id]/session                ← sessão de quiz em tela cheia (route group `(quiz)`, ver ADR 0004)
│       query: back, time, attempts, exclude
│
└── /admin
    ├── /admin                           ← painel inicial
    ├── /admin/content                   ← árvore de conteúdo (ContentTree)
    ├── /admin/quizzes                   ← lista de quizzes
    └── /admin/quizzes/[id]              ← builder do quiz (QuizPanel)
```

**Nota:** O admin de conteúdo usa um único ContentTree que renderiza painéis aninhados (Curso → Disciplina → Área → Tópico) sem navegar de página. Não existem páginas `/admin/cursos/[id]`, `/admin/disciplinas/[id]` etc.

**Route groups:** `(auth)` login/cadastro · `(student)` área do aluno com header/sidebar · `(quiz)` sessão de quiz sem chrome · `(admin)` painel.

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
  ├── TopicTour (1ª visita — floating card 5 passos, +Atlas 3D se houver modelos)
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
      └── TopicQuizSection   (#cuestionario) — cards dos quizzes publicados vinculados ao tópico
```

### Fluxo do quiz (aluno)

```
[Tópico] → TopicQuizSection
  ├── "Comenzar ▶" ou engrenagem (modal: tempo 5/10/20/30 min, 1 ou 2 intentos,
  │     termos a incluir/excluir, salvar como padrão em localStorage)
  └── router.push /quizzes/[id]/session?back=<tópico>&time=&attempts=&exclude=
        ↓
[(quiz)/layout]  → busca usuário no Supabase, provê UserProvider
[session/page]   → carrega quiz publicado + questões → <QuizPlayer>
  fase "playing"  QuizPlayerPlaying + QuizPlayerOpcoes
                  (timer regressivo, auto-encerra no fim; ‹ › revisa respostas anteriores)
  fase "finished" QuizPlayerFinished (nome, frase por faixa de nota, confete ≥70%)
        ↓ "Volver al tema" → router.push(back)     (ADR 0005)
        ↓ "Volver a intentar" → nova sessão
```

Regras de quiz: ver [ADR 0006](decisions/0006-tentativas-em-questoes-binarias.md). Ao terminar, o `QuizPlayer` envia as respostas a `registrarTentativaQuiz`, que calcula a pontuação no servidor e grava em `tentativas_quiz` ([ADR 0014](decisions/0014-tentativas-de-quiz-pontuacao-no-servidor.md)); o card do quiz no tópico mostra última e melhor pontuação.

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
  StudentHeader.tsx     → header do aluno: monta logo, barra de utilidades, navegação e gaveta mobile
  header/
    HeaderUtilityBar.tsx → barra superior desktop: tema, notificações, menu do usuário (perfil, admin, logout)
    DesktopNav.tsx       → navegação desktop com mega-menu de cursos (estado de hover próprio)
    MobileDrawer.tsx     → gaveta mobile com acordeão de cursos e disciplinas, tema, usuário e logout
    nav-links.ts         → OTHER_NAV, isCursosActive, isPathActive
  Header.tsx            → header alternativo (legado)
  Sidebar.tsx           → sidebar colapsável desktop
  AdminLayout.tsx       → layout admin (sidebar + conteúdo)
  AdminSidebar.tsx      → menu lateral do admin, recolhível (ícones só; escolha salva em localStorage "osmo-admin-sidebar")
  ThemeToggle.tsx       → botão dark/light
  TopLoader.tsx         → barra de progresso de navegação
  PageTransition.tsx    → fade-in entre páginas (sem AnimatePresence, ver ADR 0007)
```

### Outros componentes compartilhados
```
src/components/
  ui/          → shadcn base (badge, button, card, dialog, dropdown-menu, input, separator, skeleton, sonner)
                 + LoadingButton (botão de ação primário/secundário com estado de loading)
                 + Modal (fundo, animação, clique fora, Escape e role=dialog; usado pelos 4 modais)
  auth/        → AuthShell (fundo, painéis, logo e rodapé das 3 telas de auth), AuthInput, AuthGoogleOption (divisor "o" + botão Google), useAuthTheme (paleta própria das telas de auth)
  brand/       → OsmoLogo, OrbitalDecor, GoogleIcon, SplashScreen
  providers/   → ThemeProvider, UserProvider, QueryProvider
  simulations/ → vazia (pendente)
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
  EstudiarBtn.tsx         → rótulo-botão "Estudiar" com hover na cor de acento da disciplina
  TopicSidebarNav.tsx     → sidebar do tópico (desktop): links de seção com destaque da seção ativa pelo scroll
  TopicBreadcrumb.tsx     → breadcrumb fixo da página do tópico
  TopicHeader.tsx         → título, bookmark, selo de status (Incompleta, En progreso, Completa), objetivos (id "objetivo" do tour)
  TopicSections.tsx       → seções numeradas (vídeo, artigo, atlas, quiz, tabelas); define os ids de âncora do tour
  ArtigoLidoTracker.tsx   → marca o artigo como lido quando o fim fica visível por 2 s
  StatusBadgeConDica.tsx  → selo de status com dica (hover/foco/toque) listando o que falta para completar
  VideoAssistidoTracker.tsx → soma o tempo reproduzido (YouTube/Vimeo/Bunny via postMessage) e marca o vídeo como assistido aos 80 %
  TopicPrevNext.tsx       → "Continúa tu aprendizaje": tópico anterior e seguinte (id "continua" do tour)
  TopicQuizSection.tsx    → cards de quiz do tópico + modal de configuração de sessão
  QuizPlayer.tsx          → orquestra a sessão (estado, timer, histórico, tentativas)
  QuizPlayerPlaying.tsx   → barra superior, instrução e slide de questões
  QuizPlayerOpcoes.tsx    → layouts por tipo de questão (múltipla, V/F, escolha de imagem)
  QuizPlayerFinished.tsx  → tela de resultado + confete
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
  CollapsibleCard.tsx       → card recolhível usado nos painéis
  QuizImagePicker.tsx       → seletor de imagem do quiz (upload + galeria unificada quiz/atlas)
  QuizLinker.tsx            → vincula/desvincula quizzes de um tópico
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
    QuizPanel.tsx           → builder do quiz (página /admin/quizzes/[id])
    QuestaoRow.tsx          → edição de uma questão
    OpcaoRow.tsx            → edição de uma opção
    quiz-types.ts           → tipos compartilhados do builder
    TopicoPanel.tsx         → painel completo de edição de tópico
```

### Editor
```
src/components/editor/
  ArtigoRenderer.tsx  → renderiza JSON Tiptap como HTML (área do aluno)
  MiniEditor.tsx      → editor Tiptap simplificado (admin)
```

---

### Hooks, utilitários e scripts
```
src/hooks/useIsMobile.ts        → viewport (padrão < 768px)
src/hooks/useImagePreload.ts    → pré-carrega uma lista de URLs de imagem
src/hooks/useStoredValue.ts     → useLocalStorageValue / useSessionStorageValue: valor persistido no navegador, sem setState em efeito (ADR 0013)
src/hooks/useIsClient.ts        → false no servidor/hidratação, true depois
src/lib/image-preload.ts        → preloadImage(src): carrega e decodifica
src/lib/progresso.ts           → PONTUACAO_APROVACAO, FRACAO_VIDEO_ASSISTIDO, partesDoTopico e calcularStatusTopico (regra pura do status do tópico)
src/lib/video/provedor.ts      → provedorDoVideo (youtube | vimeo | bunny | null): quais vídeos entram no progresso
src/lib/quiz-scoring.ts        → avaliarTentativa: pontuação a partir do gabarito (função pura)
src/lib/auth/session.ts         → getSessionUser: usuário da sessão, com cache por requisição
src/lib/safe-redirect.ts        → safeInternalPath(valor, fallback): valida destino de redirect
src/lib/utils.ts                → cn() (classes) e toggleInSet() (alterna item num Set sem mutar)
src/lib/video/thumbnail.ts      → resolveVideoThumbnail: miniatura de vídeo YouTube/Vimeo/Bunny (servidor)
src/lib/video/bunny.ts          → parseBunnyUrl, bunnyThumbnailUrl, fetchBunnyDuration (duração via API do Bunny ao salvar o vídeo)
src/lib/motion.ts               → tokens de animação (framer-motion)
src/lib/auth/admin.ts           → isAdminUser, getAdminUser, requireAdmin (autorização, ADR 0011)
src/middleware.ts               → exige login em rotas de aluno/admin (falha fechada); papel NÃO é checado aqui
scripts/check-file-sizes.mjs    → verifica limites de linhas do CLAUDE.md (catraca com file-size-baseline.json)
scripts/check-admin-actions.mjs → falha se uma server action de admin não começar com requireAdmin()
scripts/check-db-access.mjs     → falha se um arquivo fora de src/lib/ importar o Prisma (queries ficam em lib/db/)
scripts/check-colors.mjs        → falha se um arquivo ganhar literal hex (catraca com color-baseline.json)
scripts/check-module-map.mjs    → falha se um módulo não planejado de module-map.json citar arquivo que não existe
scripts/db-guard.mjs            → bloqueia `npm run db:migrate` se DATABASE_URL não for banco local (ADR 0012)
```
Comandos: `npm run check:size`, `npm run check:auth`, `npm run check:db`, `npm run check:colors`, `npm run check:docs`, `npm run typecheck`, `npm run lint` e `npm run check` (todos). O lint usa cache (`.eslintcache`): a primeira execução leva alguns minutos neste disco, as seguintes são rápidas.

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
  progresso.ts               → marcarArtigoLido, marcarVideoAssistido (ações do aluno)
  quiz-tentativas.ts         → registrarTentativaQuiz (ação do aluno: grava a tentativa; pontuação calculada no servidor)
  content-quizzes.ts         → quiz, questões, opções, vínculo com tópico
  content-quiz-imagens.ts    → upload de imagem do quiz e galeria unificada (quiz + atlas)
  content-modelos3d.ts       → Atlas 3D: modelo, autorizar e confirmar upload direto do GLB (URL assinada)
```

Todas as actions acima, exceto `auth`, `search` e `content-ultimo-topico`, começam com `await requireAdmin()`.

**Regra:** cada domínio novo → arquivo novo. Nunca misturar domínios.

---

## 7. Queries de Banco — Arquivos

```
src/lib/db/
  prisma.ts     → singleton Prisma Client
  cursos.ts     → listarCursos, getCursoPorSlug, getDisciplinaPorSlug,
                  getAreaPorSlug, getTopicoPorSlug (hierarquia completa)
  admin.ts      → queries admin (listagem, contagens, árvore completa)
  modelos3d.ts  → listarModelos3d, getModelo3dAdmin (Atlas 3D)
  quizzes.ts    → listarQuizzes, getQuizAdmin, getQuizzesDoTopico, getQuizParaSessao, listarImagensDisponiveis
  progresso.ts  → getProgressoTopico, registrarArtigoLido, registrarVideoAssistido, existeTopicoPublicado
  tentativas.ts → registrarTentativa, getResumoTentativas (última, melhor e total do aluno por quiz)
  users.ts      → sincronizarUsuario: mantém `users` alinhada com o Supabase Auth (usado por login e cadastro; não lança erro)
```

`pastas.ts` (Mi plan): listarPastasDoUsuario, criarPasta, atualizarPasta, excluirPasta, idsDasPastasComTopico, definirTopicoNaPasta, definirItemConcluido, listarItensDaPasta. `progresso.ts` também tem getStatusDosTopicos.

**Pendentes:** `simulacoes.ts`. `npm run check:db` falha se um arquivo fora de `src/lib/` importar o Prisma (hoje sem exceções).

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
| `BUNNY_STREAM_API_KEY` | Chave da biblioteca Bunny Stream (só servidor): lê a duração do vídeo ao salvar |
| `BUNNY_CDN_HOSTNAME` | Domínio de entrega da biblioteca Bunny (ex.: vz-xxxx.b-cdn.net): monta a URL da capa |

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
tentativas_quiz      → histórico de quizzes do aluno (pontuação calculada no servidor)
pastas               → pastas do aluno (pai_id, nivel 1..3, niveis_max 1..3 escolhido na raiz, nome, descricao); RLS ligado, sem acesso direto do cliente
itens_pasta          → referência pasta ↔ tópico + concluido (um tópico pode estar em várias pastas)
simulacoes           → biblioteca de simulações reutilizáveis (tipo, config JSON)
topico_simulacoes    → vinculo simulação ↔ tópico
quizzes              → quiz independente (titulo, capa_url, publicado)
topico_quizzes       → vínculo N:N tópico ↔ quiz
questoes             → questões de um quiz (tipo, enunciado, imagem_url, termo, explicacao)
opcoes               → opções de uma questão (texto, imagem_url, correta)
```

---

## Mi plan (ADR 0016)

- Rotas: `/plan-de-estudios` (pastas da raiz) e `/plan-de-estudios/[pasta]` (subpastas e tópicos salvos).
- Actions (`lib/actions/pastas.ts`, públicas do aluno): criarPastaAction, atualizarPastaAction, excluirPastaAction, salvarTopicoNaPastaAction, marcarItemConcluidoAction.
- Componentes em `components/student/pastas/`; o marcador do cabeçalho do tópico é `SalvarTopicoButton` (via `SalvarTopicoSlot` no `TopicHeader`). Editar e eliminar: botões na página da pasta e menu de três pontos sobre cada card (`PastaAcoes`, variantes `botoes` e `menu`); em pasta da raiz o formulário também muda a profundidade (`atualizarPasta` valida pela árvore). Na pasta do último nível da árvore (onde ficam os conteúdos) a página mostra `BuscadorTemasPasta`, que usa `buscarTopicosPaginado` (20 por página, com total; busca pelo radical das palavras em `lib/busca-topicos.ts`, então "anatomia" acha "anatómicos") e agrega o tema direto à pasta. Selo de status compartilhado: `student/StatusBadge.tsx`. `ConfirmModal` agora vive em `components/ui/`.

---

## Atlas 3D (ADR 0017)

- Admin: `/admin/modelos-3d` (lista) e `/admin/modelos-3d/[id]` (arquivo + pré-visualização + dados). O GLB sobe direto do navegador ao bucket `modelos-3d` com URL assinada (`Modelo3DUpload` → `autorizarUploadModelo3d` / `confirmarUploadModelo3d`).
- Visualizador: `student/ModeloViewer.tsx` (`<model-viewer>`, carrega a biblioteca só no cliente).
- Tabelas: `modelos_3d`, `pontos_modelo_3d`, `topico_modelos_3d`. Vínculo com o tópico: `Modelo3DLinker` no painel do tópico (admin). Aluno: seção "Explora en 3D" (`TopicAtlas3DSection`), alimentada por `getModelos3dDoTopico` numa consulta separada que falha em silêncio (se as tabelas não existem, a seção some e a página do tópico segue normal). Pontos: `PontosEditor` (admin: gira o modelo, clica na superfície para criar o ponto; depois arrasta o ponto para movê-lo, ajusta giro e zoom e pulsa «Guardar punto»: grava posição, normal e a câmera da tela, incluindo o campo de visão `fov`, e é exatamente o que o aluno vê ao clicar no ponto; título e texto por ponto; excluir) com actions em `content-modelos3d-pontos.ts`; `ModeloViewer` desenha os pontos numerados e move a câmera até o ponto escolhido (aluno e admin usam o mesmo componente). Regras de formato em `lib/pontos3d.ts`.

## Novedades (ADR 0018)

- Aluno: sino no header (`layout/header/NovedadesBell.tsx`, desktop na barra utilitária e celular ao lado do hambúrguer) e página `/novedades` (20 por vez, botão "Ver más" via `cargarMasNovedades` e `NovedadesLista`). Itens desenhados por `student/novedades/NovedadItem.tsx`. O layout do aluno carrega `getNovedadesDelAlumno` e, se as tabelas não existem, o sino fica vazio.
- Admin: `/admin/novedades` (formulário: tipo, etiqueta, título, resumo, tema; lista com excluir). Actions em `lib/actions/content-novedades.ts` (admin); `lib/actions/novedades.ts` → `marcarNovedadesVistasAction` (aluno).
- Regras puras (tipos, rótulos, âncora da seção, formato de data) em `lib/novedades.ts`; consultas em `lib/db/novedades.ts`.
- Tabelas: `novedades`, `novedades_vistas` (última abertura do sino por aluno).
