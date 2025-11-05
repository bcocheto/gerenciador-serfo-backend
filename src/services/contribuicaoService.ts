// src/services/contribuicaoService.ts
import { prisma } from "../config/database.js";
import type {
  ContribuicaoCreate,
  ContribuicaoUpdate,
  PaginationParams,
  DateRangeParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class ContribuicaoService {
  async create(data: ContribuicaoCreate) {
    try {
      // Validar que tem voluntário OU assistido
      if (!data.voluntarioId && !data.assistidoId) {
        throw new AppError("Deve ser informado voluntário ou assistido", 400);
      }

      // Validar que não tem ambos
      if (data.voluntarioId && data.assistidoId) {
        throw new AppError(
          "Não pode informar voluntário e assistido ao mesmo tempo",
          400
        );
      }

      // Verificar se voluntário/assistido existe
      if (data.voluntarioId) {
        const voluntario = await prisma.voluntario.findUnique({
          where: { id: data.voluntarioId },
        });
        if (!voluntario) {
          throw new AppError("Voluntário não encontrado", 404);
        }
      }

      if (data.assistidoId) {
        const assistido = await prisma.assistido.findUnique({
          where: { id: data.assistidoId },
        });
        if (!assistido) {
          throw new AppError("Assistido não encontrado", 404);
        }
      }

      const createData = {
        voluntarioId: data.voluntarioId || null,
        assistidoId: data.assistidoId || null,
        valor: data.valor,
        dataVencimento: new Date(data.dataVencimento),
        dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
        formaPagamento: data.formaPagamento || null,
        observacoes: data.observacoes || null,
      };

      const contribuicao = await prisma.contribuicao.create({
        data: createData,
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true, email: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true, email: true },
          },
        },
      });

      return contribuicao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar contribuição", 500);
    }
  }

  async findAll(
    params: PaginationParams & {
      status?: string;
      voluntarioId?: number;
      assistidoId?: number;
      search?: string;
      valorMin?: number;
      valorMax?: number;
    } & DateRangeParams
  ) {
    try {
      const {
        page,
        limit,
        orderBy = "dataVencimento",
        orderDirection,
        status,
        voluntarioId,
        assistidoId,
        search,
        valorMin,
        valorMax,
        startDate,
        endDate,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (voluntarioId) {
        where.voluntarioId = voluntarioId;
      }

      if (assistidoId) {
        where.assistidoId = assistidoId;
      }

      if (search) {
        where.OR = [
          {
            voluntario: {
              nomeCompleto: { contains: search, mode: "insensitive" },
            },
          },
          {
            assistido: {
              nomeCompleto: { contains: search, mode: "insensitive" },
            },
          },
          { formaPagamento: { contains: search, mode: "insensitive" } },
        ];
      }

      if (valorMin !== undefined || valorMax !== undefined) {
        where.valor = {};
        if (valorMin !== undefined) where.valor.gte = valorMin;
        if (valorMax !== undefined) where.valor.lte = valorMax;
      }

      if (startDate || endDate) {
        where.dataVencimento = {};
        if (startDate) where.dataVencimento.gte = new Date(startDate);
        if (endDate) where.dataVencimento.lte = new Date(endDate);
      }

      const [contribuicoes, total] = await Promise.all([
        prisma.contribuicao.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
          include: {
            voluntario: {
              select: {
                id: true,
                nomeCompleto: true,
                email: true,
                telefone: true,
              },
            },
            assistido: {
              select: {
                id: true,
                nomeCompleto: true,
                email: true,
                telefone: true,
              },
            },
          },
        }),
        prisma.contribuicao.count({ where }),
      ]);

      return {
        data: contribuicoes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar contribuições", 500);
    }
  }

  async findById(id: number) {
    try {
      const contribuicao = await prisma.contribuicao.findUnique({
        where: { id },
        include: {
          voluntario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
          assistido: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
          notasFiscais: true,
        },
      });

      if (!contribuicao) {
        throw new AppError("Contribuição não encontrada", 404);
      }

      return contribuicao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar contribuição", 500);
    }
  }

  async update(id: number, data: ContribuicaoUpdate) {
    try {
      const existingContribuicao = await prisma.contribuicao.findUnique({
        where: { id },
      });

      if (!existingContribuicao) {
        throw new AppError("Contribuição não encontrada", 404);
      }

      const updateData: Record<string, any> = {};

      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.dataVencimento !== undefined)
        updateData.dataVencimento = new Date(data.dataVencimento);
      if (data.dataPagamento !== undefined)
        updateData.dataPagamento = data.dataPagamento
          ? new Date(data.dataPagamento)
          : null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.formaPagamento !== undefined)
        updateData.formaPagamento = data.formaPagamento || null;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes || null;

      const contribuicao = await prisma.contribuicao.update({
        where: { id },
        data: updateData,
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true, email: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true, email: true },
          },
        },
      });

      return contribuicao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar contribuição", 500);
    }
  }

  async delete(id: number) {
    try {
      const existingContribuicao = await prisma.contribuicao.findUnique({
        where: { id },
      });

      if (!existingContribuicao) {
        throw new AppError("Contribuição não encontrada", 404);
      }

      // Verificar se tem nota fiscal associada
      const notaFiscal = await prisma.notaFiscal.findFirst({
        where: { contribuicaoId: id },
      });

      if (notaFiscal) {
        throw new AppError(
          "Não é possível excluir contribuição com nota fiscal emitida",
          400
        );
      }

      await prisma.contribuicao.delete({
        where: { id },
      });

      return { message: "Contribuição excluída com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao excluir contribuição", 500);
    }
  }

  async processarPagamento(
    id: number,
    dadosPagamento: {
      dataPagamento: string;
      formaPagamento: string;
      comprovante?: string;
      observacoes?: string;
      criarMovimentacao?: boolean;
    }
  ) {
    try {
      const contribuicao = await prisma.contribuicao.findUnique({
        where: { id },
        include: {
          voluntario: true,
          assistido: true,
        },
      });

      if (!contribuicao) {
        throw new AppError("Contribuição não encontrada", 404);
      }

      if (contribuicao.status === "pago") {
        throw new AppError("Contribuição já foi paga", 400);
      }

      // Atualizar contribuição
      const contribuicaoAtualizada = await prisma.contribuicao.update({
        where: { id },
        data: {
          status: "pago",
          dataPagamento: new Date(dadosPagamento.dataPagamento),
          formaPagamento: dadosPagamento.formaPagamento as any,
          comprovante: dadosPagamento.comprovante || null,
          observacoes: dadosPagamento.observacoes || contribuicao.observacoes,
        },
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true, email: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true, email: true },
          },
        },
      });

      // Criar movimentação financeira se solicitado
      if (dadosPagamento.criarMovimentacao !== false) {
        const pessoa = contribuicao.voluntario || contribuicao.assistido;

        await prisma.movimentacao.create({
          data: {
            data: new Date(dadosPagamento.dataPagamento),
            descricao: `Contribuição recebida - ${pessoa?.nomeCompleto}`,
            valor: contribuicao.valor,
            tipo: "entrada",
            categoria: contribuicao.voluntario
              ? "Contribuições Voluntários"
              : "Contribuições Assistidos",
            conta: "Conta Principal",
            favorecidoPagador: pessoa?.nomeCompleto || "Não informado",
            contribuicaoId: id,
            observacoes: `Pagamento da contribuição vencimento ${contribuicao.dataVencimento.toLocaleDateString()}`,
          },
        });
      }

      return contribuicaoAtualizada;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao processar pagamento", 500);
    }
  }

  async gerarContribuicoesMensais(ano: number, mes: number) {
    try {
      // Validar mês e ano
      if (mes < 1 || mes > 12) {
        throw new AppError("Mês deve estar entre 1 e 12", 400);
      }

      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();

      if (ano < anoAtual - 1 || ano > anoAtual + 1) {
        throw new AppError(
          "Ano deve estar entre o ano passado e próximo ano",
          400
        );
      }

      // Buscar assistidos ativos
      const assistidos = await prisma.assistido.findMany({
        where: { status: "ativo" },
      });

      if (assistidos.length === 0) {
        throw new AppError("Nenhum assistido ativo encontrado", 400);
      }

      const contribuicoesCriadas = [];

      for (const assistido of assistidos) {
        // Calcular data de vencimento
        const dataVencimento = new Date(ano, mes - 1, assistido.diaVencimento);

        // Verificar se já existe contribuição para este período
        const contribuicaoExistente = await prisma.contribuicao.findFirst({
          where: {
            assistidoId: assistido.id,
            dataVencimento: {
              gte: new Date(ano, mes - 1, 1),
              lt: new Date(ano, mes, 1),
            },
          },
        });

        if (!contribuicaoExistente) {
          const contribuicao = await prisma.contribuicao.create({
            data: {
              assistidoId: assistido.id,
              valor: assistido.valorMensal,
              dataVencimento,
              status: "pendente",
            },
            include: {
              assistido: {
                select: { id: true, nomeCompleto: true, email: true },
              },
            },
          });

          contribuicoesCriadas.push(contribuicao);
        }
      }

      return {
        message: `Contribuições de ${mes}/${ano} geradas com sucesso`,
        total: contribuicoesCriadas.length,
        contribuicoes: contribuicoesCriadas,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao gerar contribuições mensais", 500);
    }
  }

  async getContribuicoesPendentes(params: DateRangeParams = {}) {
    try {
      const { startDate, endDate } = params;

      const where: any = {
        status: "pendente",
      };

      if (startDate || endDate) {
        where.dataVencimento = {};
        if (startDate) where.dataVencimento.gte = new Date(startDate);
        if (endDate) where.dataVencimento.lte = new Date(endDate);
      }

      const contribuicoes = await prisma.contribuicao.findMany({
        where,
        orderBy: { dataVencimento: "asc" },
        include: {
          voluntario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
          assistido: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
        },
      });

      return contribuicoes;
    } catch (error) {
      throw new AppError("Erro ao buscar contribuições pendentes", 500);
    }
  }

  async getContribuicoesAtrasadas() {
    try {
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Fim do dia atual

      const contribuicoes = await prisma.contribuicao.findMany({
        where: {
          status: "pendente",
          dataVencimento: {
            lt: hoje,
          },
        },
        orderBy: { dataVencimento: "asc" },
        include: {
          voluntario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
          assistido: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              telefone: true,
            },
          },
        },
      });

      return contribuicoes;
    } catch (error) {
      throw new AppError("Erro ao buscar contribuições atrasadas", 500);
    }
  }

  async marcarContribuicoesAtrasadas() {
    try {
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      const resultado = await prisma.contribuicao.updateMany({
        where: {
          status: "pendente",
          dataVencimento: {
            lt: hoje,
          },
        },
        data: {
          status: "atrasado",
        },
      });

      return {
        message: "Contribuições atrasadas marcadas com sucesso",
        total: resultado.count,
      };
    } catch (error) {
      throw new AppError("Erro ao marcar contribuições atrasadas", 500);
    }
  }

  async getContribuicoesMes(ano: number, mes: number) {
    try {
      const inicioMes = new Date(ano, mes - 1, 1);
      const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

      const contribuicoes = await prisma.contribuicao.findMany({
        where: {
          dataVencimento: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        orderBy: { dataVencimento: "asc" },
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true, email: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true, email: true },
          },
        },
      });

      return contribuicoes;
    } catch (error) {
      throw new AppError("Erro ao buscar contribuições do mês", 500);
    }
  }

  async getStatistics(params: DateRangeParams = {}) {
    try {
      const { startDate, endDate } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.dataVencimento = {};
        if (startDate) where.dataVencimento.gte = new Date(startDate);
        if (endDate) where.dataVencimento.lte = new Date(endDate);
      }

      const [total, pendentes, pagas, atrasadas, canceladas] =
        await Promise.all([
          prisma.contribuicao.count({ where }),
          prisma.contribuicao.count({
            where: { ...where, status: "pendente" },
          }),
          prisma.contribuicao.count({ where: { ...where, status: "pago" } }),
          prisma.contribuicao.count({
            where: { ...where, status: "atrasado" },
          }),
          prisma.contribuicao.count({
            where: { ...where, status: "cancelado" },
          }),
        ]);

      const valorTotalPago = await prisma.contribuicao.aggregate({
        where: { ...where, status: "pago" },
        _sum: { valor: true },
      });

      const valorTotalPendente = await prisma.contribuicao.aggregate({
        where: { ...where, status: { in: ["pendente", "atrasado"] } },
        _sum: { valor: true },
      });

      return {
        total,
        pendentes,
        pagas,
        atrasadas,
        canceladas,
        valorTotalPago: valorTotalPago._sum.valor || 0,
        valorTotalPendente: valorTotalPendente._sum.valor || 0,
        taxaAdimplencia: total > 0 ? ((pagas / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      throw new AppError("Erro ao obter estatísticas de contribuições", 500);
    }
  }

  async getRelatorioInadimplencia() {
    try {
      const contribuicoesAtrasadas = await this.getContribuicoesAtrasadas();

      // Agrupar por pessoa e calcular total em atraso
      const inadimplencia = contribuicoesAtrasadas.reduce(
        (acc: any, contrib) => {
          const pessoa = contrib.voluntario || contrib.assistido;
          if (!pessoa) return acc;

          const key = `${contrib.voluntarioId || contrib.assistidoId}_${
            contrib.voluntario ? "voluntario" : "assistido"
          }`;

          if (!acc[key]) {
            acc[key] = {
              pessoa,
              tipo: contrib.voluntario ? "voluntario" : "assistido",
              contribuicoes: [],
              valorTotal: 0,
              diasAtraso: 0,
            };
          }

          const diasAtraso = Math.floor(
            (new Date().getTime() - contrib.dataVencimento.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          acc[key].contribuicoes.push({
            id: contrib.id,
            valor: contrib.valor,
            dataVencimento: contrib.dataVencimento,
            diasAtraso,
          });

          acc[key].valorTotal += Number(contrib.valor);
          acc[key].diasAtraso = Math.max(acc[key].diasAtraso, diasAtraso);

          return acc;
        },
        {}
      );

      return Object.values(inadimplencia).sort(
        (a: any, b: any) => b.valorTotal - a.valorTotal
      );
    } catch (error) {
      throw new AppError("Erro ao gerar relatório de inadimplência", 500);
    }
  }
}
