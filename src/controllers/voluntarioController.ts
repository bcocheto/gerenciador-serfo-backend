// src/controllers/voluntarioController.ts
import type { Request, Response } from "express";
import { VoluntarioService } from "../services/voluntarioService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const voluntarioService = new VoluntarioService();

export const createVoluntario = asyncHandler(
  async (req: Request, res: Response) => {
    const voluntario = await voluntarioService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Voluntário criado com sucesso",
      data: voluntario,
    });
  }
);

export const getVoluntarios = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await voluntarioService.findAll(req.query as any);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const getVoluntarioById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const voluntario = await voluntarioService.findById(id);

    res.json({
      success: true,
      data: voluntario,
    });
  }
);

export const updateVoluntario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const voluntario = await voluntarioService.update(id, req.body);

    res.json({
      success: true,
      message: "Voluntário atualizado com sucesso",
      data: voluntario,
    });
  }
);

export const deleteVoluntario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await voluntarioService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

export const updateVoluntarioStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const { status } = req.body;
    const voluntario = await voluntarioService.updateStatus(id, status);

    res.json({
      success: true,
      message: "Status do voluntário atualizado com sucesso",
      data: voluntario,
    });
  }
);

export const getVoluntarioStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const statistics = await voluntarioService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  }
);
