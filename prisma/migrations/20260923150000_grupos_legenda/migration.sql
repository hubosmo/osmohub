ALTER TABLE "grupos_imagens_topico" ADD COLUMN "legenda" TEXT;
ALTER TABLE "grupos_imagens_topico" ADD COLUMN "modo_legenda" TEXT NOT NULL DEFAULT 'individual';
