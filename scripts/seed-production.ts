// scripts/seed-production.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de produção...");

  // Configurações essenciais do sistema
  const configuracoes = [
    {
      chave: "sistema_nome",
      valor: "Gerenciador SERFO",
      descricao: "Nome do sistema",
      tipo: "string" as const,
    },
    {
      chave: "sistema_versao",
      valor: "1.0.0",
      descricao: "Versão atual do sistema",
      tipo: "string" as const,
    },
    {
      chave: "email_remetente_padrao",
      valor: "noreply@serfo.org",
      descricao: "Email remetente padrão para notificações",
      tipo: "string" as const,
    },
    {
      chave: "contribuicao_dia_vencimento_padrao",
      valor: "10",
      descricao: "Dia padrão de vencimento das contribuições",
      tipo: "number" as const,
    },
    {
      chave: "contribuicao_valor_minimo",
      valor: "10.00",
      descricao: "Valor mínimo de contribuição",
      tipo: "number" as const,
    },
    {
      chave: "notificacao_dias_antecedencia",
      valor: "3",
      descricao: "Dias de antecedência para notificar vencimentos",
      tipo: "number" as const,
    },
    {
      chave: "sistema_timezone",
      valor: "America/Sao_Paulo",
      descricao: "Timezone padrão do sistema",
      tipo: "string" as const,
    },
    {
      chave: "backup_retencao_dias",
      valor: "30",
      descricao: "Dias de retenção dos backups automáticos",
      tipo: "number" as const,
    },
  ];

  console.log("📋 Criando configurações do sistema...");
  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    });
  }

  // Templates de email essenciais
  const templates = [
    {
      nome: "Cobrança Padrão",
      assunto: "Lembrete: Contribuição SERFO - Vencimento {{dataVencimento}}",
      corpo: `Olá {{nomeCompleto}},

Este é um lembrete sobre sua contribuição mensal ao SERFO:

📅 Data de Vencimento: {{dataVencimento}}
💰 Valor: R$ {{valor}}

Para realizar o pagamento, entre em contato conosco.

Atenciosamente,
Equipe SERFO`,
      tipo: "cobranca" as const,
      ativo: true,
    },
    {
      nome: "Lembrete Vencimento",
      assunto:
        "Lembrete: Sua contribuição vence em {{diasParaVencimento}} dias",
      corpo: `Olá {{nomeCompleto}},

Sua contribuição mensal ao SERFO vencerá em {{diasParaVencimento}} dias.

📅 Data de Vencimento: {{dataVencimento}}
💰 Valor: R$ {{valor}}

Não se esqueça de realizar o pagamento.

Obrigado!`,
      tipo: "lembrete" as const,
      ativo: true,
    },
    {
      nome: "Agradecimento Pagamento",
      assunto: "Pagamento Confirmado - Obrigado!",
      corpo: `Olá {{nomeCompleto}},

Recebemos seu pagamento com sucesso!

💳 Valor Pago: R$ {{valor}}
📅 Data do Pagamento: {{dataPagamento}}

Agradecemos sua contribuição!

Equipe SERFO`,
      tipo: "agradecimento" as const,
      ativo: true,
    },
    {
      nome: "Boas-vindas",
      assunto: "Bem-vindo(a) ao SERFO!",
      corpo: `Olá {{nomeCompleto}},

Seja bem-vindo(a) ao SERFO!

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe SERFO`,
      tipo: "boas_vindas" as const,
      ativo: true,
    },
  ];

  console.log("📧 Criando templates de email...");
  for (const template of templates) {
    await prisma.templateEmail.upsert({
      where: { nome: template.nome },
      update: {},
      create: template,
    });
  }

  console.log("✅ Seed de produção concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed de produção:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
