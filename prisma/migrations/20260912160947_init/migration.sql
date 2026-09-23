-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoSimulacao" AS ENUM ('DRAG_DROP', 'FILL_BLANK', 'MATCHING', 'ORDERING', 'LABEL_IMAGE', 'CUSTOM_HTML');

-- CreateEnum
CREATE TYPE "ModoQuiz" AS ENUM ('PRATICA', 'SIMULADO');

-- CreateEnum
CREATE TYPE "TipoQuestao" AS ENUM ('MULTIPLA_ESCOLHA', 'VERDADEIRO_FALSO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "avatar_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "capa_url" TEXT,
    "icone" TEXT,
    "cor_destaque" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "disciplina_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topicos" (
    "id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao_curta" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "duracao_estimada_min" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mux_asset_id" TEXT,
    "mux_playback_id" TEXT,
    "mux_status" TEXT,
    "youtube_url" TEXT,
    "duracao_seg" INTEGER,
    "thumbnail_url" TEXT,
    "transcricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos" (
    "id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "tempo_leitura_min" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artigos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulacoes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoSimulacao" NOT NULL,
    "config" JSONB,
    "html_url" TEXT,
    "disciplina_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topico_simulacoes" (
    "topico_id" TEXT NOT NULL,
    "simulacao_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topico_simulacoes_pkey" PRIMARY KEY ("topico_id","simulacao_id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "topico_id" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "modo" "ModoQuiz" NOT NULL DEFAULT 'PRATICA',
    "tempo_limite_seg" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "enunciado" JSONB NOT NULL,
    "tipo" "TipoQuestao" NOT NULL DEFAULT 'MULTIPLA_ESCOLHA',
    "explicacao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcoes" (
    "id" TEXT NOT NULL,
    "questao_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "opcoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresso_topicos" (
    "usuario_id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "video_assistido" BOOLEAN NOT NULL DEFAULT false,
    "artigo_lido" BOOLEAN NOT NULL DEFAULT false,
    "simulacoes_concluidas" TEXT[],
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progresso_topicos_pkey" PRIMARY KEY ("usuario_id","topico_id")
);

-- CreateTable
CREATE TABLE "tentativas_quiz" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "respostas" JSONB NOT NULL,
    "tempo_gasto_seg" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tentativas_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_estudos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planos_estudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_plano" (
    "id" TEXT NOT NULL,
    "plano_id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "data_prevista" TIMESTAMP(3),

    CONSTRAINT "itens_plano_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "disciplinas_slug_key" ON "disciplinas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "areas_disciplina_id_slug_key" ON "areas"("disciplina_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "topicos_area_id_slug_key" ON "topicos"("area_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "videos_topico_id_key" ON "videos"("topico_id");

-- CreateIndex
CREATE UNIQUE INDEX "artigos_topico_id_key" ON "artigos"("topico_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulacoes_slug_key" ON "simulacoes"("slug");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topicos" ADD CONSTRAINT "topicos_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulacoes" ADD CONSTRAINT "simulacoes_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topico_simulacoes" ADD CONSTRAINT "topico_simulacoes_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topico_simulacoes" ADD CONSTRAINT "topico_simulacoes_simulacao_id_fkey" FOREIGN KEY ("simulacao_id") REFERENCES "simulacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcoes" ADD CONSTRAINT "opcoes_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_topicos" ADD CONSTRAINT "progresso_topicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_topicos" ADD CONSTRAINT "progresso_topicos_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas_quiz" ADD CONSTRAINT "tentativas_quiz_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentativas_quiz" ADD CONSTRAINT "tentativas_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_estudos" ADD CONSTRAINT "planos_estudos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_plano" ADD CONSTRAINT "itens_plano_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos_estudos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_plano" ADD CONSTRAINT "itens_plano_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
