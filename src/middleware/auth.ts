// src/middleware/auth.ts
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError("Token de acesso necessário", 401);
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new AppError("Configuração JWT inválida", 500);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError("Token inválido", 403);
  }
};

export const generateToken = (payload: TokenPayload): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new AppError("Configuração JWT inválida", 500);
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  } as jwt.SignOptions);
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError("Usuário não autenticado", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError("Acesso negado. Apenas administradores.", 403);
  }

  next();
};
