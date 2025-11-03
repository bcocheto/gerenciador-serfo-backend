// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode = 500, message } = error;

  // Log do erro para debugging
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`,
    {
      error: message,
      stack: error.stack,
      body: req.body,
      query: req.query,
      params: req.params,
    }
  );

  // Resposta para o cliente
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Erro interno do servidor" : message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.path} não encontrada`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
