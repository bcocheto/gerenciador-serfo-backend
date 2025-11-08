// src/routes/relatorioRoutes.ts
import { Router } from "express";
import { relatorioController } from "../controllers/relatorioController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Dashboard e resumos gerais
router.get(
  "/dashboard",
  relatorioController.getDashboardGeral.bind(relatorioController)
);
router.get(
  "/resumo-financeiro",
  relatorioController.getResumoFinanceiro.bind(relatorioController)
);
router.get(
  "/metricas-chave",
  relatorioController.getMetricasChave.bind(relatorioController)
);
router.get(
  "/atividades-recentes",
  relatorioController.getAtividadesRecentes.bind(relatorioController)
);

// Relatórios específicos
router.get(
  "/receitas",
  relatorioController.getRelatorioReceitas.bind(relatorioController)
);
router.get(
  "/despesas",
  relatorioController.getRelatorioDespesas.bind(relatorioController)
);
router.get(
  "/contribuicoes",
  relatorioController.getRelatorioContribuicoes.bind(relatorioController)
);

// Análises e projeções
router.get(
  "/projecao-financeira",
  relatorioController.getProjecaoFinanceira.bind(relatorioController)
);
router.get(
  "/comparativo-mensal",
  relatorioController.getComparativoMensal.bind(relatorioController)
);

// Relatório completo (todos os dados)
router.get(
  "/completo",
  relatorioController.getRelatorioCompleto.bind(relatorioController)
);

export default router;
