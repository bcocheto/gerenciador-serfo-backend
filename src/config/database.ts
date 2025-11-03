// src/config/database.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Função para conectar ao banco
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados PostgreSQL");
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

// Função para desconectar do banco
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log("✅ Desconectado do banco de dados");
  } catch (error) {
    console.error("❌ Erro ao desconectar do banco de dados:", error);
  }
}
