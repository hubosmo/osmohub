-- Mi Plan: o aluno escolhe, ao criar a pasta da raiz, quantos níveis ela admite (1 a 3). ADR 0016.
-- A subpasta herda o valor da raiz. Pastas existentes ficam com 3 (o comportamento anterior).

ALTER TABLE "pastas" ADD COLUMN "niveis_max" INTEGER NOT NULL DEFAULT 3;

ALTER TABLE "pastas" ADD CONSTRAINT "pastas_niveis_max_check" CHECK ("niveis_max" BETWEEN 1 AND 3);
ALTER TABLE "pastas" ADD CONSTRAINT "pastas_nivel_dentro_do_limite_check" CHECK ("nivel" <= "niveis_max");
