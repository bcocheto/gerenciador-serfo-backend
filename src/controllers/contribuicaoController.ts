// src/controllers/contribuicaoController.ts
import type { Request, Response } from "express";
import { ContribuicaoService } from "../services/contribuicaoService.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  contribuicaoCreateSchema,
  contribuicaoUpdateSchema,
  paginationSchema,
  dateRangeSchema,
} from "../config/validations.js";

const contribuicaoService = new ContribuicaoService();

export class ContribuicaoController {
  async create(req: Request, res: Response) {
    try {
      const data = contribuicaoCreateSchema.parse(req.body);
      const contribuicao = await contribuicaoService.create(data);

      res.status(201).json({
        success: true,
        data: contribuicao,
        message: "Contribuição criada com sucesso",
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
        ...(req.query.voluntarioId && {
          voluntarioId: Number(req.query.voluntarioId),
        }),
        ...(req.query.assistidoId && {
          assistidoId: Number(req.query.assistidoId),
        }),
        ...(req.query.search && { search: req.query.search as string }),
        ...(req.query.valorMin && { valorMin: Number(req.query.valorMin) }),
        ...(req.query.valorMax && { valorMax: Number(req.query.valorMax) }),
        ...(req.query.startDate && {
          startDate: req.query.startDate as string,
        }),
        ...(req.query.endDate && { endDate: req.query.endDate as string }),
      };

      const result = await contribuicaoService.findAll(filters);

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

      const contribuicao = await contribuicaoService.findById(id);

      res.json({
        success: true,
        data: contribuicao,
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

      const data = contribuicaoUpdateSchema.parse(req.body);
      const contribuicao = await contribuicaoService.update(id, data);

      res.json({
        success: true,
        data: contribuicao,
        message: "Contribuição atualizada com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const result = await contribuicaoService.delete(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      throw error;
    }
  }

  async processarPagamento(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("ID inválido", 400);
      }

      const {
        dataPagamento,
        formaPagamento,
        comprovante,
        observacoes,
        criarMovimentacao,
      } = req.body;

      if (!dataPagamento || !formaPagamento) {
        throw new AppError(
          "Data de pagamento e forma de pagamento são obrigatórios",
          400
        );
      }

      const contribuicao = await contribuicaoService.processarPagamento(id, {
        dataPagamento,
        formaPagamento,
        comprovante,
        observacoes,
        criarMovimentacao,
      });

      res.json({
        success: true,
        data: contribuicao,
        message: "Pagamento processado com sucesso",
      });
    } catch (error) {
      throw error;
    }
  }

  async gerarContribuicoesMensais(req: Request, res: Response) {
    try {
      const { ano, mes } = req.body;

      if (!ano || !mes) {
        throw new AppError("Ano e mês são obrigatórios", 400);
      }

      const result = await contribuicaoService.gerarContribuicoesMensais(
        Number(ano),
        Number(mes)
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContribuicoesPendentes(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const contribuicoes = await contribuicaoService.getContribuicoesPendentes(
        dateParams
      );

      res.json({
        success: true,
        data: contribuicoes,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContribuicoesAtrasadas(req: Request, res: Response) {
    try {
      const contribuicoes =
        await contribuicaoService.getContribuicoesAtrasadas();

      res.json({
        success: true,
        data: contribuicoes,
      });
    } catch (error) {
      throw error;
    }
  }

  async marcarContribuicoesAtrasadas(req: Request, res: Response) {
    try {
      const result = await contribuicaoService.marcarContribuicoesAtrasadas();

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContribuicoesMes(req: Request, res: Response) {
    try {
      const { ano, mes } = req.query;

      if (!ano || !mes) {
        throw new AppError("Ano e mês são obrigatórios", 400);
      }

      const contribuicoes = await contribuicaoService.getContribuicoesMes(
        Number(ano),
        Number(mes)
      );

      res.json({
        success: true,
        data: contribuicoes,
      });
    } catch (error) {
      throw error;
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const statistics = await contribuicaoService.getStatistics(dateParams);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioInadimplencia(req: Request, res: Response) {
    try {
      const relatorio = await contribuicaoService.getRelatorioInadimplencia();

      res.json({
        success: true,
        data: relatorio,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const contribuicaoController = new ContribuicaoController();
