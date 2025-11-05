// src/controllers/notaFiscalController.ts
import type { Request, Response } from "express";
import { NotaFiscalService } from "../services/notaFiscalService.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  notaFiscalCreateSchema,
  notaFiscalUpdateSchema,
  paginationSchema,
  dateRangeSchema,
} from "../config/validations.js";

const notaFiscalService = new NotaFiscalService();

export class NotaFiscalController {
  async create(req: Request, res: Response) {
    try {
      const data = notaFiscalCreateSchema.parse(req.body);
      const notaFiscal = await notaFiscalService.create(data);

      res.status(201).json({
        success: true,
        data: notaFiscal,
        message: "Nota fiscal criada com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const params = paginationSchema.parse(req.query);
      const filters = {
        ...params,
        ...(req.query.status && { status: req.query.status as string }),
        ...(req.query.numeroNota && {
          numeroNota: req.query.numeroNota as string,
        }),
        ...(req.query.contribuicaoId && {
          contribuicaoId: Number(req.query.contribuicaoId),
        }),
        ...(req.query.startDate && {
          startDate: req.query.startDate as string,
        }),
        ...(req.query.endDate && { endDate: req.query.endDate as string }),
      };

      const result = await notaFiscalService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const notaFiscal = await notaFiscalService.findById(id);

      res.json({
        success: true,
        data: notaFiscal,
      });
    } catch (error) {
      throw error;
    }
  }

  async findByNumero(req: Request, res: Response) {
    try {
      const { numero } = req.params;

      if (!numero) {
        throw new AppError("Número da nota fiscal é obrigatório", 400);
      }

      const notaFiscal = await notaFiscalService.findByNumero(numero);

      res.json({
        success: true,
        data: notaFiscal,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const data = notaFiscalUpdateSchema.parse(req.body);
      const notaFiscal = await notaFiscalService.update(id, data);

      res.json({
        success: true,
        data: notaFiscal,
        message: "Nota fiscal atualizada com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const { motivo } = req.body;
      const notaFiscal = await notaFiscalService.cancelar(id, motivo);

      res.json({
        success: true,
        data: notaFiscal,
        message: "Nota fiscal cancelada com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async gerarPDF(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const result = await notaFiscalService.gerarPDF(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async gerarNotasFiscaisEmLote(req: Request, res: Response) {
    try {
      const { contribuicaoIds } = req.body;

      if (!Array.isArray(contribuicaoIds) || contribuicaoIds.length === 0) {
        throw new AppError("Lista de IDs de contribuições é obrigatória", 400);
      }

      // Validar que todos os IDs são números
      const idsValidos = contribuicaoIds.every(
        (id) => typeof id === "number" && id > 0
      );
      if (!idsValidos) {
        throw new AppError("Todos os IDs devem ser números positivos", 400);
      }

      const result = await notaFiscalService.gerarNotasFiscaisEmLote(
        contribuicaoIds
      );

      res.json({
        success: true,
        data: result,
        message: `Processamento concluído: ${result.totalCriadas} notas criadas, ${result.totalErros} erros`,
      });
    } catch (error) {
      throw error;
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const statistics = await notaFiscalService.getStatistics(dateParams);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContribuicoesSemNota(req: Request, res: Response) {
    try {
      const contribuicoes = await notaFiscalService.getContribuicoesSemNota();

      res.json({
        success: true,
        data: contribuicoes,
        total: contribuicoes.length,
      });
    } catch (error) {
      throw error;
    }
  }

  async downloadPDF(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const notaFiscal = await notaFiscalService.findById(id);

      if (!notaFiscal.arquivo) {
        throw new AppError("PDF não foi gerado para esta nota fiscal", 400);
      }

      if (notaFiscal.status === "cancelada") {
        throw new AppError(
          "Não é possível baixar PDF de nota fiscal cancelada",
          400
        );
      }

      // Aqui seria a lógica para servir o arquivo
      // Por enquanto, retornamos apenas o caminho
      res.json({
        success: true,
        data: {
          numero: notaFiscal.numero,
          arquivo: notaFiscal.arquivo,
          dataEmissao: notaFiscal.dataEmissao,
        },
        message: "Use o caminho do arquivo para download",
      });
    } catch (error) {
      throw error;
    }
  }

  async reenviarPorEmail(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const notaFiscal = await notaFiscalService.findById(id);

      if (notaFiscal.status === "cancelada") {
        throw new AppError("Não é possível enviar nota fiscal cancelada", 400);
      }

      const pessoa =
        notaFiscal.contribuicao.voluntario || notaFiscal.contribuicao.assistido;

      if (!pessoa?.email) {
        throw new AppError("Email do destinatário não encontrado", 400);
      }

      // Aqui seria a lógica para envio do email
      // Por enquanto, apenas simulamos
      res.json({
        success: true,
        data: {
          numero: notaFiscal.numero,
          destinatario: pessoa.email,
          dataEnvio: new Date().toISOString(),
        },
        message: "Nota fiscal reenviada por email com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioMensal(req: Request, res: Response) {
    try {
      const { ano, mes } = req.query;

      if (!ano || !mes) {
        throw new AppError("Ano e mês são obrigatórios", 400);
      }

      const anoNum = Number(ano);
      const mesNum = Number(mes);

      if (anoNum < 2020 || anoNum > 2030 || mesNum < 1 || mesNum > 12) {
        throw new AppError("Ano ou mês inválidos", 400);
      }

      const inicioMes = new Date(anoNum, mesNum - 1, 1);
      const fimMes = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);

      const [statistics, notas] = await Promise.all([
        notaFiscalService.getStatistics({
          startDate: inicioMes.toISOString(),
          endDate: fimMes.toISOString(),
        }),
        notaFiscalService.findAll({
          page: 1,
          limit: 100,
          startDate: inicioMes.toISOString(),
          endDate: fimMes.toISOString(),
          orderBy: "dataEmissao",
          orderDirection: "desc",
        }),
      ]);

      res.json({
        success: true,
        data: {
          periodo: {
            ano: anoNum,
            mes: mesNum,
            nomeMes: inicioMes.toLocaleDateString("pt-BR", { month: "long" }),
          },
          statistics,
          notas: notas.data,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const notaFiscalController = new NotaFiscalController();
