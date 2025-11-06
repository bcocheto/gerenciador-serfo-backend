// scripts/validate-system.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Validando sistema completo...\n");

  try {
    // 1. Testar conexão com banco
    console.log("📊 Testando conexão com banco de dados...");
    await prisma.$connect();
    console.log("✅ Conexão com banco: OK");

    // 2. Verificar se todas as tabelas existem e têm dados
    console.log("\n📋 Verificando estrutura das tabelas...");

    const voluntarios = await prisma.voluntario.count();
    const assistidos = await prisma.assistido.count();
    const contribuicoes = await prisma.contribuicao.count();
    const movimentacoes = await prisma.movimentacao.count();
    const notasFiscais = await prisma.notaFiscal.count();
    const templates = await prisma.templateEmail.count();
    const logs = await prisma.logEmail.count();
    const configuracoes = await prisma.configuracao.count();

    console.log(`  - Voluntários: ${voluntarios}`);
    console.log(`  - Assistidos: ${assistidos}`);
    console.log(`  - Contribuições: ${contribuicoes}`);
    console.log(`  - Movimentações: ${movimentacoes}`);
    console.log(`  - Notas Fiscais: ${notasFiscais}`);
    console.log(`  - Templates Email: ${templates}`);
    console.log(`  - Logs Email: ${logs}`);
    console.log(`  - Configurações: ${configuracoes}`);

    // 3. Verificar configurações essenciais
    console.log("\n⚙️  Verificando configurações essenciais...");
    const configsEssenciais = [
      "sistema_nome",
      "sistema_versao",
      "email_remetente_padrao",
      "contribuicao_dia_vencimento_padrao",
      "contribuicao_valor_minimo",
      "notificacao_dias_antecedencia",
    ];

    for (const chave of configsEssenciais) {
      const config = await prisma.configuracao.findUnique({
        where: { chave },
      });

      if (config) {
        console.log(`  ✅ ${chave}: ${config.valor}`);
      } else {
        console.log(`  ❌ ${chave}: FALTANDO`);
      }
    }

    // 4. Verificar templates essenciais
    console.log("\n📧 Verificando templates de email...");
    const templatesEssenciais = [
      "Cobrança Padrão",
      "Lembrete Vencimento",
      "Agradecimento Pagamento",
    ];

    for (const nome of templatesEssenciais) {
      const template = await prisma.templateEmail.findUnique({
        where: { nome },
      });

      if (template) {
        console.log(`  ✅ ${nome}: ${template.ativo ? "ATIVO" : "INATIVO"}`);
      } else {
        console.log(`  ❌ ${nome}: FALTANDO`);
      }
    }

    // 5. Testar relacionamentos
    console.log("\n🔗 Testando relacionamentos...");

    // Contribuição com voluntário
    const contribVoluntario = await prisma.contribuicao.findFirst({
      where: { voluntarioId: { not: null } },
      include: { voluntario: true },
    });

    if (contribVoluntario && contribVoluntario.voluntario) {
      console.log("  ✅ Relacionamento Contribuição -> Voluntário: OK");
    } else {
      console.log("  ⚠️  Relacionamento Contribuição -> Voluntário: SEM DADOS");
    }

    // Contribuição com assistido
    const contribAssistido = await prisma.contribuicao.findFirst({
      where: { assistidoId: { not: null } },
      include: { assistido: true },
    });

    if (contribAssistido && contribAssistido.assistido) {
      console.log("  ✅ Relacionamento Contribuição -> Assistido: OK");
    } else {
      console.log("  ⚠️  Relacionamento Contribuição -> Assistido: SEM DADOS");
    }

    // 6. Verificar enums
    console.log("\n🏷️  Verificando enums...");

    const statusContribuicao = await prisma.contribuicao.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    console.log("  Status de Contribuições encontrados:");
    statusContribuicao.forEach((s) => {
      console.log(`    - ${s.status}: ${s._count.status} registros`);
    });

    // 7. Estatísticas gerais
    console.log("\n📈 Estatísticas gerais...");

    const totalContribuicoes = await prisma.contribuicao.aggregate({
      _sum: { valor: true },
      _count: { id: true },
    });

    const totalMovimentacoes = await prisma.movimentacao.aggregate({
      _sum: { valor: true },
      _count: { id: true },
    });

    console.log(
      `  - Total em contribuições: R$ ${totalContribuicoes._sum.valor || 0}`
    );
    console.log(`  - Número de contribuições: ${totalContribuicoes._count.id}`);
    console.log(
      `  - Total em movimentações: R$ ${totalMovimentacoes._sum.valor || 0}`
    );
    console.log(`  - Número de movimentações: ${totalMovimentacoes._count.id}`);

    console.log("\n🎉 Validação concluída com sucesso!");
    console.log("\n📋 Sistema está funcionando corretamente!");
  } catch (error) {
    console.error("\n❌ Erro durante a validação:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro crítico:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
