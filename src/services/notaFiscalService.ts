// src/services/notaFiscalService.ts
import { prisma } from "../config/database.js";
import type {
  NotaFiscalCreate,
  NotaFiscalUpdate,
  PaginationParams,
  DateRangeParams,
} from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class NotaFiscalService {
  async create(data: NotaFiscalCreate) {
    try {
      // Verificar se a contribuição existe e está paga
      const contribuicao = await prisma.contribuicao.findUnique({
        where: { id: data.contribuicaoId },
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

      if (!contribuicao) {
        throw new AppError("Contribuição não encontrada", 404);
      }

      if (contribuicao.status !== "pago") {
        throw new AppError(
          "Apenas contribuições pagas podem gerar nota fiscal",
          400
        );
      }

      // Verificar se já existe nota fiscal para esta contribuição
      const notaExistente = await prisma.notaFiscal.findUnique({
        where: { contribuicaoId: data.contribuicaoId },
      });

      if (notaExistente) {
        throw new AppError(
          "Já existe uma nota fiscal para esta contribuição",
          400
        );
      }

      // Gerar número sequencial da nota fiscal
      const ultimaNota = await prisma.notaFiscal.findFirst({
        orderBy: { numero: "desc" },
        select: { numero: true },
      });

      const proximoNumero = this.gerarProximoNumero(ultimaNota?.numero);

      const createData = {
        numero: proximoNumero,
        contribuicaoId: data.contribuicaoId,
        valor: contribuicao.valor,
        dataEmissao: new Date(),
        observacoes: data.observacoes || null,
      };

      const notaFiscal = await prisma.notaFiscal.create({
        data: createData,
        include: {
          contribuicao: {
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
          },
        },
      });

      return notaFiscal;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar nota fiscal", 500);
    }
  }

  async findAll(
    params: PaginationParams & {
      status?: string;
      numeroNota?: string;
      contribuicaoId?: number;
    } & DateRangeParams
  ) {
    try {
      const {
        page,
        limit,
        orderBy = "dataEmissao",
        orderDirection,
        status,
        numeroNota,
        contribuicaoId,
        startDate,
        endDate,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (numeroNota) {
        where.numero = { contains: numeroNota, mode: "insensitive" };
      }

      if (contribuicaoId) {
        where.contribuicaoId = contribuicaoId;
      }

      if (startDate || endDate) {
        where.dataEmissao = {};
        if (startDate) where.dataEmissao.gte = new Date(startDate);
        if (endDate) where.dataEmissao.lte = new Date(endDate);
      }

      const [notasFiscais, total] = await Promise.all([
        prisma.notaFiscal.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
          include: {
            contribuicao: {
              include: {
                voluntario: {
                  select: { id: true, nomeCompleto: true, email: true },
                },
                assistido: {
                  select: { id: true, nomeCompleto: true, email: true },
                },
              },
            },
          },
        }),
        prisma.notaFiscal.count({ where }),
      ]);

      return {
        data: notasFiscais,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar notas fiscais", 500);
    }
  }

  async findById(id: number) {
    try {
      const notaFiscal = await prisma.notaFiscal.findUnique({
        where: { id },
        include: {
          contribuicao: {
            include: {
              voluntario: {
                select: {
                  id: true,
                  nomeCompleto: true,
                  email: true,
                  telefone: true,
                  endereco: true,
                },
              },
              assistido: {
                select: {
                  id: true,
                  nomeCompleto: true,
                  email: true,
                  telefone: true,
                  endereco: true,
                },
              },
            },
          },
        },
      });

      if (!notaFiscal) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }

      return notaFiscal;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar nota fiscal", 500);
    }
  }

  async findByNumero(numero: string) {
    try {
      const notaFiscal = await prisma.notaFiscal.findUnique({
        where: { numero },
        include: {
          contribuicao: {
            include: {
              voluntario: {
                select: {
                  id: true,
                  nomeCompleto: true,
                  email: true,
                  telefone: true,
                  endereco: true,
                },
              },
              assistido: {
                select: {
                  id: true,
                  nomeCompleto: true,
                  email: true,
                  telefone: true,
                  endereco: true,
                },
              },
            },
          },
        },
      });

      if (!notaFiscal) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }

      return notaFiscal;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar nota fiscal", 500);
    }
  }

  async update(id: number, data: NotaFiscalUpdate) {
    try {
      const existingNota = await prisma.notaFiscal.findUnique({
        where: { id },
      });

      if (!existingNota) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }

      // Não permitir alteração se já está cancelada
      if (existingNota.status === "cancelada" && data.status === "emitida") {
        throw new AppError(
          "Não é possível reativar nota fiscal cancelada",
          400
        );
      }

      const updateData: Record<string, any> = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes || null;

      const notaFiscal = await prisma.notaFiscal.update({
        where: { id },
        data: updateData,
        include: {
          contribuicao: {
            include: {
              voluntario: {
                select: { id: true, nomeCompleto: true, email: true },
              },
              assistido: {
                select: { id: true, nomeCompleto: true, email: true },
              },
            },
          },
        },
      });

      return notaFiscal;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar nota fiscal", 500);
    }
  }

  async cancelar(id: number, motivo?: string) {
    try {
      const existingNota = await prisma.notaFiscal.findUnique({
        where: { id },
      });

      if (!existingNota) {
        throw new AppError("Nota fiscal não encontrada", 404);
      }

      if (existingNota.status === "cancelada") {
        throw new AppError("Nota fiscal já está cancelada", 400);
      }

      const observacoes = motivo
        ? `${
            existingNota.observacoes || ""
          }\n\nCancelada em ${new Date().toLocaleString(
            "pt-BR"
          )}: ${motivo}`.trim()
        : `${
            existingNota.observacoes || ""
          }\n\nCancelada em ${new Date().toLocaleString("pt-BR")}`.trim();

      const notaFiscal = await prisma.notaFiscal.update({
        where: { id },
        data: {
          status: "cancelada",
          observacoes,
        },
        include: {
          contribuicao: {
            include: {
              voluntario: {
                select: { id: true, nomeCompleto: true, email: true },
              },
              assistido: {
                select: { id: true, nomeCompleto: true, email: true },
              },
            },
          },
        },
      });

      return notaFiscal;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao cancelar nota fiscal", 500);
    }
  }

  async gerarPDF(id: number) {
    try {
      const notaFiscal = await this.findById(id);

      if (notaFiscal.status === "cancelada") {
        throw new AppError(
          "Não é possível gerar PDF de nota fiscal cancelada",
          400
        );
      }

      // Aqui seria a lógica para gerar o PDF
      // Por enquanto, vamos simular retornando os dados formatados
      const dadosNota = this.formatarDadosParaPDF(notaFiscal);

      // Simular geração de arquivo
      const nomeArquivo = `NF_${notaFiscal.numero}_${Date.now()}.pdf`;
      const caminhoArquivo = `/uploads/notas-fiscais/${nomeArquivo}`;

      // Atualizar o registro com o caminho do arquivo
      await prisma.notaFiscal.update({
        where: { id },
        data: { arquivo: caminhoArquivo },
      });

      return {
        notaFiscal,
        dadosFormatados: dadosNota,
        arquivo: caminhoArquivo,
        message: "PDF gerado com sucesso",
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao gerar PDF da nota fiscal", 500);
    }
  }

  async gerarNotasFiscaisEmLote(contribuicaoIds: number[]) {
    try {
      if (contribuicaoIds.length === 0) {
        throw new AppError("Lista de contribuições não pode estar vazia", 400);
      }

      const resultados = [];
      const erros = [];

      for (const contribuicaoId of contribuicaoIds) {
        try {
          const notaFiscal = await this.create({ contribuicaoId });
          resultados.push(notaFiscal);
        } catch (error) {
          erros.push({
            contribuicaoId,
            erro:
              error instanceof AppError ? error.message : "Erro desconhecido",
          });
        }
      }

      return {
        notasFiscaisCriadas: resultados,
        erros,
        totalProcessadas: contribuicaoIds.length,
        totalCriadas: resultados.length,
        totalErros: erros.length,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao gerar notas fiscais em lote", 500);
    }
  }

  async getStatistics(params: DateRangeParams = {}) {
    try {
      const { startDate, endDate } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.dataEmissao = {};
        if (startDate) where.dataEmissao.gte = new Date(startDate);
        if (endDate) where.dataEmissao.lte = new Date(endDate);
      }

      const [total, emitidas, canceladas] = await Promise.all([
        prisma.notaFiscal.count({ where }),
        prisma.notaFiscal.count({ where: { ...where, status: "emitida" } }),
        prisma.notaFiscal.count({ where: { ...where, status: "cancelada" } }),
      ]);

      const valorTotal = await prisma.notaFiscal.aggregate({
        where: { ...where, status: "emitida" },
        _sum: { valor: true },
      });

      // Notas por mês
      const notasPorMes = await prisma.notaFiscal.groupBy({
        by: ["dataEmissao"],
        where,
        _count: true,
        _sum: { valor: true },
      });

      const agrupamentoMensal = this.agruparPorMes(notasPorMes);

      return {
        total,
        emitidas,
        canceladas,
        valorTotalEmitido: Number(valorTotal._sum.valor || 0),
        taxaCancelamento:
          total > 0 ? ((canceladas / total) * 100).toFixed(2) : 0,
        notasPorMes: agrupamentoMensal,
      };
    } catch (error) {
      throw new AppError("Erro ao obter estatísticas de notas fiscais", 500);
    }
  }

  async getContribuicoesSemNota() {
    try {
      const contribuicoes = await prisma.contribuicao.findMany({
        where: {
          status: "pago",
          notaFiscal: null,
        },
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true, email: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true, email: true },
          },
        },
        orderBy: { dataPagamento: "desc" },
      });

      return contribuicoes;
    } catch (error) {
      throw new AppError("Erro ao buscar contribuições sem nota fiscal", 500);
    }
  }

  // Métodos auxiliares privados
  private gerarProximoNumero(ultimoNumero?: string): string {
    if (!ultimoNumero) {
      return `NF${new Date().getFullYear()}000001`;
    }

    // Extrair o número sequencial do último número
    const anoAtual = new Date().getFullYear();
    const prefixoAnoAtual = `NF${anoAtual}`;

    if (ultimoNumero.startsWith(prefixoAnoAtual)) {
      const sequencial = parseInt(
        ultimoNumero.substring(prefixoAnoAtual.length)
      );
      const proximoSequencial = (sequencial + 1).toString().padStart(6, "0");
      return `${prefixoAnoAtual}${proximoSequencial}`;
    } else {
      // Se o último número é de outro ano, começar nova sequência
      return `${prefixoAnoAtual}000001`;
    }
  }

  private formatarDadosParaPDF(notaFiscal: any) {
    const pessoa =
      notaFiscal.contribuicao.voluntario || notaFiscal.contribuicao.assistido;

    return {
      nota: {
        numero: notaFiscal.numero,
        dataEmissao: notaFiscal.dataEmissao.toLocaleDateString("pt-BR"),
        valor: Number(notaFiscal.valor),
        status: notaFiscal.status,
      },
      pagador: {
        nome: pessoa?.nomeCompleto || "Não informado",
        email: pessoa?.email || "",
        telefone: pessoa?.telefone || "",
        endereco: pessoa?.endereco || "",
      },
      contribuicao: {
        id: notaFiscal.contribuicao.id,
        dataVencimento:
          notaFiscal.contribuicao.dataVencimento.toLocaleDateString("pt-BR"),
        dataPagamento:
          notaFiscal.contribuicao.dataPagamento?.toLocaleDateString("pt-BR"),
        formaPagamento: notaFiscal.contribuicao.formaPagamento,
        tipo: notaFiscal.contribuicao.voluntarioId ? "Voluntário" : "Assistido",
      },
      observacoes: notaFiscal.observacoes || "",
    };
  }

  private agruparPorMes(dados: any[]) {
    return dados.reduce((acc: any, item) => {
      const mes = new Date(item.dataEmissao).toISOString().slice(0, 7); // YYYY-MM

      if (!acc[mes]) {
        acc[mes] = { quantidade: 0, valor: 0 };
      }

      acc[mes].quantidade += item._count;
      acc[mes].valor += Number(item._sum.valor || 0);

      return acc;
    }, {});
  }
}
