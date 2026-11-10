# Osmo — Schema do Banco de Dados

## ORM: Prisma + PostgreSQL (Supabase)

> **Fonte da verdade:** `prisma/schema.prisma`. Este documento é um resumo comentado; ao alterar o schema, atualizar aqui na mesma tarefa.
>
> **Migrations:** `prisma/migrations/` tem uma única migration, `20261105180000_baseline`, com o schema completo; reproduz o banco em um Postgres vazio (validado). O histórico anterior não reproduzia o banco e foi substituído ([ADR 0012](decisions/0012-historico-de-migrations-reiniciado.md)). Criar migrations só contra banco local (`npm run db:migrate` é bloqueado se `DATABASE_URL` for remoto) e aplicar no Supabase com `npm run db:deploy`. Nunca `db push` nem `migrate dev` no Supabase.

---

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USUÁRIOS ──────────────────────────────────────────

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  nome          String
  role          Role     @default(STUDENT)
  avatar_url    String?
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt

  progresso     ProgressoTopico[]
  tentativas    TentativaQuiz[]
  pastas        Pasta[]

  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
}

// ─── ESTRUTURA DE CONTEÚDO ─────────────────────────────

model Disciplina {
  id            String   @id @default(uuid())
  slug          String   @unique
  nome          String
  descricao     String?
  capa_url      String?
  icone         String?
  cor_destaque  String?
  ordem         Int      @default(0)
  publicado     Boolean  @default(false)
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt

  areas         Area[]
  simulacoes    Simulacao[]

  @@map("disciplinas")
}

model Area {
  id            String     @id @default(uuid())
  disciplina_id String
  slug          String
  nome          String
  descricao     String?
  ordem         Int        @default(0)
  publicado     Boolean    @default(false)
  criado_em     DateTime   @default(now())
  atualizado_em DateTime   @updatedAt

  disciplina    Disciplina @relation(fields: [disciplina_id], references: [id])
  topicos       Topico[]

  @@unique([disciplina_id, slug])
  @@map("areas")
}

model Topico {
  id                    String   @id @default(uuid())
  area_id               String
  slug                  String
  titulo                String
  descricao_curta       String?
  ordem                 Int      @default(0)
  publicado             Boolean  @default(false)
  duracao_estimada_min  Int?
  criado_em             DateTime @default(now())
  atualizado_em         DateTime @updatedAt

  area              Area              @relation(fields: [area_id], references: [id])
  video             Video?
  artigo            Artigo?
  quizzes           TopicoQuiz[]
  simulacoes        TopicoSimulacao[]
  progresso         ProgressoTopico[]
  itens_pasta       ItemPasta[]

  @@unique([area_id, slug])
  @@map("topicos")
}

// ─── CONTEÚDO ──────────────────────────────────────────

model Video {
  id               String   @id @default(uuid())
  topico_id        String   @unique
  titulo           String
  mux_asset_id     String?
  mux_playback_id  String?
  mux_status       String?  // preparing | ready | errored
  youtube_url      String?
  duracao_seg      Int?
  thumbnail_url    String?
  transcricao      String?
  criado_em        DateTime @default(now())
  atualizado_em    DateTime @updatedAt

  topico           Topico   @relation(fields: [topico_id], references: [id])

  @@map("videos")
}

model Artigo {
  id               String   @id @default(uuid())
  topico_id        String   @unique
  titulo           String
  content          Json     // formato Tiptap JSON
  tempo_leitura_min Int?
  criado_em        DateTime @default(now())
  atualizado_em    DateTime @updatedAt

  topico           Topico   @relation(fields: [topico_id], references: [id])

  @@map("artigos")
}

// ─── SIMULAÇÕES ────────────────────────────────────────

