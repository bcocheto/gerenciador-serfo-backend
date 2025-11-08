// src/controllers/assistidoController.ts
import type { Request, Response } from "express";
import { AssistidoService } from "../services/assistidoService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const assistidoService = new AssistidoService();

export const createAssistido = asyncHandler(
  async (req: Request, res: Response) => {
    const assistido = await assistidoService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Assistido criado com sucesso",
      data: assistido,
    });
  }
);

export const getAssistidos = asyncHandler(
  async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await assistidoService.findAll(query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const getAssistidoById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const assistido = await assistidoService.findById(id);

    res.json({
      success: true,
      data: assistido,
    });
  }
);

export const updateAssistido = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const assistido = await assistidoService.update(id, req.body);

    res.json({
      success: true,
      message: "Assistido atualizado com sucesso",
      data: assistido,
    });
  }
);

export const deleteAssistido = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await assistidoService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

export const updateAssistidoStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const { status } = req.body;
    const assistido = await assistidoService.updateStatus(id, status);

    res.json({
      success: true,
      message: "Status do assistido atualizado com sucesso",
      data: assistido,
    });
  }
);

export const updateValorMensal = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const { valorMensal } = req.body;
    const assistido = await assistidoService.updateValorMensal(id, valorMensal);

    res.json({
      success: true,
      message: "Valor mensal atualizado com sucesso",
      data: assistido,
    });
  }
);

export const getAssistidoStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await assistidoService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  }
);

export const getAssistidosByDiaVencimento = asyncHandler(
  async (req: Request, res: Response) => {
    const dia = parseInt(req.params.dia || "0");
    const assistidos = await assistidoService.getByDiaVencimento(dia);

    res.json({
      success: true,
      data: assistidos,
      message: `Assistidos com vencimento no dia ${dia}`,
    });
  }
);
