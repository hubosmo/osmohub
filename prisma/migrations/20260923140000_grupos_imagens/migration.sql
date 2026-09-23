-- CreateTable
CREATE TABLE "grupos_imagens_topico" (
    "id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "titulo" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "grupos_imagens_topico_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "imagens_topico" ADD COLUMN "grupo_id" TEXT;

-- AddForeignKey
ALTER TABLE "grupos_imagens_topico" ADD CONSTRAINT "grupos_imagens_topico_topico_id_fkey"
    FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_topico" ADD CONSTRAINT "imagens_topico_grupo_id_fkey"
    FOREIGN KEY ("grupo_id") REFERENCES "grupos_imagens_topico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
