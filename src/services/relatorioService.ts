// src/services/relatorioService.ts
import { prisma } from "../config/database.js";
import type { DateRangeParams } from "../config/validations.js";
import { AppError } from "../middleware/errorHandler.js";

export class RelatorioService {
  async getDashboardGeral(params: DateRangeParams = {}) {
    try {
      const { startDate, endDate } = params;

      // Construir filtros de data
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.data = {};
        if (startDate) dateFilter.data.gte = new Date(startDate);
        if (endDate) dateFilter.data.lte = new Date(endDate);
      }

      const contribuicaoDateFilter: any = {};
      if (startDate || endDate) {
        contribuicaoDateFilter.dataVencimento = {};
        if (startDate)
          contribuicaoDateFilter.dataVencimento.gte = new Date(startDate);
        if (endDate)
          contribuicaoDateFilter.dataVencimento.lte = new Date(endDate);
      }

      // Buscar dados financeiros das movimentações
      const [
        totalEntradas,
        totalSaidas,
        movimentacoesPorCategoria,
        movimentacoesPorConta,
        voluntariosAtivos,
        assistidosAtivos,
        contribuicoesStats,
        movimentacoesRecentes,
      ] = await Promise.all([
        // Total de entradas
        prisma.movimentacao.aggregate({
          where: { ...dateFilter, tipo: "entrada" },
          _sum: { valor: true },
          _count: true,
        }),

        // Total de saídas
        prisma.movimentacao.aggregate({
          where: { ...dateFilter, tipo: "saida" },
          _sum: { valor: true },
          _count: true,
        }),

        // Movimentações por categoria
        prisma.movimentacao.groupBy({
          by: ["categoria", "tipo"],
          where: dateFilter,
          _sum: { valor: true },
          _count: true,
        }),

        // Movimentações por conta
        prisma.movimentacao.groupBy({
          by: ["conta", "tipo"],
          where: dateFilter,
          _sum: { valor: true },
          _count: true,
        }),

        // Voluntários ativos
        prisma.voluntario.count({
          where: { status: "ativo" },
        }),

        // Assistidos ativos
        prisma.assistido.count({
          where: { status: "ativo" },
        }),

        // Estatísticas de contribuições
        this.getContribuicoesResumo(contribuicaoDateFilter),

        // Movimentações recentes
        prisma.movimentacao.findMany({
          where: dateFilter,
          orderBy: { data: "desc" },
          take: 10,
          select: {
            id: true,
            data: true,
            descricao: true,
            valor: true,
            tipo: true,
            categoria: true,
            conta: true,
          },
        }),
      ]);

      // Calcular valores
      const totalReceitas = totalEntradas._sum.valor || 0;
      const totalDespesas = totalSaidas._sum.valor || 0;
      const saldoLiquido = Number(totalReceitas) - Number(totalDespesas);

      // Organizar dados por categoria
      const categorias = this.organizarPorCategoria(movimentacoesPorCategoria);
      const contas = this.organizarPorConta(movimentacoesPorConta);

      return {
        resumoFinanceiro: {
          totalReceitas,
          totalDespesas,
          saldoLiquido,
          qtdEntradas: totalEntradas._count,
          qtdSaidas: totalSaidas._count,
        },
        pessoas: {
          voluntariosAtivos,
          assistidosAtivos,
        },
        contribuicoes: contribuicoesStats,
        categorias,
        contas,
        movimentacoesRecentes,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar dashboard geral", 500);
    }
  }

