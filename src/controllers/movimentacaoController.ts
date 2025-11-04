// src/controllers/movimentacaoController.ts
import type { Request, Response } from "express";
import { MovimentacaoService } from "../services/movimentacaoService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const movimentacaoService = new MovimentacaoService();

export const createMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const movimentacao = await movimentacaoService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Movimentação criada com sucesso",
      data: movimentacao,
    });
  }
);

export const getMovimentacoes = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await movimentacaoService.findAll(req.query as any);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const getMovimentacaoById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const movimentacao = await movimentacaoService.findById(id);

    res.json({
      success: true,
      data: movimentacao,
    });
  }
);

export const updateMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const movimentacao = await movimentacaoService.update(id, req.body);

    res.json({
      success: true,
      message: "Movimentação atualizada com sucesso",
      data: movimentacao,
    });
  }
);

export const deleteMovimentacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await movimentacaoService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

export const getResumoFinanceiro = asyncHandler(
  async (req: Request, res: Response) => {
    const resumo = await movimentacaoService.getResumoFinanceiro(
      req.query as any
    );

    res.json({
      success: true,
      data: resumo,
    });
  }
);

export const getRelatorioPorCategoria = asyncHandler(
  async (req: Request, res: Response) => {
    const relatorio = await movimentacaoService.getRelatorioPorCategoria(
      req.query as any
    );

    res.json({
      success: true,
      data: relatorio,
      message: "Relatório por categoria gerado com sucesso",
    });
  }
);

export const getRelatorioPorConta = asyncHandler(
  async (req: Request, res: Response) => {
    const relatorio = await movimentacaoService.getRelatorioPorConta(
      req.query as any
    );

    res.json({
      success: true,
      data: relatorio,
      message: "Relatório por conta gerado com sucesso",
    });
  }
);

export const getCategorias = asyncHandler(
  async (req: Request, res: Response) => {
    const categorias = await movimentacaoService.getCategorias();

    res.json({
      success: true,
      data: categorias,
    });
  }
);

export const getContas = asyncHandler(async (req: Request, res: Response) => {
  const contas = await movimentacaoService.getContas();

  res.json({
    success: true,
    data: contas,
  });
});

export const getMovimentacaoStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await movimentacaoService.getStatistics(
      req.query as any
    );

    res.json({
      success: true,
      data: statistics,
    });
  }
);
