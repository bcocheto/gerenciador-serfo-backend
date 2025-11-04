import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔍 Testando conexão com banco de dados...");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com banco de dados estabelecida!");

    // Verificar tabelas existentes
    const voluntarios = await prisma.voluntario.count();
    const assistidos = await prisma.assistido.count();
    const movimentacoes = await prisma.movimentacao.count();

    console.log("\n📊 Estatísticas do banco:");
    console.log(`  - Voluntários: ${voluntarios}`);
    console.log(`  - Assistidos: ${assistidos}`);
    console.log(`  - Movimentações: ${movimentacoes}`);

    // Testar inserção de dados de exemplo (opcional)
    if (voluntarios === 0) {
      console.log("\n🌱 Criando dados de exemplo...");

      const voluntario = await prisma.voluntario.create({
        data: {
          nomeCompleto: "João da Silva",
          cpf: "12345678901",
          telefone: "(11) 99999-9999",
          email: "joao.teste@serfo.org",
          endereco: "Rua Teste, 123, Centro, São Paulo - SP",
          dataIngresso: new Date(),
          observacoes: "Voluntário de teste criado automaticamente",
        },
      });

      const assistido = await prisma.assistido.create({
        data: {
          nomeCompleto: "Maria Santos",
          cpf: "98765432109",
          telefone: "(11) 88888-8888",
          email: "maria.teste@email.com",
          endereco: "Av. Exemplo, 456, Vila Nova, São Paulo - SP",
          dataIngresso: new Date(),
          valorMensal: 50.0,
          diaVencimento: 15,
          observacoes: "Assistido de teste criado automaticamente",
        },
      });

      console.log(
        `✅ Voluntário criado: ${voluntario.nomeCompleto} (ID: ${voluntario.id})`
      );
      console.log(
        `✅ Assistido criado: ${assistido.nomeCompleto} (ID: ${assistido.id})`
      );
    }

    console.log("\n🎉 Teste do banco concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao testar banco de dados:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