  async getRelatorioReceitas(
    params: DateRangeParams & {
      categoria?: string;
      conta?: string;
      agrupamento?: "dia" | "mes" | "ano";
    }
  ) {
    try {
      const {
        startDate,
        endDate,
        categoria,
        conta,
        agrupamento = "mes",
      } = params;

      const where: any = { tipo: "entrada" };

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      if (categoria) where.categoria = categoria;
      if (conta) where.conta = conta;

      // Buscar receitas
      const receitas = await prisma.movimentacao.findMany({
        where,
        orderBy: { data: "desc" },
        select: {
          id: true,
          data: true,
          descricao: true,
          valor: true,
          categoria: true,
          conta: true,
          favorecidoPagador: true,
          contribuicaoId: true,
        },
      });

      // Agrupar por período
      const receitasAgrupadas = this.agruparPorPeriodo(receitas, agrupamento);

      // Estatísticas
      const totalReceitas = receitas.reduce(
        (sum, r) => sum + Number(r.valor),
        0
      );
      const mediaReceitas =
        receitas.length > 0 ? totalReceitas / receitas.length : 0;

      // Receitas por categoria
      const receitasPorCategoria = receitas.reduce((acc: any, receita) => {
        if (!acc[receita.categoria]) {
          acc[receita.categoria] = { total: 0, quantidade: 0 };
        }
        acc[receita.categoria].total += Number(receita.valor);
        acc[receita.categoria].quantidade += 1;
        return acc;
      }, {});

      return {
        resumo: {
          totalReceitas,
          mediaReceitas,
          quantidadeTransacoes: receitas.length,
        },
        receitasPorCategoria,
        receitasAgrupadas,
        detalhes: receitas,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar relatório de receitas", 500);
    }
  }

  async getRelatorioDespesas(
    params: DateRangeParams & {
      categoria?: string;
      conta?: string;
      agrupamento?: "dia" | "mes" | "ano";
    }
  ) {
    try {
      const {
        startDate,
        endDate,
        categoria,
        conta,
        agrupamento = "mes",
      } = params;

      const where: any = { tipo: "saida" };

      if (startDate || endDate) {
        where.data = {};
        if (startDate) where.data.gte = new Date(startDate);
        if (endDate) where.data.lte = new Date(endDate);
      }

      if (categoria) where.categoria = categoria;
      if (conta) where.conta = conta;

      // Buscar despesas
      const despesas = await prisma.movimentacao.findMany({
        where,
        orderBy: { data: "desc" },
        select: {
          id: true,
          data: true,
          descricao: true,
          valor: true,
          categoria: true,
          conta: true,
          favorecidoPagador: true,
        },
      });

      // Agrupar por período
      const despesasAgrupadas = this.agruparPorPeriodo(despesas, agrupamento);

      // Estatísticas
      const totalDespesas = despesas.reduce(
        (sum, d) => sum + Number(d.valor),
        0
      );
      const mediaDespesas =
        despesas.length > 0 ? totalDespesas / despesas.length : 0;

      // Despesas por categoria
      const despesasPorCategoria = despesas.reduce((acc: any, despesa) => {
        if (!acc[despesa.categoria]) {
          acc[despesa.categoria] = { total: 0, quantidade: 0 };
        }
        acc[despesa.categoria].total += Number(despesa.valor);
        acc[despesa.categoria].quantidade += 1;
        return acc;
      }, {});

      return {
        resumo: {
          totalDespesas,
          mediaDespesas,
          quantidadeTransacoes: despesas.length,
        },
        despesasPorCategoria,
        despesasAgrupadas,
        detalhes: despesas,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar relatório de despesas", 500);
    }
  }

  async getRelatorioContribuicoes(
    params: DateRangeParams & {
      status?: string;
      tipo?: "voluntario" | "assistido";
    }
  ) {
    try {
      const { startDate, endDate, status, tipo } = params;

      const where: any = {};

      if (startDate || endDate) {
        where.dataVencimento = {};
        if (startDate) where.dataVencimento.gte = new Date(startDate);
        if (endDate) where.dataVencimento.lte = new Date(endDate);
      }

      if (status) where.status = status;
      if (tipo === "voluntario") where.voluntarioId = { not: null };
      if (tipo === "assistido") where.assistidoId = { not: null };

      // Buscar contribuições
      const contribuicoes = await prisma.contribuicao.findMany({
        where,
        include: {
          voluntario: {
            select: { id: true, nomeCompleto: true },
          },
          assistido: {
            select: { id: true, nomeCompleto: true },
          },
        },
        orderBy: { dataVencimento: "desc" },
      });

      // Estatísticas gerais
      const totalContribuicoes = contribuicoes.length;
      const valorTotal = contribuicoes.reduce(
        (sum, c) => sum + Number(c.valor),
        0
      );
      const valorPago = contribuicoes
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + Number(c.valor), 0);
      const valorPendente = contribuicoes
        .filter((c) => ["pendente", "atrasado"].includes(c.status))
        .reduce((sum, c) => sum + Number(c.valor), 0);

      // Agrupar por status
      const contribuicoesPorStatus = contribuicoes.reduce(
        (acc: any, contrib) => {
          if (!acc[contrib.status]) {
            acc[contrib.status] = { quantidade: 0, valor: 0 };
          }
          acc[contrib.status].quantidade += 1;
          acc[contrib.status].valor += Number(contrib.valor);
          return acc;
        },
        {}
      );

      // Agrupar por tipo (voluntário/assistido)
      const contribuicoesPorTipo = {
        voluntarios: {
          quantidade: contribuicoes.filter((c) => c.voluntarioId).length,
          valor: contribuicoes
            .filter((c) => c.voluntarioId)
            .reduce((sum, c) => sum + Number(c.valor), 0),
        },
        assistidos: {
          quantidade: contribuicoes.filter((c) => c.assistidoId).length,
          valor: contribuicoes
            .filter((c) => c.assistidoId)
            .reduce((sum, c) => sum + Number(c.valor), 0),
        },
      };

      // Taxa de adimplência
      const taxaAdimplencia =
        totalContribuicoes > 0
          ? (
              ((contribuicoesPorStatus.pago?.quantidade || 0) /
                totalContribuicoes) *
              100
            ).toFixed(2)
          : 0;

      return {
        resumo: {
          totalContribuicoes,
          valorTotal,
          valorPago,
          valorPendente,
          taxaAdimplencia: Number(taxaAdimplencia),
        },
        contribuicoesPorStatus,
        contribuicoesPorTipo,
        detalhes: contribuicoes,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar relatório de contribuições", 500);
    }
  }

  async getProjecaoFinanceira(meses: number = 12) {
    try {
      // Buscar histórico dos últimos meses para calcular médias
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - meses);

      const [historicoReceitas, historicoDespesas, assistidosAtivos] =
        await Promise.all([
          // Receitas mensais históricas
          prisma.movimentacao.groupBy({
            by: ["data"],
            where: {
              tipo: "entrada",
              data: { gte: dataInicio },
            },
            _sum: { valor: true },
          }),

          // Despesas mensais históricas
          prisma.movimentacao.groupBy({
            by: ["data"],
            where: {
              tipo: "saida",
              data: { gte: dataInicio },
            },
            _sum: { valor: true },
          }),

          // Assistidos ativos para projeção de contribuições
          prisma.assistido.findMany({
            where: { status: "ativo" },
            select: { valorMensal: true },
          }),
        ]);

      // Calcular médias mensais
      const receitasPorMes = this.calcularMediaMensal(historicoReceitas);
      const despesasPorMes = this.calcularMediaMensal(historicoDespesas);

      // Projeção de contribuições mensais
      const contribuicoesMensaisEsperadas = assistidosAtivos.reduce(
        (sum, assistido) => sum + Number(assistido.valorMensal),
        0
      );

      // Gerar projeções para os próximos meses
      const projecoes = [];
      for (let i = 1; i <= meses; i++) {
        const data = new Date();
        data.setMonth(data.getMonth() + i);

        projecoes.push({
          mes: data.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
          data: data.toISOString().slice(0, 7), // YYYY-MM
          receitaProjetada: receitasPorMes,
          despesaProjetada: despesasPorMes,
          contribuicoesEsperadas: contribuicoesMensaisEsperadas,
          saldoProjetado: receitasPorMes - despesasPorMes,
        });
      }

      return {
        baseDados: {
          periodoBases: `${meses} meses`,
          receitaMediaMensal: receitasPorMes,
          despesaMediaMensal: despesasPorMes,
          contribuicoesEsperadasMes: contribuicoesMensaisEsperadas,
        },
        projecoes,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar projeção financeira", 500);
    }
  }

  async getComparativoMensal(ano: number) {
    try {
      const comparativo = [];

      for (let mes = 1; mes <= 12; mes++) {
        const inicioMes = new Date(ano, mes - 1, 1);
        const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

        const [receitas, despesas, contribuicoes] = await Promise.all([
          prisma.movimentacao.aggregate({
            where: {
              tipo: "entrada",
              data: { gte: inicioMes, lte: fimMes },
            },
            _sum: { valor: true },
            _count: true,
          }),

          prisma.movimentacao.aggregate({
            where: {
              tipo: "saida",
              data: { gte: inicioMes, lte: fimMes },
            },
            _sum: { valor: true },
            _count: true,
          }),

          prisma.contribuicao.aggregate({
            where: {
              dataVencimento: { gte: inicioMes, lte: fimMes },
              status: "pago",
            },
            _sum: { valor: true },
            _count: true,
          }),
        ]);

        const totalReceitas = Number(receitas._sum.valor || 0);
        const totalDespesas = Number(despesas._sum.valor || 0);
        const totalContribuicoes = Number(contribuicoes._sum.valor || 0);

        comparativo.push({
          mes,
          nomeMes: new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
            month: "long",
          }),
          receitas: {
            valor: totalReceitas,
            quantidade: receitas._count,
          },
          despesas: {
            valor: totalDespesas,
            quantidade: despesas._count,
          },
          contribuicoes: {
            valor: totalContribuicoes,
            quantidade: contribuicoes._count,
          },
          saldo: totalReceitas - totalDespesas,
        });
      }

      // Calcular totais anuais
      const totaisAnuais = comparativo.reduce(
        (acc, mes) => ({
          receitas: acc.receitas + mes.receitas.valor,
          despesas: acc.despesas + mes.despesas.valor,
          contribuicoes: acc.contribuicoes + mes.contribuicoes.valor,
          saldo: acc.saldo + mes.saldo,
        }),
        { receitas: 0, despesas: 0, contribuicoes: 0, saldo: 0 }
      );

      return {
        ano,
        comparativo,
        totaisAnuais,
      };
    } catch (error) {
      throw new AppError("Erro ao gerar comparativo mensal", 500);
    }
  }

