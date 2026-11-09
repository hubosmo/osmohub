-- Atlas 3D: biblioteca de modelos GLB, pontos numerados e vínculo com tópicos (ADR 0017).

-- CreateTable
CREATE TABLE "modelos_3d" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "arquivo_path" TEXT,
    "tamanho_bytes" INTEGER,
    "licenca" TEXT,
    "creditos" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_3d_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos_modelo_3d" (
    "id" TEXT NOT NULL,
    "modelo_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "titulo" TEXT NOT NULL,
    "texto" TEXT,
    "posicao" TEXT NOT NULL,
    "normal" TEXT,
    "orbita" TEXT,
    "alvo" TEXT,

    CONSTRAINT "pontos_modelo_3d_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topico_modelos_3d" (
    "topico_id" TEXT NOT NULL,
    "modelo_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topico_modelos_3d_pkey" PRIMARY KEY ("topico_id","modelo_id")
);

-- CreateIndex
CREATE INDEX "pontos_modelo_3d_modelo_id_ordem_idx" ON "pontos_modelo_3d"("modelo_id", "ordem");

-- CreateIndex
CREATE INDEX "topico_modelos_3d_modelo_id_idx" ON "topico_modelos_3d"("modelo_id");

-- AddForeignKey
ALTER TABLE "pontos_modelo_3d" ADD CONSTRAINT "pontos_modelo_3d_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos_3d"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topico_modelos_3d" ADD CONSTRAINT "topico_modelos_3d_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topico_modelos_3d" ADD CONSTRAINT "topico_modelos_3d_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos_3d"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Só o servidor acessa estas tabelas: RLS ligado, sem políticas, e sem privilégios para as roles da API pública.
ALTER TABLE "modelos_3d" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pontos_modelo_3d" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "topico_modelos_3d" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "modelos_3d", "pontos_modelo_3d", "topico_modelos_3d" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "modelos_3d", "pontos_modelo_3d", "topico_modelos_3d" FROM authenticated;
  END IF;
END $$;
