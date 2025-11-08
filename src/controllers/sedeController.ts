import type { Request, Response } from "express";
import { SedeService } from "../services/sedeService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const sedeService = new SedeService();

export const createSede = asyncHandler(async (req: Request, res: Response) => {
  const sede = await sedeService.create(req.body);

  res.status(201).json({
    success: true,
    message: "Sede criada com sucesso",
    data: sede,
  });
});

export const getSedes = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery || req.query;
  const result = await sedeService.findAll(query);

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getSedeById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id || "0");
  const sede = await sedeService.findById(id);

  res.json({
    success: true,
    data: sede,
  });
});

export const updateSede = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id || "0");
  const sede = await sedeService.update(id, req.body);

  res.json({
    success: true,
    message: "Sede atualizada com sucesso",
    data: sede,
  });
});

export const deleteSede = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id || "0");
  const result = await sedeService.delete(id);

  res.json({
    success: true,
    message: result.message,
  });
});

export const toggleSedeStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const sede = await sedeService.toggleStatus(id);

    res.json({
      success: true,
      message: "Status da sede alterado com sucesso",
      data: sede,
    });
  }
);

export const getSedesAtivas = asyncHandler(
  async (req: Request, res: Response) => {
    const sedes = await sedeService.listAtivas();

    res.json({
      success: true,
      data: sedes,
    });
  }
);

export const getSedeStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await sedeService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  }
);