  // Métodos auxiliares privados
  private async getContribuicoesResumo(dateFilter: any) {
    const [total, pendentes, pagas, atrasadas] = await Promise.all([
      prisma.contribuicao.count({ where: dateFilter }),
      prisma.contribuicao.count({
        where: { ...dateFilter, status: "pendente" },
      }),
      prisma.contribuicao.count({ where: { ...dateFilter, status: "pago" } }),
      prisma.contribuicao.count({
        where: { ...dateFilter, status: "atrasado" },
      }),
    ]);

    const valorPago = await prisma.contribuicao.aggregate({
      where: { ...dateFilter, status: "pago" },
      _sum: { valor: true },
    });

    return {
      total,
      pendentes,
      pagas,
      atrasadas,
      valorTotalPago: Number(valorPago._sum.valor || 0),
      taxaAdimplencia: total > 0 ? ((pagas / total) * 100).toFixed(2) : 0,
    };
  }

  private organizarPorCategoria(movimentacoes: any[]) {
    return movimentacoes.reduce((acc: any, mov) => {
      if (!acc[mov.categoria]) {
        acc[mov.categoria] = { entradas: 0, saidas: 0 };
      }

      if (mov.tipo === "entrada") {
        acc[mov.categoria].entradas += Number(mov._sum.valor || 0);
      } else {
        acc[mov.categoria].saidas += Number(mov._sum.valor || 0);
      }

      return acc;
    }, {});
  }