model Simulacao {
  id            String          @id @default(uuid())
  slug          String          @unique
  titulo        String
  descricao     String?
  tipo          TipoSimulacao
  config        Json?           // dados configurados por tipo
  html_url      String?         // apenas para tipo CUSTOM_HTML
  disciplina_id String?
  criado_em     DateTime        @default(now())
  atualizado_em DateTime        @updatedAt

  disciplina    Disciplina?     @relation(fields: [disciplina_id], references: [id])
  topicos       TopicoSimulacao[]

  @@map("simulacoes")
}

enum TipoSimulacao {
  DRAG_DROP
  FILL_BLANK
  MATCHING
  ORDERING
  LABEL_IMAGE
  CUSTOM_HTML
}

model TopicoSimulacao {
  topico_id     String
  simulacao_id  String
  ordem         Int    @default(0)

  topico        Topico    @relation(fields: [topico_id], references: [id])
  simulacao     Simulacao @relation(fields: [simulacao_id], references: [id])

  @@id([topico_id, simulacao_id])
  @@map("topico_simulacoes")
}

// ─── QUIZ ──────────────────────────────────────────────
// Quiz é uma entidade independente: vincula-se a N tópicos via TopicoQuiz.
// Campos `modo` e `tempo_limite_seg` existem mas ainda não são lidos pelo código
// (tempo e tentativas hoje vêm da tela de configuração, via query string).
// `TentativaQuiz` é gravada ao fim de cada sessão (ADR 0014).

model Quiz {
  id               String   @id @default(uuid())
  titulo           String
  descricao        String?
  capa_url         String?
  modo             ModoQuiz @default(PRATICA)
  tempo_limite_seg Int?
  publicado        Boolean  @default(false)   // só quizzes publicados aparecem ao aluno
  criado_em        DateTime @default(now())
  atualizado_em    DateTime @updatedAt

  topicos    TopicoQuiz[]
  questoes   Questao[]
  tentativas TentativaQuiz[]

  @@map("quizzes")
}

enum ModoQuiz {
  PRATICA
  SIMULADO
}

// junction N:N entre Topico e Quiz
model TopicoQuiz {
  topico_id String
  quiz_id   String
  ordem     Int    @default(0)

  topico Topico @relation(fields: [topico_id], references: [id], onDelete: Cascade)
  quiz   Quiz   @relation(fields: [quiz_id], references: [id], onDelete: Cascade)

  @@id([topico_id, quiz_id])
  @@map("topico_quizzes")
}

model Questao {
  id         String      @id @default(uuid())
  quiz_id    String
  enunciado  String      @db.Text
  imagem_url String?     // imagem de contexto do enunciado
  tipo       TipoQuestao @default(MULTIPLA_ESCOLHA)
  explicacao String?     @db.Text
  termo      String?     // termo coberto pela questão — gera "Lo que aprenderás" e filtro de sessão
  ordem      Int         @default(0)

  quiz   Quiz    @relation(fields: [quiz_id], references: [id], onDelete: Cascade)
  opcoes Opcao[]

  @@map("questoes")
}

enum TipoQuestao {
  MULTIPLA_ESCOLHA
  VERDADEIRO_FALSO
  ESCOLHA_IMAGEM
}

model Opcao {
  id         String  @id @default(uuid())
  questao_id String
  texto      String
  imagem_url String? // usado em ESCOLHA_IMAGEM
  correta    Boolean @default(false)
  ordem      Int     @default(0)

  questao Questao @relation(fields: [questao_id], references: [id], onDelete: Cascade)

  @@map("opcoes")
}

// ─── PROGRESSO ─────────────────────────────────────────

model ProgressoTopico {
  usuario_id              String
  topico_id               String
  video_assistido         Boolean  @default(false)
  artigo_lido             Boolean  @default(false)
  simulacoes_concluidas   String[] // array de simulacao IDs
  atualizado_em           DateTime @updatedAt

  usuario   User   @relation(fields: [usuario_id], references: [id])
  topico    Topico @relation(fields: [topico_id], references: [id])

  @@id([usuario_id, topico_id])
  @@map("progresso_topicos")
}

