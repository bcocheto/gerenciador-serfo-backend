/*
  Warnings:

  - Added the required column `sede_id` to the `assistidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sede_id` to the `voluntarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "cargo_voluntario" AS ENUM ('VOLUNTARIO', 'SECRETARIO', 'TESOUREIRO', 'PRESIDENTE', 'ADMINISTRADOR');

-- CreateTable
CREATE TABLE "sedes" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "endereco" TEXT,
    "telefone" VARCHAR(20),
    "email" VARCHAR(100),
    "responsavel" VARCHAR(100),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sedes_codigo_key" ON "sedes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_nome_key" ON "sedes"("nome");

-- Insert default sede for existing data
INSERT INTO "sedes" ("codigo", "nome", "endereco", "telefone", "email", "responsavel", "ativa", "criado_em", "atualizado_em") 
VALUES ('MATRIZ', 'Sede Matriz', 'Endereço da Matriz', '(11) 99999-9999', 'matriz@serfo.org', 'Administrador', true, NOW(), NOW());

-- AlterTable - Add columns with temporary nullable constraint
ALTER TABLE "assistidos" ADD COLUMN "sede_id" INTEGER;
ALTER TABLE "voluntarios" ADD COLUMN "cargo" "cargo_voluntario" DEFAULT 'VOLUNTARIO';
ALTER TABLE "voluntarios" ADD COLUMN "sede_id" INTEGER;

-- Update existing records with default sede
UPDATE "assistidos" SET "sede_id" = (SELECT "id" FROM "sedes" WHERE "codigo" = 'MATRIZ');
UPDATE "voluntarios" SET "sede_id" = (SELECT "id" FROM "sedes" WHERE "codigo" = 'MATRIZ');

-- Make columns NOT NULL after updating existing data
ALTER TABLE "assistidos" ALTER COLUMN "sede_id" SET NOT NULL;
ALTER TABLE "voluntarios" ALTER COLUMN "cargo" SET NOT NULL;
ALTER TABLE "voluntarios" ALTER COLUMN "sede_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "voluntarios" ADD CONSTRAINT "voluntarios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistidos" ADD CONSTRAINT "assistidos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
