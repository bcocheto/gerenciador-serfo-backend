// scripts/reset-database.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpeza do banco de dados...");

  const tabelas = [
    "LogEmail",
    "TemplateEmail",
    "NotaFiscal",
    "Movimentacao",
    "Contribuicao",
    "Assistido",
    "Voluntario",
    "Configuracao",
  ];

  // Desabilitar verificações de chave estrangeira temporariamente
  await prisma.$executeRaw`SET foreign_key_checks = 0;`;

  try {
    for (const tabela of tabelas) {
      console.log(`🗑️  Limpando tabela ${tabela}...`);

      // Usar deleteMany ao invés de truncate para compatibilidade
      switch (tabela) {
        case "LogEmail":
          await prisma.logEmail.deleteMany();
          break;
        case "TemplateEmail":
          await prisma.templateEmail.deleteMany();
          break;
        case "NotaFiscal":
          await prisma.notaFiscal.deleteMany();
          break;
        case "Movimentacao":
          await prisma.movimentacao.deleteMany();
          break;
        case "Contribuicao":
          await prisma.contribuicao.deleteMany();
          break;
        case "Assistido":
          await prisma.assistido.deleteMany();
          break;
        case "Voluntario":
          await prisma.voluntario.deleteMany();
          break;
        case "Configuracao":
          await prisma.configuracao.deleteMany();
          break;
      }
    }
  } finally {
    // Reabilitar verificações de chave estrangeira
    await prisma.$executeRaw`SET foreign_key_checks = 1;`;
  }

  console.log("✅ Banco de dados limpo com sucesso!");
  console.log("🌱 Execute npm run db:seed para popular novamente");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a limpeza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
