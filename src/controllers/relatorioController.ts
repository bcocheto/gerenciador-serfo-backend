// src/controllers/relatorioController.ts
import type { Request, Response } from "express";
import { RelatorioService } from "../services/relatorioService.js";
import { AppError } from "../middleware/errorHandler.js";
import { dateRangeSchema } from "../config/validations.js";

const relatorioService = new RelatorioService();

export class RelatorioController {
  async getDashboardGeral(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const dashboard = await relatorioService.getDashboardGeral(dateParams);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioReceitas(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const params = {
        ...dateParams,
        categoria: req.query.categoria as string,
        conta: req.query.conta as string,
        agrupamento: (req.query.agrupamento as "dia" | "mes" | "ano") || "mes",
      };

      const relatorio = await relatorioService.getRelatorioReceitas(params);

      res.json({
        success: true,
        data: relatorio,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioDespesas(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const params = {
        ...dateParams,
        categoria: req.query.categoria as string,
        conta: req.query.conta as string,
        agrupamento: (req.query.agrupamento as "dia" | "mes" | "ano") || "mes",
      };

      const relatorio = await relatorioService.getRelatorioDespesas(params);

      res.json({
        success: true,
        data: relatorio,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioContribuicoes(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);
      const params = {
        ...dateParams,
        status: req.query.status as string,
        tipo: req.query.tipo as "voluntario" | "assistido",
      };

      const relatorio = await relatorioService.getRelatorioContribuicoes(
        params
      );

      res.json({
        success: true,
        data: relatorio,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjecaoFinanceira(req: Request, res: Response) {
    try {
      const meses = req.query.meses ? Number(req.query.meses) : 12;

      if (meses < 1 || meses > 60) {
        throw new AppError("Número de meses deve estar entre 1 e 60", 400);
      }

      const projecao = await relatorioService.getProjecaoFinanceira(meses);

      res.json({
        success: true,
        data: projecao,
      });
    } catch (error) {
      throw error;
    }
  }

  async getComparativoMensal(req: Request, res: Response) {
    try {
      const ano = req.query.ano
        ? Number(req.query.ano)
        : new Date().getFullYear();

      if (ano < 2020 || ano > 2030) {
        throw new AppError("Ano deve estar entre 2020 e 2030", 400);
      }

      const comparativo = await relatorioService.getComparativoMensal(ano);

      res.json({
        success: true,
        data: comparativo,
      });
    } catch (error) {
      throw error;
    }
  }

  async getRelatorioCompleto(req: Request, res: Response) {
    try {
      const dateParams = dateRangeSchema.parse(req.query);

      const [dashboard, receitas, despesas, contribuicoes] = await Promise.all([
        relatorioService.getDashboardGeral(dateParams),
        relatorioService.getRelatorioReceitas(dateParams),
        relatorioService.getRelatorioDespesas(dateParams),
        relatorioService.getRelatorioContribuicoes(dateParams),
      ]);

      res.json({
        success: true,
        data: {
          dashboard,
          receitas,
          despesas,
          contribuicoes,
          periodo: {
            inicio: dateParams.startDate || "Início dos registros",
            fim: dateParams.endDate || "Data atual",
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getResumoFinanceiro(req: Request, res: Response) {
    try {
      const { periodo } = req.query;
      let startDate: string | undefined;
      let endDate: string | undefined;

      // Calcular datas baseado no período
      const hoje = new Date();

      switch (periodo) {
        case "hoje":
          startDate = hoje.toISOString().slice(0, 10);
          endDate = hoje.toISOString().slice(0, 10);
          break;
        case "semana":
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          startDate = inicioSemana.toISOString().slice(0, 10);
          endDate = hoje.toISOString().slice(0, 10);
          break;
        case "mes":
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          startDate = inicioMes.toISOString().slice(0, 10);
          endDate = hoje.toISOString().slice(0, 10);
          break;
        case "ano":
          const inicioAno = new Date(hoje.getFullYear(), 0, 1);
          startDate = inicioAno.toISOString().slice(0, 10);
          endDate = hoje.toISOString().slice(0, 10);
          break;
        default:
          startDate = req.query.startDate as string;
          endDate = req.query.endDate as string;
      }

      const dashboard = await relatorioService.getDashboardGeral({
        startDate,
        endDate,
      });

      res.json({
        success: true,
        data: {
          periodo: periodo || "personalizado",
          dataInicio: startDate,
          dataFim: endDate,
          ...dashboard,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getMetricasChave(req: Request, res: Response) {
    try {
      // Métricas dos últimos 30 dias
      const hoje = new Date();
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(hoje.getDate() - 30);

      const dateParams = {
        startDate: trintaDiasAtras.toISOString().slice(0, 10),
        endDate: hoje.toISOString().slice(0, 10),
      };

      const dashboard = await relatorioService.getDashboardGeral(dateParams);

      // Calcular algumas métricas importantes
      const ticketMedioContribuicao =
        dashboard.contribuicoes.total > 0
          ? dashboard.contribuicoes.valorTotalPago /
            dashboard.contribuicoes.total
          : 0;

      const eficienciaArrecadacao =
        Number(dashboard.resumoFinanceiro.totalReceitas) > 0
          ? (dashboard.contribuicoes.valorTotalPago /
              Number(dashboard.resumoFinanceiro.totalReceitas)) *
            100
          : 0;

      res.json({
        success: true,
        data: {
          periodo: "Últimos 30 dias",
          metricas: {
            saldoLiquido: Number(dashboard.resumoFinanceiro.saldoLiquido),
            totalReceitas: Number(dashboard.resumoFinanceiro.totalReceitas),
            totalDespesas: Number(dashboard.resumoFinanceiro.totalDespesas),
            taxaAdimplencia: Number(dashboard.contribuicoes.taxaAdimplencia),
            ticketMedioContribuicao,
            eficienciaArrecadacao: eficienciaArrecadacao.toFixed(2),
            pessoasAtivas:
              dashboard.pessoas.voluntariosAtivos +
              dashboard.pessoas.assistidosAtivos,
          },
          tendencias: {
            // Aqui poderíamos adicionar comparação com período anterior
            crescimentoReceitas: 0, // Implementar depois
            variacaoSaldo: 0, // Implementar depois
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const relatorioController = new RelatorioController();
