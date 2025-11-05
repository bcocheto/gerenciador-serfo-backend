// src/routes/notaFiscalRoutes.ts
import { Router } from "express";
import { notaFiscalController } from "../controllers/notaFiscalController.js";
import { validateBody } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas de consulta e relatórios
router.get(
  "/statistics",
  notaFiscalController.getStatistics.bind(notaFiscalController)
);
router.get(
  "/contribuicoes-sem-nota",
  notaFiscalController.getContribuicoesSemNota.bind(notaFiscalController)
);
router.get(
  "/relatorio-mensal",
  notaFiscalController.getRelatorioMensal.bind(notaFiscalController)
);
router.get(
  "/numero/:numero",
  notaFiscalController.findByNumero.bind(notaFiscalController)
);
router.get("/", notaFiscalController.findAll.bind(notaFiscalController));

// Rotas básicas CRUD
router.post(
  "/",
  validateBody,
  notaFiscalController.create.bind(notaFiscalController)
);
router.get("/:id", notaFiscalController.findById.bind(notaFiscalController));
router.put(
  "/:id",
  validateBody,
  notaFiscalController.update.bind(notaFiscalController)
);

// Rotas específicas de ações
router.post(
  "/gerar-lote",
  notaFiscalController.gerarNotasFiscaisEmLote.bind(notaFiscalController)
);
router.post(
  "/:id/cancelar",
  notaFiscalController.cancelar.bind(notaFiscalController)
);
router.post(
  "/:id/gerar-pdf",
  notaFiscalController.gerarPDF.bind(notaFiscalController)
);
router.get(
  "/:id/download-pdf",
  notaFiscalController.downloadPDF.bind(notaFiscalController)
);
router.post(
  "/:id/reenviar-email",
  notaFiscalController.reenviarPorEmail.bind(notaFiscalController)
);

export default router;
