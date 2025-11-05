/*
  Warnings:

  - The values [PIX,BOLETO,TRANSFERENCIA,DINHEIRO,CARTAO] on the enum `forma_pagamento` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDENTE,PAGO,ATRASADO,CANCELADO] on the enum `status_contribuicao` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDENTE,ENVIADO,ERRO,AGENDADO] on the enum `status_email_envio` will be removed. If these variants are still used in the database, this will fail.
  - The values [EMITIDA,CANCELADA] on the enum `status_nota_fiscal` will be removed. If these variants are still used in the database, this will fail.
  - The values [STRING,NUMBER,BOOLEAN,JSON] on the enum `tipo_configuracao` will be removed. If these variants are still used in the database, this will fail.
  - The values [ENTRADA,SAIDA] on the enum `tipo_movimentacao` will be removed. If these variants are still used in the database, this will fail.
  - The values [COBRANCA,LEMBRETE,AGRADECIMENTO,BOAS_VINDAS] on the enum `tipo_template_email` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "forma_pagamento_new" AS ENUM ('pix', 'boleto', 'transferencia', 'dinheiro', 'cartao');
ALTER TABLE "contribuicoes" ALTER COLUMN "forma_pagamento" TYPE "forma_pagamento_new" USING ("forma_pagamento"::text::"forma_pagamento_new");
ALTER TYPE "forma_pagamento" RENAME TO "forma_pagamento_old";
ALTER TYPE "forma_pagamento_new" RENAME TO "forma_pagamento";
DROP TYPE "public"."forma_pagamento_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "status_contribuicao_new" AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');
ALTER TABLE "public"."contribuicoes" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contribuicoes" ALTER COLUMN "status" TYPE "status_contribuicao_new" USING ("status"::text::"status_contribuicao_new");
ALTER TYPE "status_contribuicao" RENAME TO "status_contribuicao_old";
ALTER TYPE "status_contribuicao_new" RENAME TO "status_contribuicao";
DROP TYPE "public"."status_contribuicao_old";
ALTER TABLE "contribuicoes" ALTER COLUMN "status" SET DEFAULT 'pendente';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "status_email_envio_new" AS ENUM ('pendente', 'enviado', 'erro', 'agendado');
ALTER TABLE "public"."logs_email" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "logs_email" ALTER COLUMN "status" TYPE "status_email_envio_new" USING ("status"::text::"status_email_envio_new");
ALTER TYPE "status_email_envio" RENAME TO "status_email_envio_old";
ALTER TYPE "status_email_envio_new" RENAME TO "status_email_envio";
DROP TYPE "public"."status_email_envio_old";
ALTER TABLE "logs_email" ALTER COLUMN "status" SET DEFAULT 'pendente';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "status_nota_fiscal_new" AS ENUM ('emitida', 'cancelada');
ALTER TABLE "public"."notas_fiscais" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "notas_fiscais" ALTER COLUMN "status" TYPE "status_nota_fiscal_new" USING ("status"::text::"status_nota_fiscal_new");
ALTER TYPE "status_nota_fiscal" RENAME TO "status_nota_fiscal_old";
ALTER TYPE "status_nota_fiscal_new" RENAME TO "status_nota_fiscal";
DROP TYPE "public"."status_nota_fiscal_old";
ALTER TABLE "notas_fiscais" ALTER COLUMN "status" SET DEFAULT 'emitida';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "tipo_configuracao_new" AS ENUM ('string', 'number', 'boolean', 'json');
ALTER TABLE "public"."configuracoes" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "configuracoes" ALTER COLUMN "tipo" TYPE "tipo_configuracao_new" USING ("tipo"::text::"tipo_configuracao_new");
ALTER TYPE "tipo_configuracao" RENAME TO "tipo_configuracao_old";
ALTER TYPE "tipo_configuracao_new" RENAME TO "tipo_configuracao";
DROP TYPE "public"."tipo_configuracao_old";
ALTER TABLE "configuracoes" ALTER COLUMN "tipo" SET DEFAULT 'string';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "tipo_movimentacao_new" AS ENUM ('entrada', 'saida');
ALTER TABLE "movimentacoes" ALTER COLUMN "tipo" TYPE "tipo_movimentacao_new" USING ("tipo"::text::"tipo_movimentacao_new");
ALTER TYPE "tipo_movimentacao" RENAME TO "tipo_movimentacao_old";
ALTER TYPE "tipo_movimentacao_new" RENAME TO "tipo_movimentacao";
DROP TYPE "public"."tipo_movimentacao_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "tipo_template_email_new" AS ENUM ('cobranca', 'lembrete', 'agradecimento', 'boas_vindas');
ALTER TABLE "templates_email" ALTER COLUMN "tipo" TYPE "tipo_template_email_new" USING ("tipo"::text::"tipo_template_email_new");
ALTER TYPE "tipo_template_email" RENAME TO "tipo_template_email_old";
ALTER TYPE "tipo_template_email_new" RENAME TO "tipo_template_email";
DROP TYPE "public"."tipo_template_email_old";
COMMIT;

-- AlterTable
ALTER TABLE "assistidos" ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'ativo';

-- AlterTable
ALTER TABLE "configuracoes" ALTER COLUMN "tipo" SET DEFAULT 'string';

-- AlterTable
ALTER TABLE "contribuicoes" ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "logs_email" ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "notas_fiscais" ADD COLUMN     "arquivo" TEXT,
ALTER COLUMN "status" SET DEFAULT 'emitida';

-- AlterTable
ALTER TABLE "voluntarios" ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'ativo';
