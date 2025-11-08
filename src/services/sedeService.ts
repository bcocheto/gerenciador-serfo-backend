import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import type {
  Sede,
  SedeWithRelations,
  SedeFilter,
  PaginatedResponse,
} from "../models/types.js";

const prisma = new PrismaClient();

export interface SedeCreateData {
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export interface SedeUpdateData extends Partial<SedeCreateData> {
  ativo?: boolean;
}

export class SedeService {
  async create(data: SedeCreateData): Promise<Sede> {
    try {
      // Verificar se já existe sede com mesmo nome
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

  async findAll(
    filters: SedeFilter
  ): Promise<PaginatedResponse<SedeWithRelations>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        ativo,
        nome,
        orderBy = "nome",
        orderDirection = "asc",
      } = filters;

      const skip = (page - 1) * limit;
      const where: any = {};

      // Filtros
      if (search) {
        where.OR = [
          { nome: { contains: search, mode: "insensitive" } },
          { endereco: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (nome) {
        where.nome = { contains: nome, mode: "insensitive" };
      }

      if (ativo !== undefined) {
        where.ativo = ativo;
      }

      const [sedes, total] = await Promise.all([
        prisma.sede.findMany({
          where,
          include: {
            _count: {
              select: {
                voluntarios: true,
                assistidos: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
        }),
        prisma.sede.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: sedes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar sedes", 500);
    }
  }

  async findById(id: number): Promise<SedeWithRelations> {
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

      return sede;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar sede", 500);
    }
  }

  async update(id: number, data: SedeUpdateData): Promise<Sede> {
    try {
      const existingSede = await prisma.sede.findUnique({
        where: { id },
      });

      if (!existingSede) {
        throw new AppError("Sede não encontrada", 404);
      }

      // Verificar nome único (se está sendo alterado)
      if (data.nome && data.nome !== existingSede.nome) {
        const nomeExists = await prisma.sede.findUnique({
          where: { nome: data.nome },
        });

        if (nomeExists) {
          throw new AppError("Já existe uma sede com este nome", 400);
        }
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

  async delete(id: number) {
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

      // Verificar se tem voluntários ou assistidos vinculados
      if (sede._count.voluntarios > 0 || sede._count.assistidos > 0) {
        throw new AppError(
          "Não é possível excluir sede que possui voluntários ou assistidos vinculados",
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

  async toggleStatus(id: number): Promise<Sede> {
    try {
      const sede = await prisma.sede.findUnique({
        where: { id },
      });

      if (!sede) {
        throw new AppError("Sede não encontrada", 404);
      }

      const updatedSede = await prisma.sede.update({
        where: { id },
        data: { ativo: !sede.ativo },
      });

      return updatedSede;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao alterar status da sede", 500);
    }
  }

  async listAtivas(): Promise<Array<{ id: number; nome: string }>> {
    try {
      const sedes = await prisma.sede.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: "asc" },
      });

      return sedes;
    } catch (error) {
      throw new AppError("Erro ao buscar sedes ativas", 500);
    }
  }

  async getStatistics() {
    try {
      const [total, ativas, inativas] = await Promise.all([
        prisma.sede.count(),
        prisma.sede.count({ where: { ativo: true } }),
        prisma.sede.count({ where: { ativo: false } }),
      ]);

      return {
        total,
        ativas,
        inativas,
      };
    } catch (error) {
      throw new AppError("Erro ao buscar estatísticas das sedes", 500);
    }
  }
}
