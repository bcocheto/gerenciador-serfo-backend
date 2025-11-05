-- CreateEnum
CREATE TYPE "status_contribuicao" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "forma_pagamento" AS ENUM ('PIX', 'BOLETO', 'TRANSFERENCIA', 'DINHEIRO', 'CARTAO');

-- CreateEnum
CREATE TYPE "tipo_movimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "status_nota_fiscal" AS ENUM ('EMITIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_template_email" AS ENUM ('COBRANCA', 'LEMBRETE', 'AGRADECIMENTO', 'BOAS_VINDAS');

-- CreateEnum
CREATE TYPE "status_email_envio" AS ENUM ('PENDENTE', 'ENVIADO', 'ERRO', 'AGENDADO');

-- CreateEnum
CREATE TYPE "tipo_configuracao" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" SERIAL NOT NULL,
    "nome_completo" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11),
    "telefone" VARCHAR(20),
    "email" VARCHAR(100) NOT NULL,
    "endereco" TEXT,
    "data_ingresso" TIMESTAMP(6) NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistidos" (
    "id" SERIAL NOT NULL,
    "nome_completo" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11),
    "telefone" VARCHAR(20),
    "email" VARCHAR(100) NOT NULL,
    "endereco" TEXT,
    "data_ingresso" TIMESTAMP(6) NOT NULL,
    "valor_mensal" DECIMAL(10,2) NOT NULL,
    "dia_vencimento" INTEGER NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "assistidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribuicoes" (
    "id" SERIAL NOT NULL,
    "voluntario_id" INTEGER,
    "assistido_id" INTEGER,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_vencimento" TIMESTAMP(6) NOT NULL,
    "data_pagamento" TIMESTAMP(6),
    "status" "status_contribuicao" NOT NULL DEFAULT 'PENDENTE',
    "forma_pagamento" "forma_pagamento",
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "contribuicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(6) NOT NULL,
    "descricao" VARCHAR(200) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "tipo_movimentacao" NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "conta" VARCHAR(50) NOT NULL,
    "centro_de_custo" VARCHAR(50),
    "favorecido_pagador" VARCHAR(100),
    "contribuicao_id" INTEGER,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "contribuicao_id" INTEGER NOT NULL,
    "data_emissao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "status_nota_fiscal" NOT NULL DEFAULT 'EMITIDA',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates_email" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "assunto" VARCHAR(200) NOT NULL,
    "corpo" TEXT NOT NULL,
    "tipo" "tipo_template_email" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "templates_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_email" (
    "id" SERIAL NOT NULL,
    "destinatario" VARCHAR(100) NOT NULL,
    "assunto" VARCHAR(200) NOT NULL,
    "corpo" TEXT NOT NULL,
    "template_id" INTEGER,
    "status" "status_email_envio" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "ultima_tentativa" TIMESTAMP(6),
    "erro_envio" TEXT,
    "agendar_para" TIMESTAMP(6),
    "enviado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "logs_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" SERIAL NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "tipo_configuracao" NOT NULL DEFAULT 'STRING',
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_cpf_key" ON "voluntarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_email_key" ON "voluntarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assistidos_cpf_key" ON "assistidos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "assistidos_email_key" ON "assistidos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "notas_fiscais_numero_key" ON "notas_fiscais"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "templates_email_nome_key" ON "templates_email"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");

-- AddForeignKey
ALTER TABLE "contribuicoes" ADD CONSTRAINT "contribuicoes_voluntario_id_fkey" FOREIGN KEY ("voluntario_id") REFERENCES "voluntarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribuicoes" ADD CONSTRAINT "contribuicoes_assistido_id_fkey" FOREIGN KEY ("assistido_id") REFERENCES "assistidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_contribuicao_id_fkey" FOREIGN KEY ("contribuicao_id") REFERENCES "contribuicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_contribuicao_id_fkey" FOREIGN KEY ("contribuicao_id") REFERENCES "contribuicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_email" ADD CONSTRAINT "logs_email_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates_email"("id") ON DELETE SET NULL ON UPDATE CASCADE;
