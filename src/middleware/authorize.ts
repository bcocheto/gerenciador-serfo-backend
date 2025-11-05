// src/middleware/authorize.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

export type UserRole = "admin" | "secretario" | "tesoureiro" | "voluntario";

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        `Acesso negado. Roles permitidas: ${allowedRoles.join(", ")}`,
        403
      );
    }

    next();
  };
};

// Helpers para roles específicas
export const requireAdmin = authorize(["admin"]);
export const requireAdminOrSecretary = authorize(["admin", "secretario"]);
export const requireAdminOrTreasurer = authorize(["admin", "tesoureiro"]);
export const requireStaff = authorize(["admin", "secretario", "tesoureiro"]);

export default {
  authorize,
  requireAdmin,
  requireAdminOrSecretary,
  requireAdminOrTreasurer,
  requireStaff,
};
