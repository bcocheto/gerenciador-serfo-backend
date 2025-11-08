/*
  Warnings:

  - The values [ADMINISTRADOR] on the enum `cargo_voluntario` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ativa` on the `sedes` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `sedes` table. All the data in the column will be lost.
  - You are about to drop the column `responsavel` on the `sedes` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "cargo_voluntario_new" AS ENUM ('VOLUNTARIO', 'SECRETARIO', 'TESOUREIRO', 'PRESIDENTE');
ALTER TABLE "public"."voluntarios" ALTER COLUMN "cargo" DROP DEFAULT;
ALTER TABLE "voluntarios" ALTER COLUMN "cargo" TYPE "cargo_voluntario_new" USING ("cargo"::text::"cargo_voluntario_new");
ALTER TYPE "cargo_voluntario" RENAME TO "cargo_voluntario_old";
ALTER TYPE "cargo_voluntario_new" RENAME TO "cargo_voluntario";
DROP TYPE "public"."cargo_voluntario_old";
ALTER TABLE "voluntarios" ALTER COLUMN "cargo" SET DEFAULT 'VOLUNTARIO';
COMMIT;

-- DropIndex
DROP INDEX "public"."sedes_codigo_key";

-- AlterTable
ALTER TABLE "sedes" DROP COLUMN "ativa",
DROP COLUMN "codigo",
DROP COLUMN "responsavel",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;
