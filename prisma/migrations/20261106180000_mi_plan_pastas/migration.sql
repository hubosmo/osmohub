-- Mi Plan: pastas pessoais do aluno (ADR 0016).
-- Substitui planos_estudos e itens_plano (vazias) por pastas e itens_pasta.

-- DropForeignKey
ALTER TABLE "itens_plano" DROP CONSTRAINT "itens_plano_plano_id_fkey";

-- DropForeignKey
ALTER TABLE "itens_plano" DROP CONSTRAINT "itens_plano_topico_id_fkey";

-- DropForeignKey
ALTER TABLE "planos_estudos" DROP CONSTRAINT "planos_estudos_usuario_id_fkey";

-- DropTable
DROP TABLE "itens_plano";

-- DropTable
DROP TABLE "planos_estudos";

-- CreateTable
CREATE TABLE "pastas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "pai_id" TEXT,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pastas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pasta" (
    "pasta_id" TEXT NOT NULL,
    "topico_id" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_pasta_pkey" PRIMARY KEY ("pasta_id","topico_id")
);

-- CreateIndex
CREATE INDEX "pastas_usuario_id_pai_id_idx" ON "pastas"("usuario_id", "pai_id");

-- CreateIndex
CREATE INDEX "itens_pasta_topico_id_idx" ON "itens_pasta"("topico_id");

-- AddForeignKey
ALTER TABLE "pastas" ADD CONSTRAINT "pastas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pastas" ADD CONSTRAINT "pastas_pai_id_fkey" FOREIGN KEY ("pai_id") REFERENCES "pastas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pasta" ADD CONSTRAINT "itens_pasta_pasta_id_fkey" FOREIGN KEY ("pasta_id") REFERENCES "pastas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pasta" ADD CONSTRAINT "itens_pasta_topico_id_fkey" FOREIGN KEY ("topico_id") REFERENCES "topicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Limite de 3 níveis também no banco (o servidor já valida; isto protege contra erro de código)
ALTER TABLE "pastas" ADD CONSTRAINT "pastas_nivel_check" CHECK ("nivel" BETWEEN 1 AND 3);

-- Só o servidor acessa estas tabelas: RLS ligado, sem políticas, e sem privilégios para as roles da API pública.
-- As roles anon e authenticated existem no Supabase mas não em um Postgres comum, por isso a checagem.
ALTER TABLE "pastas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "itens_pasta" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "pastas", "itens_pasta" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "pastas", "itens_pasta" FROM authenticated;
  END IF;
END $$;
