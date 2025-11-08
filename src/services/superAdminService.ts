import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import type {
  Voluntario,
  Assistido,
  Sede,
  PaginationParams,
  CargoVoluntario,
} from "../models/types.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface VoluntarioCreate {
  nomeCompleto: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  dataIngresso: string;
  observacoes?: string;
  sedeId: number;
  cargo?: CargoVoluntario;
  password?: string;
}

interface VoluntarioUpdate {
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
  sedeId?: number;
  cargo?: CargoVoluntario;
}

interface AssistidoCreate {
  nomeCompleto: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  dataIngresso: string;
  valorMensal: number;
  diaVencimento: number;
  observacoes?: string;
  sedeId: number;
}

interface AssistidoUpdate {
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  valorMensal?: number;
  diaVencimento?: number;
  observacoes?: string;
  sedeId?: number;
}

interface SedeCreate {
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

interface SedeUpdate {
  nome?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
}

export class SuperAdminService {
  // ========== GESTÃO DE USUÁRIOS ==========

  async getAllUsers(
    params: PaginationParams & {
      search?: string;
      sedeId?: number;
      cargo?: CargoVoluntario;
      ativo?: boolean;
    }
  ) {
    try {
      const { page = 1, limit = 10, search, sedeId, cargo, ativo } = params;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search } },
        ];
      }

      if (sedeId) {
        where.sedeId = sedeId;
      }

      if (cargo) {
        where.cargo = cargo;
      }

      if (ativo !== undefined) {
        where.ativo = ativo;
      }

      const [users, total] = await Promise.all([
        prisma.voluntario.findMany({
          where,
          include: {
            sede: {
              select: { id: true, nome: true },
            },
          },
          skip,
          take: limit,
          orderBy: { nomeCompleto: "asc" },
        }),
        prisma.voluntario.count({ where }),
      ]);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar usuários", 500);
    }
  }

  async createUserInAnySede(data: VoluntarioCreate) {
    try {
      // Super Admin pode criar usuário em qualquer sede
      const sede = await prisma.sede.findUnique({
        where: { id: data.sedeId },
      });

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      // Verificar email único
      const existingUser = await prisma.voluntario.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError("Email já cadastrado", 400);
      }

      // Hash da senha se fornecida
      let hashedPassword;
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12);
      }

      const createData: any = {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        dataIngresso: new Date(data.dataIngresso),
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        observacoes: data.observacoes || null,
        sedeId: data.sedeId,
        cargo: data.cargo || "VOLUNTARIO",
      };

      if (hashedPassword) {
        createData.senha = hashedPassword;
      }

      const user = await prisma.voluntario.create({
        data: createData,
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar usuário", 500);
    }
  }

  async updateUserAnySede(id: number, data: VoluntarioUpdate) {
    try {
      const existingUser = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Super Admin pode alterar qualquer usuário
      const updateData: Record<string, any> = {};

      if (data.nomeCompleto !== undefined)
        updateData.nomeCompleto = data.nomeCompleto;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.cpf !== undefined) updateData.cpf = data.cpf || null;
      if (data.telefone !== undefined)
        updateData.telefone = data.telefone || null;
      if (data.endereco !== undefined)
        updateData.endereco = data.endereco || null;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes || null;
      if (data.sedeId !== undefined) updateData.sedeId = data.sedeId;
      if (data.cargo !== undefined) updateData.cargo = data.cargo;

      const user = await prisma.voluntario.update({
        where: { id },
        data: updateData,
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar usuário", 500);
    }
  }

  async deleteUserAnySede(id: number) {
    try {
      const user = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Super Admin pode excluir qualquer usuário
      await prisma.voluntario.delete({
        where: { id },
      });

      return { message: "Usuário excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir usuário", 500);
    }
  }

  async transferUserToSede(userId: number, newSedeId: number) {
    try {
      const [user, sede] = await Promise.all([
        prisma.voluntario.findUnique({ where: { id: userId } }),
        prisma.sede.findUnique({ where: { id: newSedeId } }),
      ]);

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      if (!sede.ativo) {
        throw new AppError("Sede de destino está inativa", 400);
      }

      const updatedUser = await prisma.voluntario.update({
        where: { id: userId },
        data: { sedeId: newSedeId },
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao transferir usuário", 500);
    }
  }

  // ========== GESTÃO DE ASSISTIDOS ==========

  async getAllAssistidos(
    params: PaginationParams & {
      search?: string;
      sedeId?: number;
      status?: string;
      valorMin?: number;
      valorMax?: number;
    }
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sedeId,
        status,
        valorMin,
        valorMax,
      } = params;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search } },
        ];
      }

      if (sedeId) {
        where.sedeId = sedeId;
      }

      if (status) {
        where.status = status;
      }

      if (valorMin !== undefined || valorMax !== undefined) {
        where.valorMensal = {};
        if (valorMin !== undefined) where.valorMensal.gte = valorMin;
        if (valorMax !== undefined) where.valorMensal.lte = valorMax;
      }

      const [assistidos, total] = await Promise.all([
        prisma.assistido.findMany({
          where,
          include: {
            sede: {
              select: { id: true, nome: true },
            },
          },
          skip,
          take: limit,
          orderBy: { nomeCompleto: "asc" },
        }),
        prisma.assistido.count({ where }),
      ]);

      return {
        data: assistidos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar assistidos", 500);
    }
  }

  async createAssistidoInAnySede(data: AssistidoCreate) {
    try {
      const sede = await prisma.sede.findUnique({
        where: { id: data.sedeId },
      });

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      const createData = {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        dataIngresso: new Date(data.dataIngresso),
        valorMensal: data.valorMensal,
        diaVencimento: data.diaVencimento,
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        observacoes: data.observacoes || null,
        sedeId: data.sedeId,
      };

      const assistido = await prisma.assistido.create({
        data: createData,
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      return assistido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar assistido", 500);
    }
  }

  async updateAssistidoAnySede(id: number, data: AssistidoUpdate) {
    try {
      const existingAssistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!existingAssistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      const updateData: Record<string, any> = {};

      if (data.nomeCompleto !== undefined)
        updateData.nomeCompleto = data.nomeCompleto;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.cpf !== undefined) updateData.cpf = data.cpf || null;
      if (data.telefone !== undefined)
        updateData.telefone = data.telefone || null;
      if (data.endereco !== undefined)
        updateData.endereco = data.endereco || null;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes || null;
      if (data.valorMensal !== undefined)
        updateData.valorMensal = data.valorMensal;
      if (data.diaVencimento !== undefined)
        updateData.diaVencimento = data.diaVencimento;
      if (data.sedeId !== undefined) updateData.sedeId = data.sedeId;

      const assistido = await prisma.assistido.update({
        where: { id },
        data: updateData,
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      return assistido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar assistido", 500);
    }
  }

  async deleteAssistidoAnySede(id: number) {
    try {
      const assistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!assistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      await prisma.assistido.delete({
        where: { id },
      });

      return { message: "Assistido excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir assistido", 500);
    }
  }

  // ========== GESTÃO DE SEDES ==========

  async getAllSedes() {
    try {
      const sedes = await prisma.sede.findMany({
        include: {
          _count: {
            select: {
              voluntarios: { where: { ativo: true } },
              assistidos: { where: { ativo: true } },
            },
          },
        },
        orderBy: { nome: "asc" },
      });

      return sedes.map((sede) => ({
        id: sede.id,
        nome: sede.nome,
        endereco: sede.endereco || "",
        cidade: sede.cidade || "",
        cep: sede.cep || "",
        telefone: sede.telefone || "",
        email: sede.email || "",
        isAtiva: sede.ativo,
        createdAt: sede.criadoEm.toISOString(),
        updatedAt: sede.atualizadoEm.toISOString(),
        _count: {
          voluntarios: sede._count.voluntarios,
          assistidos: sede._count.assistidos,
        },
      }));
    } catch (error) {
      throw new AppError("Erro ao buscar sedes", 500);
    }
  }

  async createSede(data: SedeCreate) {
    try {
      const existingSede = await prisma.sede.findUnique({
        where: { nome: data.nome },
      });

      if (existingSede) {
        throw new AppError("Já existe uma sede com este nome", 400);
      }

      const sede = await prisma.sede.create({
        data: {
          nome: data.nome,
          endereco: data.endereco || null,
          telefone: data.telefone || null,
          email: data.email || null,
        },
      });

      return sede;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar sede", 500);
    }
  }

  async updateSede(id: number, data: SedeUpdate) {
    try {
      const existingSede = await prisma.sede.findUnique({
        where: { id },
      });

      if (!existingSede) {
        throw new AppError("Sede não encontrada", 404);
      }

      const updateData: Record<string, any> = {};

      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.endereco !== undefined)
        updateData.endereco = data.endereco || null;
      if (data.telefone !== undefined)
        updateData.telefone = data.telefone || null;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;

      const sede = await prisma.sede.update({
        where: { id },
        data: updateData,
      });

      return sede;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar sede", 500);
    }
  }

  async deleteSede(id: number) {
    try {
      const sede = await prisma.sede.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              voluntarios: true,
              assistidos: true,
            },
          },
        },
      });

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      // Super Admin pode forçar exclusão se necessário
      if (sede._count.voluntarios > 0 || sede._count.assistidos > 0) {
        throw new AppError(
          `Sede possui ${sede._count.voluntarios} voluntários e ${sede._count.assistidos} assistidos. ` +
            `Transfira-os para outras sedes antes de excluir.`,
          400
        );
      }

      await prisma.sede.delete({
        where: { id },
      });

      return { message: "Sede excluída com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir sede", 500);
    }
  }

  // ========== DASHBOARD SUPER ADMIN ==========

  async getDashboardStats() {
    try {
      const [
        totalSedes,
        sedesAtivas,
        totalVoluntarios,
        voluntariosAtivos,
        totalAssistidos,
        assistidosAtivos,
        statsPorSede,
      ] = await Promise.all([
        prisma.sede.count(),
        prisma.sede.count({ where: { ativo: true } }),
        prisma.voluntario.count(),
        prisma.voluntario.count({ where: { ativo: true } }),
        prisma.assistido.count(),
        prisma.assistido.count({ where: { ativo: true } }),
        prisma.sede.findMany({
          include: {
            _count: {
              select: {
                voluntarios: { where: { ativo: true } },
                assistidos: { where: { ativo: true } },
              },
            },
          },
          orderBy: { nome: "asc" },
        }),
      ]);

      return {
        sedes: {
          total: totalSedes,
          ativas: sedesAtivas,
          inativas: totalSedes - sedesAtivas,
        },
        voluntarios: {
          total: totalVoluntarios,
          ativos: voluntariosAtivos,
          inativos: totalVoluntarios - voluntariosAtivos,
        },
        assistidos: {
          total: totalAssistidos,
          ativos: assistidosAtivos,
          inativos: totalAssistidos - assistidosAtivos,
        },
        statsPorSede: statsPorSede.map((sede) => ({
          id: sede.id,
          nome: sede.nome,
          ativo: sede.ativo,
          voluntarios: sede._count.voluntarios,
          assistidos: sede._count.assistidos,
        })),
      };
    } catch (error) {
      throw new AppError("Erro ao buscar estatísticas", 500);
    }
  }

  // ========== AUDITORIA E LOGS ==========

  async getActivityLogs(
    params: PaginationParams & {
      sedeId?: number;
      action?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      // Por enquanto retorna mock - implementar sistema de auditoria depois
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar logs de atividade", 500);
    }
  }
}
