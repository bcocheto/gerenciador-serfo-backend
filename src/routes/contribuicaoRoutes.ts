// src/routes/contribuicaoRoutes.ts
import { Router } from "express";
import { contribuicaoController } from "../controllers/contribuicaoController.js";
import { validateBody } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas básicas CRUD
router.post(
  "/",
  validateBody,
  contribuicaoController.create.bind(contribuicaoController)
);
router.get("/", contribuicaoController.findAll.bind(contribuicaoController));
router.get(
  "/statistics",
  contribuicaoController.getStatistics.bind(contribuicaoController)
);
router.get(
  "/pendentes",
  contribuicaoController.getContribuicoesPendentes.bind(contribuicaoController)
);
router.get(
  "/atrasadas",
  contribuicaoController.getContribuicoesAtrasadas.bind(contribuicaoController)
);
router.get(
  "/relatorio-inadimplencia",
  contribuicaoController.getRelatorioInadimplencia.bind(contribuicaoController)
);
router.get(
  "/mes",
  contribuicaoController.getContribuicoesMes.bind(contribuicaoController)
);
router.get(
  "/:id",
  contribuicaoController.findById.bind(contribuicaoController)
);
router.put(
  "/:id",
  validateBody,
  contribuicaoController.update.bind(contribuicaoController)
);
router.delete(
  "/:id",
  contribuicaoController.delete.bind(contribuicaoController)
);

// Rotas específicas de negócio
router.post(
  "/gerar-mensais",
  contribuicaoController.gerarContribuicoesMensais.bind(contribuicaoController)
);
router.post(
  "/:id/processar-pagamento",
  contribuicaoController.processarPagamento.bind(contribuicaoController)
);
router.patch(
  "/marcar-atrasadas",
  contribuicaoController.marcarContribuicoesAtrasadas.bind(
    contribuicaoController
  )
);

export default router;
