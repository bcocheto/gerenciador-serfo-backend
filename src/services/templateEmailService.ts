// src/services/templateEmailService.ts
import { prisma } from "../config/database.js";
import type {
  TemplateEmailCreate,
  TemplateEmailUpdate,
  PaginationParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";
import Handlebars from "handlebars";

export class TemplateEmailService {
  async create(data: TemplateEmailCreate) {
    try {
      // Verificar se já existe template com mesmo nome
      const templateExistente = await prisma.templateEmail.findUnique({
        where: { nome: data.nome },
      });

      if (templateExistente) {
        throw new AppError("Já existe um template com este nome", 400);
      }

      // Validar template Handlebars
      try {
        Handlebars.compile(data.corpo);
      } catch (error) {
        throw new AppError("Template HTML inválido", 400);
      }

      const template = await prisma.templateEmail.create({
        data: {
          nome: data.nome,
          assunto: data.assunto,
          corpo: data.corpo,
          tipo: data.tipo,
          ativo: true,
        },
      });

      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar template de email", 500);
    }
  }

  async findAll(params: PaginationParams & { tipo?: string; ativo?: boolean }) {
    try {
      const {
        page,
        limit,
        orderBy = "nome",
        orderDirection,
        tipo,
        ativo,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (tipo) where.tipo = tipo;
      if (ativo !== undefined) where.ativo = ativo;

      const [templates, total] = await Promise.all([
        prisma.templateEmail.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
        }),
        prisma.templateEmail.count({ where }),
      ]);

      return {
        data: templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar templates de email", 500);
    }
  }

  async findById(id: number) {
    try {
      const template = await prisma.templateEmail.findUnique({
        where: { id },
      });

      if (!template) {
        throw new AppError("Template de email não encontrado", 404);
      }

      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar template de email", 500);
    }
  }

  async findByNome(nome: string) {
    try {
      const template = await prisma.templateEmail.findUnique({
        where: { nome },
      });

      if (!template) {
        throw new AppError("Template de email não encontrado", 404);
      }

      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar template de email", 500);
    }
  }

  async findByTipo(tipo: string) {
    try {
      const templates = await prisma.templateEmail.findMany({
        where: {
          tipo,
          ativo: true,
        },
        orderBy: { nome: "asc" },
      });

      return templates;
    } catch (error) {
      throw new AppError("Erro ao buscar templates por tipo", 500);
    }
  }

  async update(id: number, data: TemplateEmailUpdate) {
    try {
      const existingTemplate = await prisma.templateEmail.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new AppError("Template de email não encontrado", 404);
      }

      // Se está alterando o nome, verificar duplicação
      if (data.nome && data.nome !== existingTemplate.nome) {
        const templateComMesmoNome = await prisma.templateEmail.findUnique({
          where: { nome: data.nome },
        });

        if (templateComMesmoNome) {
          throw new AppError("Já existe um template com este nome", 400);
        }
      }

      // Validar template Handlebars se corpo foi alterado
      if (data.corpo) {
        try {
          Handlebars.compile(data.corpo);
        } catch (error) {
          throw new AppError("Template HTML inválido", 400);
        }
      }

      const updateData: Record<string, any> = {};

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.assunto !== undefined) updateData.assunto = data.assunto;
      if (data.corpo !== undefined) updateData.corpo = data.corpo;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;

      const template = await prisma.templateEmail.update({
        where: { id },
        data: updateData,
      });

      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar template de email", 500);
    }
  }

  async delete(id: number) {
    try {
      const existingTemplate = await prisma.templateEmail.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new AppError("Template de email não encontrado", 404);
      }

      await prisma.templateEmail.delete({
        where: { id },
      });

      return { message: "Template de email excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir template de email", 500);
    }
  }

  async ativarDesativar(id: number, ativo: boolean) {
    try {
      const existingTemplate = await prisma.templateEmail.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new AppError("Template de email não encontrado", 404);
      }

      const template = await prisma.templateEmail.update({
        where: { id },
        data: { ativo },
      });

      return template;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao alterar status do template", 500);
    }
  }

  async renderTemplate(templateId: number, dados: Record<string, any>) {
    try {
      const template = await this.findById(templateId);

      if (!template.ativo) {
        throw new AppError("Template está inativo", 400);
      }

      // Compilar template do assunto
      const assuntoCompilado = Handlebars.compile(template.assunto);
      const assuntoFinal = assuntoCompilado(dados);

      // Compilar template do corpo
      const corpoCompilado = Handlebars.compile(template.corpo);
      const corpoFinal = corpoCompilado(dados);

      return {
        assunto: assuntoFinal,
        corpo: corpoFinal,
        template,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao renderizar template", 500);
    }
  }

  async duplicarTemplate(id: number, novoNome: string) {
    try {
      const templateOriginal = await this.findById(id);

      // Verificar se novo nome já existe
      const templateExistente = await prisma.templateEmail.findUnique({
        where: { nome: novoNome },
      });

      if (templateExistente) {
        throw new AppError("Já existe um template com este nome", 400);
      }

      const novoTemplate = await prisma.templateEmail.create({
        data: {
          nome: novoNome,
          assunto: templateOriginal.assunto,
          corpo: templateOriginal.corpo,
          tipo: templateOriginal.tipo,
          ativo: false, // Novo template inicia desativado
        },
      });

      return novoTemplate;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao duplicar template", 500);
    }
  }

  async getTemplatesPadrao(): Promise<TemplateEmailCreate[]> {
    try {
      return [
        {
          nome: "cobranca-mensal",
          assunto: "SERFO - Contribuição de {{mes}}/{{ano}}",
          corpo: `
            <h2>Olá, {{nomeCompleto}}!</h2>
            <p>Sua contribuição mensal de <strong>{{valor}}</strong> está disponível para pagamento.</p>
            <p><strong>Vencimento:</strong> {{dataVencimento}}</p>
            <p>Para efetuar o pagamento, utilize os dados abaixo:</p>
            <ul>
              <li><strong>PIX:</strong> {{pixChave}}</li>
              <li><strong>Banco:</strong> {{banco}}</li>
              <li><strong>Agência:</strong> {{agencia}}</li>
              <li><strong>Conta:</strong> {{conta}}</li>
            </ul>
            <p>Atenciosamente,<br>Equipe SERFO</p>
          `,
          tipo: "cobranca" as const,
        },
        {
          nome: "lembrete-vencimento",
          assunto: "SERFO - Lembrete: Contribuição vence em 3 dias",
          corpo: `
            <h2>Olá, {{nomeCompleto}}!</h2>
            <p>Este é um lembrete de que sua contribuição de <strong>{{valor}}</strong> vence em 3 dias.</p>
            <p><strong>Data de vencimento:</strong> {{dataVencimento}}</p>
            <p>Para evitar atrasos, efetue o pagamento o quanto antes.</p>
            <p>Atenciosamente,<br>Equipe SERFO</p>
          `,
          tipo: "lembrete" as const,
        },
        {
          nome: "agradecimento-pagamento",
          assunto: "SERFO - Pagamento recebido com sucesso!",
          corpo: `
            <h2>Olá, {{nomeCompleto}}!</h2>
            <p>Recebemos seu pagamento de <strong>{{valor}}</strong> em {{dataPagamento}}.</p>
            <p>Sua nota fiscal está em anexo.</p>
            <p>Agradecemos sua contribuição!</p>
            <p>Atenciosamente,<br>Equipe SERFO</p>
          `,
          tipo: "agradecimento" as const,
        },
      ];
    } catch (error) {
      throw new AppError("Erro ao obter templates padrão", 500);
    }
  }

  async criarTemplatesPadrao() {
    try {
      const templatesPadrao = await this.getTemplatesPadrao();
      const templatesCriados = [];

      for (const templatePadrao of templatesPadrao) {
        try {
          // Verificar se já existe
          const existente = await prisma.templateEmail.findUnique({
            where: { nome: templatePadrao.nome },
          });

          if (!existente) {
            const template = await this.create(templatePadrao);
            templatesCriados.push(template);
          }
        } catch (error) {
          console.warn(`Erro ao criar template ${templatePadrao.nome}:`, error);
        }
      }

      return {
        templatesCriados,
        message: `${templatesCriados.length} templates padrão criados com sucesso`,
      };
    } catch (error) {
      throw new AppError("Erro ao criar templates padrão", 500);
    }
  }
}