  private organizarPorConta(movimentacoes: any[]) {
    return movimentacoes.reduce((acc: any, mov) => {
      if (!acc[mov.conta]) {
        acc[mov.conta] = { entradas: 0, saidas: 0 };
      }

      if (mov.tipo === "entrada") {
        acc[mov.conta].entradas += Number(mov._sum.valor || 0);
      } else {
        acc[mov.conta].saidas += Number(mov._sum.valor || 0);
      }

      return acc;
    }, {});
  }

  private agruparPorPeriodo(dados: any[], agrupamento: "dia" | "mes" | "ano") {
    return dados.reduce((acc: any, item) => {
      let chave: string;
      const data = new Date(item.data);

      switch (agrupamento) {
        case "dia":
          chave = data.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case "mes":
          chave = data.toISOString().slice(0, 7); // YYYY-MM
          break;
        case "ano":
          chave = data.getFullYear().toString(); // YYYY
          break;
        default:
          chave = data.toISOString().slice(0, 7);
      }

      if (!acc[chave]) {
        acc[chave] = { valor: 0, quantidade: 0, itens: [] };
      }

      acc[chave].valor += Number(item.valor);
      acc[chave].quantidade += 1;
      acc[chave].itens.push(item);

      return acc;
    }, {});
  }

  private calcularMediaMensal(dados: any[]): number {
    if (dados.length === 0) return 0;

    const totalValor = dados.reduce(
      (sum, item) => sum + Number(item._sum.valor || 0),
      0
    );
    return totalValor / dados.length;
  }
}
