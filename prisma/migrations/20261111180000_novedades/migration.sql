-- CreateEnum
CREATE TYPE "NovedadTipo" AS ENUM ('VIDEO', 'ATLAS', 'ATLAS_3D', 'CUESTIONARIO', 'ARTICULO', 'TABLAS', 'TEMA');

-- CreateEnum
CREATE TYPE "NovedadEtiqueta" AS ENUM ('NUEVO', 'MEJORA');

-- CreateTable
CREATE TABLE "novedades" (
    "id" TEXT NOT NULL,
    "tipo" "NovedadTipo" NOT NULL,
    "etiqueta" "NovedadEtiqueta" NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumen" TEXT,
    "topico_id" TEXT,
    "publicado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novedades_vistas" (
    "usuario_id" TEXT NOT NULL,
    "visto_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novedades_vistas_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE INDEX "novedades_publicado_em_idx" ON "novedades"("publicado_em");

-- AddForeignKey
ALTER TABLE "novedades" ADD CONSTRAINT "novedades_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_vistas" ADD CONSTRAINT "novedades_vistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

