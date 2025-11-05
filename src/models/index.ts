// src/models/index.ts
// Re-exportação centralizada de todos os types e models

export * from "./types.js";

// Re-exportar types do Prisma Client para conveniência
export type {
  Voluntario as PrismaVoluntario,
  Assistido as PrismaAssistido,
  Contribuicao as PrismaContribuicao,
  Movimentacao as PrismaMovimentacao,
  NotaFiscal as PrismaNotaFiscal,
  TemplateEmail as PrismaTemplateEmail,
  LogEmail as PrismaLogEmail,
} from "@prisma/client";
