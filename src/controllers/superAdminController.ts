import type { Request, Response } from "express";
import { SuperAdminService } from "../services/superAdminService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const superAdminService = new SuperAdminService();

// ========== GESTÃO DE USUÁRIOS ==========

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as any).validatedQuery || req.query;
  const result = await superAdminService.getAllUsers(query);

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const createUserInAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await superAdminService.createUserInAnySede(req.body);

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: user,
    });
  }
);

export const updateUserAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const user = await superAdminService.updateUserAnySede(id, req.body);

    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: user,
    });
  }
);

export const deleteUserAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await superAdminService.deleteUserAnySede(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

export const transferUserToSede = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId || "0");
    const { newSedeId } = req.body;

    const user = await superAdminService.transferUserToSede(userId, newSedeId);

    res.json({
      success: true,
      message: "Usuário transferido com sucesso",
      data: user,
    });
  }
);

// ========== GESTÃO DE ASSISTIDOS ==========

export const getAllAssistidos = asyncHandler(
  async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await superAdminService.getAllAssistidos(query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const createAssistidoInAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const assistido = await superAdminService.createAssistidoInAnySede(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Assistido criado com sucesso",
      data: assistido,
    });
  }
);

export const updateAssistidoAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const assistido = await superAdminService.updateAssistidoAnySede(
      id,
      req.body
    );

    res.json({
      success: true,
      message: "Assistido atualizado com sucesso",
      data: assistido,
    });
  }
);

export const deleteAssistidoAnySede = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await superAdminService.deleteAssistidoAnySede(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

// ========== GESTÃO DE SEDES ==========

export const getAllSedes = asyncHandler(async (req: Request, res: Response) => {
  const sedes = await superAdminService.getAllSedes();

  res.json({
    success: true,
    data: sedes,
  });
});

export const createSedeAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const sede = await superAdminService.createSede(req.body);

    res.status(201).json({
      success: true,
      message: "Sede criada com sucesso",
      data: sede,
    });
  }
);

export const updateSedeAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const sede = await superAdminService.updateSede(id, req.body);

    res.json({
      success: true,
      message: "Sede atualizada com sucesso",
      data: sede,
    });
  }
);

export const deleteSedeAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id || "0");
    const result = await superAdminService.deleteSede(id);

    res.json({
      success: true,
      message: result.message,
    });
  }
);

// ========== DASHBOARD ==========

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await superAdminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  }
);

// ========== AUDITORIA ==========

export const getActivityLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await superAdminService.getActivityLogs(query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);
