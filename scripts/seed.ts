// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Criar configurações padrão do sistema
  console.log("📋 Criando configurações padrão...");

  await prisma.configuracao.upsert({
    where: { chave: "sistema_nome" },
    update: {},
    create: {
      chave: "sistema_nome",
      valor: "Gerenciador SERFO",
      descricao: "Nome do sistema",
      tipo: "string",
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "sistema_versao" },
    update: {},
    create: {
      chave: "sistema_versao",
      valor: "1.0.0",
      descricao: "Versão atual do sistema",
      tipo: "string",
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "email_remetente_padrao" },
    update: {},
    create: {
      chave: "email_remetente_padrao",
      valor: "noreply@serfo.org",
      descricao: "Email remetente padrão para notificações",
      tipo: "string",
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "contribuicao_dia_vencimento_padrao" },
    update: {},
    create: {
      chave: "contribuicao_dia_vencimento_padrao",
      valor: "10",
      descricao: "Dia padrão de vencimento das contribuições",
      tipo: "number",
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "contribuicao_valor_minimo" },
    update: {},
    create: {
      chave: "contribuicao_valor_minimo",
      valor: "10.00",
      descricao: "Valor mínimo de contribuição",
      tipo: "number",
    },
  });

  await prisma.configuracao.upsert({
    where: { chave: "notificacao_dias_antecedencia" },
    update: {},
    create: {
      chave: "notificacao_dias_antecedencia",
      valor: "3",
      descricao: "Dias de antecedência para notificar vencimentos",
      tipo: "number",
    },
  });

  // 2. Criar templates de email padrão
  console.log("📧 Criando templates de email padrão...");

  await prisma.templateEmail.upsert({
    where: { nome: "Cobrança Padrão" },
    update: {},
    create: {
      nome: "Cobrança Padrão",
      assunto: "Lembrete: Contribuição SERFO - Vencimento {{dataVencimento}}",
      corpo: `
Olá {{nomeCompleto}},

Esperamos que esteja bem!

Este é um lembrete amigável sobre sua contribuição mensal ao SERFO:

📅 Data de Vencimento: {{dataVencimento}}
💰 Valor: R$ {{valor}}
📄 Referência: {{referencia}}

Para realizar o pagamento, utilize uma das opções abaixo:
• PIX: [chave-pix]
• Transferência bancária: [dados-bancarios]
• Boleto: [link-boleto]

Sua contribuição é fundamental para continuarmos nosso trabalho social. 

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe SERFO
`,
      tipo: "cobranca",
      ativo: true,
    },
  });

  await prisma.templateEmail.upsert({
    where: { nome: "Lembrete Vencimento" },
    update: {},
    create: {
      nome: "Lembrete Vencimento",
      assunto:
        "Lembrete: Sua contribuição vence em {{diasParaVencimento}} dias",
      corpo: `
Olá {{nomeCompleto}},

Sua contribuição mensal ao SERFO vencerá em breve:

📅 Data de Vencimento: {{dataVencimento}}
💰 Valor: R$ {{valor}}
⏰ Vence em: {{diasParaVencimento}} dias

Não se esqueça de realizar o pagamento para manter sua contribuição em dia.

Obrigado pelo seu apoio!

Equipe SERFO
`,
      tipo: "lembrete",
      ativo: true,
    },
  });

  await prisma.templateEmail.upsert({
    where: { nome: "Agradecimento Pagamento" },
    update: {},
    create: {
      nome: "Agradecimento Pagamento",
      assunto: "Pagamento Confirmado - Obrigado! 🙏",
      corpo: `
Olá {{nomeCompleto}},

Recebemos seu pagamento com sucesso! 

💳 Valor Pago: R$ {{valor}}
📅 Data do Pagamento: {{dataPagamento}}
📄 Referência: {{referencia}}

Sua nota fiscal será enviada em breve.

Agradecemos imensamente por sua contribuição. Pessoas como você tornam nosso trabalho social possível!

Com gratidão,
Equipe SERFO
`,
      tipo: "agradecimento",
      ativo: true,
    },
  });

  await prisma.templateEmail.upsert({
    where: { nome: "Boas-vindas Voluntário" },
    update: {},
    create: {
      nome: "Boas-vindas Voluntário",
      assunto: "Bem-vindo(a) ao SERFO! 🎉",
      corpo: `
Olá {{nomeCompleto}},

Seja muito bem-vindo(a) à família SERFO! 

Estamos muito felizes em tê-lo(a) como voluntário(a). Sua dedicação e energia são fundamentais para nossa missão social.

📋 Próximos passos:
• Aguarde contato da coordenação para orientações
• Participe das reuniões mensais
• Acesse o sistema com suas credenciais

📞 Em caso de dúvidas:
• Email: coordenacao@serfo.org
• WhatsApp: (11) 99999-9999

Juntos, fazemos a diferença! 💪

Atenciosamente,
Equipe SERFO
`,
      tipo: "boas_vindas",
      ativo: true,
    },
  });

  await prisma.templateEmail.upsert({
    where: { nome: "Boas-vindas Assistido" },
    update: {},
    create: {
      nome: "Boas-vindas Assistido",
      assunto: "Bem-vindo(a) ao Programa SERFO! 🤝",
      corpo: `
Olá {{nomeCompleto}},

É com grande alegria que damos as boas-vindas ao Programa de Assistência SERFO!

📋 Informações importantes:
• Valor da contribuição mensal: R$ {{valorMensal}}
• Dia de vencimento: {{diaVencimento}} de cada mês
• Primeira contribuição: {{dataVencimento}}

📞 Contatos:
• Email: financeiro@serfo.org
• Telefone: (11) 3333-3333

Estamos aqui para apoiá-lo(a) em sua jornada. Conte conosco!

Atenciosamente,
Equipe SERFO
`,
      tipo: "boas_vindas",
      ativo: true,
    },
  });

  // 3. Criar dados de exemplo (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("👥 Criando dados de exemplo para desenvolvimento...");

    // Voluntário exemplo
    const voluntarioExemplo = await prisma.voluntario.upsert({
      where: { email: "admin@serfo.org" },
      update: {},
      create: {
        nomeCompleto: "Administrador SERFO",
        email: "admin@serfo.org",
        telefone: "(11) 99999-9999",
        endereco: "Rua das Flores, 123 - Centro, São Paulo - SP",
        dataIngresso: new Date("2023-01-01"),
        observacoes: "Administrador do sistema",
        ativo: true,
        status: "ativo",
      },
    });

    // Assistido exemplo
    const assistidoExemplo = await prisma.assistido.upsert({
      where: { email: "assistido@exemplo.com" },
      update: {},
      create: {
        nomeCompleto: "Maria Santos Silva",
        email: "assistido@exemplo.com",
        telefone: "(11) 88888-8888",
        endereco: "Rua da Esperança, 456 - Vila Esperança, São Paulo - SP",
        dataIngresso: new Date("2023-06-01"),
        valorMensal: 50.0,
        diaVencimento: 10,
        observacoes: "Assistida modelo para testes",
        ativo: true,
        status: "ativo",
      },
    });

    // Criar algumas contribuições de exemplo
    await prisma.contribuicao.create({
      data: {
        voluntarioId: voluntarioExemplo.id,
        valor: 100.0,
        dataVencimento: new Date("2024-01-10"),
        dataPagamento: new Date("2024-01-08"),
        status: "pago",
        formaPagamento: "pix",
        observacoes: "Contribuição janeiro 2024",
      },
    });

    await prisma.contribuicao.create({
      data: {
        assistidoId: assistidoExemplo.id,
        valor: 50.0,
        dataVencimento: new Date("2024-11-10"),
        status: "pendente",
        observacoes: "Contribuição novembro 2024",
      },
    });

    // Movimentação de exemplo
    await prisma.movimentacao.create({
      data: {
        data: new Date("2024-01-08"),
        descricao: "Contribuição recebida - Administrador SERFO",
        valor: 100.0,
        tipo: "entrada",
        categoria: "Contribuições",
        conta: "Conta Corrente Principal",
        favorecidoPagador: "Administrador SERFO",
        observacoes: "Primeira movimentação do sistema",
      },
    });

    console.log("✅ Dados de exemplo criados com sucesso!");
  }

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