model TentativaQuiz {
  id              String   @id @default(uuid())
  usuario_id      String
  quiz_id         String
  pontuacao       Int      // 0-100
  respostas       Json     // { questao_id: opcao_id }
  tempo_gasto_seg Int?
  criado_em       DateTime @default(now())

  usuario  User @relation(fields: [usuario_id], references: [id])
  quiz     Quiz @relation(fields: [quiz_id], references: [id])

  @@map("tentativas_quiz")
}

// ─── MI PLAN (ADR 0016) ────────────────────────────────

model Pasta {
  id            String   @id @default(uuid())
  usuario_id    String
  pai_id        String?
  nivel         Int      @default(1)
  // Quantos níveis a árvore desta pasta admite (1 a 3). Escolhido na criação da pasta da raiz e herdado pelas subpastas.
  niveis_max    Int      @default(3)
  nome          String
  descricao     String?
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt

  usuario User        @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  pai     Pasta?      @relation("PastaHierarquia", fields: [pai_id], references: [id], onDelete: Cascade)
  filhas  Pasta[]     @relation("PastaHierarquia")
  itens   ItemPasta[]

  @@index([usuario_id, pai_id])
  @@map("pastas")
}

model ItemPasta {
  pasta_id  String
  topico_id String
  concluido Boolean  @default(false)
  criado_em DateTime @default(now())

  pasta  Pasta  @relation(fields: [pasta_id], references: [id], onDelete: Cascade)
  topico Topico @relation(fields: [topico_id], references: [id], onDelete: Cascade)

  @@id([pasta_id, topico_id])
  @@index([topico_id])
  @@map("itens_pasta")
}
```

---

## Índices Recomendados

```sql
-- Busca por slug (mais comum)
CREATE INDEX ON areas(disciplina_id, slug);
CREATE INDEX ON topicos(area_id, slug);

-- Progresso do aluno
CREATE INDEX ON progresso_topicos(usuario_id);

-- Ordenação de conteúdo
CREATE INDEX ON areas(disciplina_id, ordem);
CREATE INDEX ON topicos(area_id, ordem);
```

---

## Row Level Security (Supabase RLS)

```sql
-- Alunos leem apenas conteúdo publicado
ALTER TABLE topicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aluno lê topicos publicados" ON topicos
  FOR SELECT USING (publicado = true);

-- Aluno lê apenas seu próprio progresso
ALTER TABLE progresso_topicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aluno lê seu progresso" ON progresso_topicos
  FOR ALL USING (usuario_id = auth.uid());

-- Admin tem acesso total (via service role key nas API routes)
```

## Atlas 3D (ADR 0017)

```prisma
model Modelo3D {
  id            String   @id @default(uuid())
  titulo        String
  descricao     String?
  arquivo_path  String?  // caminho do GLB no bucket `modelos-3d`
  tamanho_bytes Int?
  licenca       String?
  creditos      String?
  publicado     Boolean  @default(false)
  criado_em     DateTime @default(now())
  atualizado_em DateTime @updatedAt
  pontos        PontoModelo3D[]
  topicos       TopicoModelo3D[]
  @@map("modelos_3d")
}

model PontoModelo3D {   // ponto numerado sobre o modelo (formato do model-viewer)
  id        String  @id @default(uuid())
  modelo_id String
  ordem     Int     @default(0)
  titulo    String
  texto     String?
  posicao   String  // "x y z"
  normal    String?
  orbita    String? // "theta phi raio"
  alvo      String? // "x y z"
  fov       Float?  // campo de visão da câmera em graus (zoom além do raio mínimo); nulo nos pontos antigos
  @@map("pontos_modelo_3d")
}

model TopicoModelo3D {  // N:N tópico ↔ modelo
  topico_id String
  modelo_id String
  ordem     Int @default(0)
  @@id([topico_id, modelo_id])
  @@map("topico_modelos_3d")
}
```
