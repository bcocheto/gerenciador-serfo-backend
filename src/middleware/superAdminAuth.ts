import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";
import { CargoVoluntario } from "../models/types.js";

// Verificar se é Super Admin
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError("Usuário não autenticado", 401);
  }

  if (req.user.cargo !== CargoVoluntario.SUPER_ADMIN) {
    throw new AppError("Acesso negado. Apenas Super Administradores.", 403);
  }

  next();
};

// Verificar se é Super Admin ou tem permissão na sede específica
export const requireSuperAdminOrSedeAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError("Usuário não autenticado", 401);
  }

  const isSuperAdmin = req.user.cargo === CargoVoluntario.SUPER_ADMIN;
  const sedeId = req.params.sedeId || req.query.sedeId || req.body.sedeId;

  // Super Admin tem acesso a tudo
  if (isSuperAdmin) {
    return next();
  }

  // Para outros usuários, verificar se tem acesso à sede específica
  if (sedeId && req.user.sedeId !== parseInt(sedeId)) {
    throw new AppError(
      "Acesso negado. Você não tem permissão para esta sede.",
      403
    );
  }

  next();
};

// Verificar se tem permissão administrativa (Super Admin ou Presidente)
export const requireAdminPermissions = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError("Usuário não autenticado", 401);
  }

  const hasAdminPermissions = [
    CargoVoluntario.SUPER_ADMIN,
    CargoVoluntario.PRESIDENTE,
  ].includes(req.user.cargo);

  if (!hasAdminPermissions) {
    throw new AppError(
      "Acesso negado. Permissões administrativas necessárias.",
      403
    );
  }

  next();
};

export default {
  requireSuperAdmin,
  requireSuperAdminOrSedeAccess,
  requireAdminPermissions,
};
