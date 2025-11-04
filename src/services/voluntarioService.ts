import { prisma } from "../config/database.js";
import type {
  VoluntarioCreate,
  VoluntarioUpdate,
  PaginationParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class VoluntarioService {
  async create(data: VoluntarioCreate) {
    try {
      // Verificar se email já existe
      const existingEmail = await prisma.voluntario.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new AppError("Email já cadastrado", 400);
      }

      // Verificar se CPF já existe (se fornecido)
      if (data.cpf) {
        const existingCpf = await prisma.voluntario.findUnique({
          where: { cpf: data.cpf },
        });

        if (existingCpf) {
          throw new AppError("CPF já cadastrado", 400);
        }
      }

      const createData = {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        dataIngresso: new Date(data.dataIngresso),
        cpf: data.cpf || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        observacoes: data.observacoes || null,
      };

      const voluntario = await prisma.voluntario.create({
        data: createData,
      });

      return voluntario;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar voluntário", 500);
    }
  }

  async findAll(
    params: PaginationParams & { status?: string; search?: string }
  ) {
    try {
      const {
        page,
        limit,
        orderBy = "criadoEm",
        orderDirection,
        status,
        search,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search } },
        ];
      }

      const [voluntarios, total] = await Promise.all([
        prisma.voluntario.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
        }),
        prisma.voluntario.count({ where }),
      ]);

      return {
        data: voluntarios,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar voluntários", 500);
    }
  }

  async findById(id: number) {
    try {
      const voluntario = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!voluntario) {
        throw new AppError("Voluntário não encontrado", 404);
      }

      return voluntario;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar voluntário", 500);
    }
  }

  async update(id: number, data: VoluntarioUpdate) {
    try {
      // Verificar se voluntário existe
      const existingVoluntario = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!existingVoluntario) {
        throw new AppError("Voluntário não encontrado", 404);
      }

      // Verificar email único (se está sendo alterado)
      if (data.email && data.email !== existingVoluntario.email) {
        const emailExists = await prisma.voluntario.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new AppError("Email já cadastrado", 400);
        }
      }

      // Verificar CPF único (se está sendo alterado)
      if (data.cpf && data.cpf !== existingVoluntario.cpf) {
        const cpfExists = await prisma.voluntario.findUnique({
          where: { cpf: data.cpf },
        });

        if (cpfExists) {
          throw new AppError("CPF já cadastrado", 400);
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

      const voluntario = await prisma.voluntario.update({
        where: { id },
        data: updateData,
      });

      return voluntario;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar voluntário", 500);
    }
  }

  async delete(id: number) {
    try {
      // Verificar se voluntário existe
      const existingVoluntario = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!existingVoluntario) {
        throw new AppError("Voluntário não encontrado", 404);
      }

      // Verificar se tem contribuições ativas (por enquanto, vamos comentar até criar a tabela)
      // const activeContributions = await prisma.contribuicao.count({
      //   where: {
      //     voluntarioId: id,
      //     status: { in: ["pendente", "pago"] },
      //   },
      // });

      // if (activeContributions > 0) {
      //   throw new AppError(
      //     "Não é possível excluir voluntário com contribuições ativas",
      //     400
      //   );
      // }

      await prisma.voluntario.delete({
        where: { id },
      });

      return { message: "Voluntário excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir voluntário", 500);
    }
  }

  async updateStatus(id: number, status: "ativo" | "inativo" | "suspenso") {
    try {
      const voluntario = await prisma.voluntario.findUnique({
        where: { id },
      });

      if (!voluntario) {
        throw new AppError("Voluntário não encontrado", 404);
      }

      const updatedVoluntario = await prisma.voluntario.update({
        where: { id },
        data: { status },
      });

      return updatedVoluntario;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar status do voluntário", 500);
    }
  }

  async getStatistics() {
    try {
      const [total, ativos, inativos, suspensos] = await Promise.all([
        prisma.voluntario.count(),
        prisma.voluntario.count({ where: { status: "ativo" } }),
        prisma.voluntario.count({ where: { status: "inativo" } }),
        prisma.voluntario.count({ where: { status: "suspenso" } }),
      ]);

      return {
        total,
        ativos,
        inativos,
        suspensos,
      };
    } catch (error) {
      throw new AppError("Erro ao obter estatísticas de voluntários", 500);
    }
  }
}
