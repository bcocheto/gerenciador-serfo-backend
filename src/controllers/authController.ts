import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { CargoVoluntario } from "../models/types.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateToken } from "../middleware/auth.js";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthUser {
  id: number;
  nome: string;
  email: string;
  sedeId: number;
  cargo: CargoVoluntario;
}

export const authController = {
  // Login do usuário
  login: async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    // Validar dados de entrada
    if (!email || !password) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    // Buscar usuário por email
    const user = await prisma.voluntario.findFirst({
      where: {
        email: email.toLowerCase(),
        ativo: true,
      },
      include: {
        sede: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Para usuários criados automaticamente no seed, usar senha padrão
    const isDefaultPassword = !user.senha || user.senha === "";
    const passwordToCheck = isDefaultPassword ? "123456" : user.senha;

    // Verificar senha
    let isPasswordValid = false;
    if (isDefaultPassword) {
      // Para senhas padrão, fazer comparação direta
      isPasswordValid = password === passwordToCheck;
    } else {
      // Para senhas hashadas, usar bcrypt
      isPasswordValid = await bcrypt.compare(password, passwordToCheck);
    }

    if (!isPasswordValid) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Criar payload do token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.cargo.toLowerCase(),
      cargo: user.cargo as CargoVoluntario,
      sedeId: user.sedeId,
    };

    // Gerar token JWT
    const token = generateToken(tokenPayload);

    // Preparar dados do usuário para resposta
    const userData: AuthUser = {
      id: user.id,
      nome: user.nomeCompleto,
      email: user.email,
      sedeId: user.sedeId,
      cargo: user.cargo as CargoVoluntario,
    };

    res.json({
      success: true,
      user: userData,
      token,
    });
  },

  // Logout (invalidar token no cliente)
  logout: async (req: Request, res: Response) => {
    // O logout é feito no frontend removendo o token
    // Aqui podemos implementar uma blacklist de tokens se necessário
    res.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  },

  // Verificar token e retornar dados do usuário
  me: async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Buscar dados atualizados do usuário
    const user = await prisma.voluntario.findUnique({
      where: { id: req.user.id },
      include: {
        sede: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!user || !user.ativo) {
      throw new AppError("Usuário não encontrado ou inativo", 404);
    }

    const userData: AuthUser = {
      id: user.id,
      nome: user.nomeCompleto,
      email: user.email,
      sedeId: user.sedeId,
      cargo: user.cargo as CargoVoluntario,
    };

    res.json(userData);
  },

  // Alterar senha
  changePassword: async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!currentPassword || !newPassword) {
      throw new AppError("Senha atual e nova senha são obrigatórias", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("A nova senha deve ter pelo menos 6 caracteres", 400);
    }

    // Buscar usuário
    const user = await prisma.voluntario.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.ativo) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Verificar senha atual
    const isDefaultPassword = !user.senha || user.senha === "";
    const passwordToCheck = isDefaultPassword ? "123456" : user.senha;

    let isCurrentPasswordValid = false;
    if (isDefaultPassword) {
      isCurrentPasswordValid = currentPassword === passwordToCheck;
    } else {
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        passwordToCheck
      );
    }

    if (!isCurrentPasswordValid) {
      throw new AppError("Senha atual incorreta", 400);
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha no banco
    await prisma.voluntario.update({
      where: { id: req.user.id },
      data: { senha: hashedNewPassword },
    });

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  },

  // Refresh token
  refresh: async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Buscar dados atualizados do usuário
    const user = await prisma.voluntario.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.ativo) {
      throw new AppError("Usuário não encontrado ou inativo", 404);
    }

    // Gerar novo token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.cargo.toLowerCase(),
      cargo: user.cargo as CargoVoluntario,
      sedeId: user.sedeId,
    };

    const newToken = generateToken(tokenPayload);

    res.json({
      success: true,
      token: newToken,
    });
  },
};
