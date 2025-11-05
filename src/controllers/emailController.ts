// src/controllers/emailController.ts
import type { Request, Response } from "express";
import { EmailService } from "../services/emailService.js";
import { TemplateEmailService } from "../services/templateEmailService.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  enviarEmailSchema,
  emailLoteSchema,
  templateEmailCreateSchema,
  templateEmailUpdateSchema,
  paginationSchema,
} from "../config/validations.js";

export class EmailController {
  private emailService: EmailService;
  private templateService: TemplateEmailService;

  constructor() {
    this.emailService = new EmailService();
    this.templateService = new TemplateEmailService();
  }

  // Enviar email individual
  enviarEmail = async (req: Request, res: Response) => {
    try {
      const dadosValidados = enviarEmailSchema.parse(req.body);

      const resultado = await this.emailService.enviarEmail(dadosValidados);

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Email processado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro no envio de email:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Enviar emails em lote
  enviarEmailLote = async (req: Request, res: Response) => {
    try {
      const dadosValidados = emailLoteSchema.parse(req.body);

      const resultado = await this.emailService.enviarEmailLote(dadosValidados);

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Lote de emails processado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro no envio em lote:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Processar emails agendados
  processarEmailsAgendados = async (req: Request, res: Response) => {
    try {
      const resultado = await this.emailService.processarEmailsAgendados();

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Emails agendados processados com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao processar emails agendados:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Obter logs de email
  obterLogsEmail = async (req: Request, res: Response) => {
    try {
      res.status(501).json({
        sucesso: false,
        mensagem: "Funcionalidade de logs em desenvolvimento",
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Reenviar email
  reenviarEmail = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw new AppError("ID do log é obrigatório e deve ser um número", 400);
      }

      const resultado = await this.emailService.reenviarEmail(Number(id));

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Email reenviado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao reenviar email:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Testar conexão de email
  testarConexao = async (req: Request, res: Response) => {
    try {
      const resultado = await this.emailService.testarConexao();

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Teste de conexão realizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro no teste de conexão:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // TEMPLATES DE EMAIL

  // Criar template
  criarTemplate = async (req: Request, res: Response) => {
    try {
      const dadosValidados = templateEmailCreateSchema.parse(req.body);

      const template = await this.templateService.create(dadosValidados);

      res.status(201).json({
        sucesso: true,
        dados: template,
        mensagem: "Template criado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao criar template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Listar templates
  listarTemplates = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = paginationSchema.parse(req.query);
      const { tipo, ativo } = req.query;

      const params = {
        page: Number(page),
        limit: Number(limit),
        orderBy: "nome",
        orderDirection: "asc" as const,
        ...(tipo && { tipo: String(tipo) }),
        ...(ativo !== undefined && { ativo: ativo === "true" }),
      };

      const resultado = await this.templateService.findAll(params);

      res.status(200).json({
        sucesso: true,
        dados: resultado.data,
        paginacao: resultado.pagination,
        mensagem: "Templates listados com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao listar templates:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Obter template por ID
  obterTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      const template = await this.templateService.findById(Number(id));

      res.status(200).json({
        sucesso: true,
        dados: template,
        mensagem: "Template obtido com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao obter template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Atualizar template
  atualizarTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      const dadosValidados = templateEmailUpdateSchema.parse(req.body);

      const template = await this.templateService.update(
        Number(id),
        dadosValidados
      );

      res.status(200).json({
        sucesso: true,
        dados: template,
        mensagem: "Template atualizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao atualizar template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Deletar template
  deletarTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      await this.templateService.delete(Number(id));

      res.status(200).json({
        sucesso: true,
        mensagem: "Template deletado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao deletar template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Ativar/desativar template
  alterarStatusTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      if (typeof ativo !== "boolean") {
        throw new AppError("Status ativo deve ser um valor booleano", 400);
      }

      const template = await this.templateService.ativarDesativar(
        Number(id),
        ativo
      );

      res.status(200).json({
        sucesso: true,
        dados: template,
        mensagem: `Template ${ativo ? "ativado" : "desativado"} com sucesso`,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao alterar status do template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Duplicar template
  duplicarTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { novoNome } = req.body;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      if (!novoNome || typeof novoNome !== "string") {
        throw new AppError("Novo nome é obrigatório", 400);
      }

      const template = await this.templateService.duplicarTemplate(
        Number(id),
        novoNome
      );

      res.status(201).json({
        sucesso: true,
        dados: template,
        mensagem: "Template duplicado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao duplicar template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Renderizar template
  renderizarTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dados = req.body;

      if (!id || isNaN(Number(id))) {
        throw new AppError(
          "ID do template é obrigatório e deve ser um número",
          400
        );
      }

      const resultado = await this.templateService.renderTemplate(
        Number(id),
        dados
      );

      res.status(200).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Template renderizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao renderizar template:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Criar templates padrão
  criarTemplatesPadrao = async (req: Request, res: Response) => {
    try {
      const resultado = await this.templateService.criarTemplatesPadrao();

      res.status(201).json({
        sucesso: true,
        dados: resultado,
        mensagem: "Templates padrão criados com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao criar templates padrão:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };

  // Buscar templates por tipo
  buscarTemplatesPorTipo = async (req: Request, res: Response) => {
    try {
      const { tipo } = req.params;

      if (!tipo) {
        throw new AppError("Tipo é obrigatório", 400);
      }

      const templates = await this.templateService.findByTipo(tipo);

      res.status(200).json({
        sucesso: true,
        dados: templates,
        mensagem: "Templates obtidos com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          sucesso: false,
          mensagem: error.message,
        });
      }

      console.error("Erro ao buscar templates por tipo:", error);
      res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor",
      });
    }
  };
}

export const emailController = new EmailController();
