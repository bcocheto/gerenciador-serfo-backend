// src/services/emailService.ts
import { AppError } from "../middleware/errorHandler.js";

export class EmailService {
  async testarConexao() {
    return { message: "Serviço de email em desenvolvimento" };
  }

  async obterLogsEmail(params: any) {
    throw new AppError("Em desenvolvimento", 501);
  }

  async enviarEmail(params: any) {
    throw new AppError("Em desenvolvimento", 501);
  }

  async enviarEmailLote(params: any) {
    throw new AppError("Em desenvolvimento", 501);
  }

  async processarEmailsAgendados() {
    throw new AppError("Em desenvolvimento", 501);
  }

  async reenviarEmail(logId: number) {
    throw new AppError("Em desenvolvimento", 501);
  }
}
