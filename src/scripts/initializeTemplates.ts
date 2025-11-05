// src/scripts/initializeTemplates.ts
import { TemplateEmailService } from "../services/templateEmailService.js";
import { EMAIL_TEMPLATES } from "../config/email.js";

const templateService = new TemplateEmailService();

export async function initializeDefaultTemplates() {
  try {
    console.log("🔄 Inicializando templates padrão...");

    // Criar templates padrão a partir da configuração
    const templatesParaCriar = Object.values(EMAIL_TEMPLATES);

    let criados = 0;
    let existentes = 0;

    for (const templateConfig of templatesParaCriar) {
      try {
        // Verificar se já existe
        const existingTemplates = await templateService.findByTipo(
          templateConfig.tipo
        );
        const templateExistente = existingTemplates.find(
          (t) => t.nome === templateConfig.nome
        );

        if (!templateExistente) {
          await templateService.create({
            nome: templateConfig.nome,
            assunto: templateConfig.assunto,
            corpo: templateConfig.corpo,
            tipo: templateConfig.tipo as
              | "cobranca"
              | "lembrete"
              | "agradecimento"
              | "boas_vindas",
          });
          criados++;
          console.log(
            `✅ Template "${templateConfig.nome}" criado com sucesso`
          );
        } else {
          existentes++;
          console.log(`ℹ️  Template "${templateConfig.nome}" já existe`);
        }
      } catch (error) {
        console.error(
          `❌ Erro ao criar template "${templateConfig.nome}":`,
          error
        );
      }
    }

    console.log(
      `📧 Inicialização de templates concluída: ${criados} criados, ${existentes} já existiam`
    );

    return {
      criados,
      existentes,
      total: templatesParaCriar.length,
    };
  } catch (error) {
    console.error("❌ Erro na inicialização de templates:", error);
    throw error;
  }
}

// Função para executar a inicialização se o arquivo for executado diretamente
if (import.meta.url.endsWith("initializeTemplates.js")) {
  initializeDefaultTemplates()
    .then((result) => {
      console.log("🎉 Inicialização concluída:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha na inicialização:", error);
      process.exit(1);
    });
}
