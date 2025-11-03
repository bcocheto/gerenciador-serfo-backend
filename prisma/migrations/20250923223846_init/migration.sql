-- CreateTable
CREATE TABLE "public"."voluntarios" (
    "id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT NOT NULL,
    "endereco" TEXT,
    "data_ingresso" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movimentacoes" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "centro_de_custo" TEXT,
    "favorecido_pagador" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_cpf_key" ON "public"."voluntarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_email_key" ON "public"."voluntarios"("email");
