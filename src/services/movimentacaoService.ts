// src/services/movimentacaoService.ts
import { prisma } from "../config/database.js";
import type {
  MovimentacaoCreate,
  MovimentacaoUpdate,
  PaginationParams,
  DateRangeParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class MovimentacaoService {
  async create(data: MovimentacaoCreate) {
    try {
      // Validar valor positivo
      if (data.valor <= 0) {
        throw new AppError("Valor deve ser maior que zero", 400);
      }

      // Validar tipo
      if (!["entrada", "saida"].includes(data.tipo)) {
        throw new AppError('Tipo deve ser "entrada" ou "saida"', 400);
      }

      const createData = {
        data: new Date(data.data),
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        categoria: data.categoria,
        conta: data.conta,
        centroDeCusto: data.centroDeCusto || null,
        favorecidoPagador: data.favorecidoPagador || null,
        contribuicaoId: data.contribuicaoId || null,
        observacoes: data.observacoes || null,
      };

      const movimentacao = await prisma.movimentacao.create({
        data: createData,
      });

      return movimentacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar movimentação", 500);
    }
  }

  async findAll(
    params: PaginationParams & {
      tipo?: "entrada" | "saida";
      categoria?: string;
      conta?: string;
      search?: string;
      valorMin?: number;
      valorMax?: number;
    } & DateRangeParams
  ) {
    try {
      const {
        page,
        limit,
        orderBy = "data",
        orderDirection,
        tipo,
        categoria,
        conta,
        search,
        valorMin,
        valorMax,
        startDate,
        endDate,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (tipo) {
        where.tipo = tipo;
      }

      if (categoria) {
        where.categoria = categoria;
      }

      if (conta) {
        where.conta = conta;
      }

      if (search) {
        where.OR = [
          { descricao: { contains: search, mode: "insensitive" } },
          { favorecidoPagador: { contains: search, mode: "insensitive" } },
          { categoria: { contains: search, mode: "insensitive" } },
          { conta: { contains: search, mode: "insensitive" } },
        ];
      }

      if (valorMin !== undefined || valorMax !== undefined) {
        where.valor = {};
        if (valorMin !== undefined) where.valor.gte = valorMin;
        if (valorMax !== undefined) where.valor.lte = valorMax;
      }

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      const [movimentacoes, total] = await Promise.all([
        prisma.movimentacao.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
        }),
        prisma.movimentacao.count({ where }),
      ]);

      return {
        data: movimentacoes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar movimentações", 500);
    }
  }

  async findById(id: number) {
    try {
      const movimentacao = await prisma.movimentacao.findUnique({
        where: { id },
      });

      if (!movimentacao) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      return movimentacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar movimentação", 500);
    }
  }

  async update(id: number, data: MovimentacaoUpdate) {
    try {
      // Verificar se movimentação existe
      const existingMovimentacao = await prisma.movimentacao.findUnique({
        where: { id },
      });

      if (!existingMovimentacao) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      // Validar valor se fornecido
      if (data.valor !== undefined && data.valor <= 0) {
        throw new AppError("Valor deve ser maior que zero", 400);
      }

      // Validar tipo se fornecido
      if (data.tipo && !["entrada", "saida"].includes(data.tipo)) {
        throw new AppError('Tipo deve ser "entrada" ou "saida"', 400);
      }

      const updateData: Record<string, any> = {};

      if (data.data !== undefined) updateData.data = new Date(data.data);
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.categoria !== undefined) updateData.categoria = data.categoria;
      if (data.conta !== undefined) updateData.conta = data.conta;
      if (data.centroDeCusto !== undefined)
        updateData.centroDeCusto = data.centroDeCusto || null;
      if (data.favorecidoPagador !== undefined)
        updateData.favorecidoPagador = data.favorecidoPagador || null;
      if (data.contribuicaoId !== undefined)
        updateData.contribuicaoId = data.contribuicaoId || null;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes || null;

      const movimentacao = await prisma.movimentacao.update({
        where: { id },
        data: updateData,
      });

      return movimentacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar movimentação", 500);
    }
  }

  async delete(id: number) {
    try {
      // Verificar se movimentação existe
      const existingMovimentacao = await prisma.movimentacao.findUnique({
        where: { id },
      });

      if (!existingMovimentacao) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      await prisma.movimentacao.delete({
        where: { id },
      });

      return { message: "Movimentação excluída com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir movimentação", 500);
    }
  }

  async getResumoFinanceiro(params: DateRangeParams & { conta?: string }) {
    try {
      const { startDate, endDate, conta } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      if (conta) {
        where.conta = conta;
      }

      const [entradas, saidas] = await Promise.all([
        prisma.movimentacao.aggregate({
          where: { ...where, tipo: "entrada" },
          _sum: { valor: true },
          _count: true,
        }),
        prisma.movimentacao.aggregate({
          where: { ...where, tipo: "saida" },
          _sum: { valor: true },
          _count: true,
        }),
      ]);

      const totalEntradas = entradas._sum.valor || 0;
      const totalSaidas = saidas._sum.valor || 0;
      const saldo = Number(totalEntradas) - Number(totalSaidas);

      return {
        periodo: {
          inicio: startDate || null,
          fim: endDate || null,
        },
        conta: conta || "Todas",
        entradas: {
          total: totalEntradas,
          quantidade: entradas._count,
        },
        saidas: {
          total: totalSaidas,
          quantidade: saidas._count,
        },
        saldo,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar resumo financeiro", 500);
    }
  }

  async getRelatorioPorCategoria(
    params: DateRangeParams & { tipo?: "entrada" | "saida" }
  ) {
    try {
      const { startDate, endDate, tipo } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      if (tipo) {
        where.tipo = tipo;
      }

      const movimentacoes = await prisma.movimentacao.findMany({
        where,
        select: {
          categoria: true,
          valor: true,
          tipo: true,
        },
      });

      // Agrupar por categoria
      const relatorio = movimentacoes.reduce((acc: any, mov) => {
        const categoria = mov.categoria;
        if (!acc[categoria]) {
          acc[categoria] = {
            categoria,
            entradas: 0,
            saidas: 0,
            total: 0,
          };
        }

        if (mov.tipo === "entrada") {
          acc[categoria].entradas += Number(mov.valor);
        } else {
          acc[categoria].saidas += Number(mov.valor);
        }

        acc[categoria].total = acc[categoria].entradas - acc[categoria].saidas;

        return acc;
      }, {});

      return Object.values(relatorio).sort(
        (a: any, b: any) => b.total - a.total
      );
    } catch (error) {
      throw new AppError("Erro ao gerar relatório por categoria", 500);
    }
  }

  async getRelatorioPorConta(params: DateRangeParams) {
    try {
      const { startDate, endDate } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      const movimentacoes = await prisma.movimentacao.findMany({
        where,
        select: {
          conta: true,
          valor: true,
          tipo: true,
        },
      });

      // Agrupar por conta
      const relatorio = movimentacoes.reduce((acc: any, mov) => {
        const conta = mov.conta;
        if (!acc[conta]) {
          acc[conta] = {
            conta,
            entradas: 0,
            saidas: 0,
            saldo: 0,
          };
        }

        if (mov.tipo === "entrada") {
          acc[conta].entradas += Number(mov.valor);
        } else {
          acc[conta].saidas += Number(mov.valor);
        }

        acc[conta].saldo = acc[conta].entradas - acc[conta].saidas;

        return acc;
      }, {});

      return Object.values(relatorio).sort(
        (a: any, b: any) => b.saldo - a.saldo
      );
    } catch (error) {
      throw new AppError("Erro ao gerar relatório por conta", 500);
    }
  }

  async getCategorias() {
    try {
      const categorias = await prisma.movimentacao.findMany({
        select: { categoria: true },
        distinct: ["categoria"],
        orderBy: { categoria: "asc" },
      });

      return categorias.map((c) => c.categoria);
    } catch (error) {
      throw new AppError("Erro ao buscar categorias", 500);
    }
  }

  async getContas() {
    try {
      const contas = await prisma.movimentacao.findMany({
        select: { conta: true },
        distinct: ["conta"],
        orderBy: { conta: "asc" },
      });

      return contas.map((c) => c.conta);
    } catch (error) {
      throw new AppError("Erro ao buscar contas", 500);
    }
  }

  async getStatistics(params: DateRangeParams = {}) {
    try {
      const { startDate, endDate } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      const [total, entradas, saidas, ultimasMovimentacoes] = await Promise.all(
        [
          prisma.movimentacao.count({ where }),
          prisma.movimentacao.aggregate({
            where: { ...where, tipo: "entrada" },
            _sum: { valor: true },
            _count: true,
          }),
          prisma.movimentacao.aggregate({
            where: { ...where, tipo: "saida" },
            _sum: { valor: true },
            _count: true,
          }),
          prisma.movimentacao.findMany({
            where,
            orderBy: { data: "desc" },
            take: 5,
            select: {
              id: true,
              data: true,
              descricao: true,
              valor: true,
              tipo: true,
              categoria: true,
            },
          }),
        ]
      );

      const totalEntradas = entradas._sum.valor || 0;
      const totalSaidas = saidas._sum.valor || 0;
      const saldoTotal = Number(totalEntradas) - Number(totalSaidas);

      return {
        total,
        entradas: {
          total: totalEntradas,
          quantidade: entradas._count,
        },
        saidas: {
          total: totalSaidas,
          quantidade: saidas._count,
        },
        saldoTotal,
        ultimasMovimentacoes,
      };
    } catch (error) {
      throw new AppError("Erro ao obter estatísticas de movimentações", 500);
    }
  }
}
