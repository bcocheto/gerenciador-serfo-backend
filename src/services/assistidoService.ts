// src/services/assistidoService.ts
import { prisma } from "../config/database.js";
import type {
  AssistidoCreate,
  AssistidoUpdate,
  PaginationParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class AssistidoService {
  async create(data: AssistidoCreate) {
    try {
      // Verificar se email já existe
      const existingEmail = await prisma.assistido.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new AppError("Email já cadastrado", 400);
      }

      // Verificar se CPF já existe (se fornecido)
      if (data.cpf) {
        const existingCpf = await prisma.assistido.findUnique({
          where: { cpf: data.cpf },
        });

        if (existingCpf) {
          throw new AppError("CPF já cadastrado", 400);
        }
      }

      // Validar dia de vencimento
      if (data.diaVencimento < 1 || data.diaVencimento > 31) {
        throw new AppError("Dia de vencimento deve estar entre 1 e 31", 400);
      }

      // Validar valor mensal
      if (data.valorMensal <= 0) {
        throw new AppError("Valor mensal deve ser maior que zero", 400);
      }

      // Verificar se sede existe
      const sede = await prisma.sede.findUnique({
        where: { id: data.sedeId },
      });

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      if (!sede.ativo) {
        throw new AppError("Sede inativa", 400);
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

  async findAll(
    params: PaginationParams & {
      status?: string;
      search?: string;
      valorMin?: number;
      valorMax?: number;
      sedeId?: number;
    }
  ) {
    try {
      const {
        page,
        limit,
        orderBy = "criadoEm",
        orderDirection,
        status,
        search,
        valorMin,
        valorMax,
        sedeId,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (sedeId) {
        where.sedeId = sedeId;
      }

      if (search) {
        where.OR = [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search } },
        ];
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
          orderBy: { [orderBy]: orderDirection },
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

  async findById(id: number) {
    try {
      const assistido = await prisma.assistido.findUnique({
        where: { id },
        include: {
          sede: {
            select: { id: true, nome: true },
          },
        },
      });

      if (!assistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      return assistido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar assistido", 500);
    }
  }

  async update(id: number, data: AssistidoUpdate) {
    try {
      // Verificar se assistido existe
      const existingAssistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!existingAssistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      // Verificar email único (se está sendo alterado)
      if (data.email && data.email !== existingAssistido.email) {
        const emailExists = await prisma.assistido.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new AppError("Email já cadastrado", 400);
        }
      }

      // Verificar CPF único (se está sendo alterado)
      if (data.cpf && data.cpf !== existingAssistido.cpf) {
        const cpfExists = await prisma.assistido.findUnique({
          where: { cpf: data.cpf },
        });

        if (cpfExists) {
          throw new AppError("CPF já cadastrado", 400);
        }
      }

      // Validar dia de vencimento se fornecido
      if (
        data.diaVencimento !== undefined &&
        (data.diaVencimento < 1 || data.diaVencimento > 31)
      ) {
        throw new AppError("Dia de vencimento deve estar entre 1 e 31", 400);
      }

      // Validar valor mensal se fornecido
      if (data.valorMensal !== undefined && data.valorMensal <= 0) {
        throw new AppError("Valor mensal deve ser maior que zero", 400);
      }

      // Verificar sede se está sendo alterada
      if (data.sedeId) {
        const sede = await prisma.sede.findUnique({
          where: { id: data.sedeId },
        });

        if (!sede) {
          throw new AppError("Sede não encontrada", 404);
        }

        if (!sede.ativo) {
          throw new AppError("Sede inativa", 400);
        }
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
      if (data.dataIngresso !== undefined)
        updateData.dataIngresso = new Date(data.dataIngresso);
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

  async delete(id: number) {
    try {
      // Verificar se assistido existe
      const existingAssistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!existingAssistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      // Verificar se tem contribuições ativas (comentado até implementarmos)
      // const activeContributions = await prisma.contribuicao.count({
      //   where: {
      //     assistidoId: id,
      //     status: { in: ['pendente', 'pago'] }
      //   }
      // });

      // if (activeContributions > 0) {
      //   throw new AppError('Não é possível excluir assistido com contribuições ativas', 400);
      // }

      await prisma.assistido.delete({
        where: { id },
      });

      return { message: "Assistido excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir assistido", 500);
    }
  }

  async updateStatus(id: number, status: "ativo" | "inativo" | "suspenso") {
    try {
      const assistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!assistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      const updatedAssistido = await prisma.assistido.update({
        where: { id },
        data: { status },
      });

      return updatedAssistido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar status do assistido", 500);
    }
  }

  async updateValorMensal(id: number, novoValor: number) {
    try {
      if (novoValor <= 0) {
        throw new AppError("Valor mensal deve ser maior que zero", 400);
      }

      const assistido = await prisma.assistido.findUnique({
        where: { id },
      });

      if (!assistido) {
        throw new AppError("Assistido não encontrado", 404);
      }

      const updatedAssistido = await prisma.assistido.update({
        where: { id },
        data: { valorMensal: novoValor },
      });

      return updatedAssistido;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar valor mensal do assistido", 500);
    }
  }

  async getStatistics() {
    try {
      const [total, ativos, inativos, suspensos] = await Promise.all([
        prisma.assistido.count(),
        prisma.assistido.count({ where: { status: "ativo" } }),
        prisma.assistido.count({ where: { status: "inativo" } }),
        prisma.assistido.count({ where: { status: "suspenso" } }),
      ]);

      const valorTotalMensal = await prisma.assistido.aggregate({
        where: { status: "ativo" },
        _sum: { valorMensal: true },
      });

      const valorMedio = await prisma.assistido.aggregate({
        where: { status: "ativo" },
        _avg: { valorMensal: true },
      });

      return {
        total,
        ativos,
        inativos,
        suspensos,
        valorTotalMensal: valorTotalMensal._sum.valorMensal || 0,
        valorMedioMensal: valorMedio._avg.valorMensal || 0,
      };
    } catch (error) {
      throw new AppError("Erro ao obter estatísticas de assistidos", 500);
    }
  }

  async getByDiaVencimento(dia: number) {
    try {
      if (dia < 1 || dia > 31) {
        throw new AppError("Dia deve estar entre 1 e 31", 400);
      }

      const assistidos = await prisma.assistido.findMany({
        where: {
          diaVencimento: dia,
          status: "ativo",
        },
        orderBy: { nomeCompleto: "asc" },
      });

      return assistidos;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erro ao buscar assistidos por dia de vencimento",
        500
      );
    }
  }
}
