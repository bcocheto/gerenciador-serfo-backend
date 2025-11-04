// src/routes/movimentacaoRoutes.ts
import { Router } from "express";
import {
  createMovimentacao,
  getMovimentacoes,
  getMovimentacaoById,
  updateMovimentacao,
  deleteMovimentacao,
  getResumoFinanceiro,
  getRelatorioPorCategoria,
  getRelatorioPorConta,
  getCategorias,
  getContas,
  getMovimentacaoStatistics,
} from "../controllers/movimentacaoController.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  movimentacaoCreateSchema,
  movimentacaoUpdateSchema,
  paginationSchema,
  dateRangeSchema,
} from "../config/validations.js";
import { z } from "zod";

const router = Router();

// Schema para validar parâmetros de consulta específicos de movimentações
const movimentacaoQuerySchema = paginationSchema
  .extend({
    tipo: z.enum(["entrada", "saida"]).optional(),
    categoria: z.string().optional(),
    conta: z.string().optional(),
    search: z.string().optional(),
    valorMin: z.coerce.number().positive().optional(),
    valorMax: z.coerce.number().positive().optional(),
  })
  .merge(dateRangeSchema);

// Schema para relatórios
const relatorioQuerySchema = dateRangeSchema.extend({
  tipo: z.enum(["entrada", "saida"]).optional(),
  conta: z.string().optional(),
});

// Rotas públicas de consulta (para demonstração - remover em produção)
router.get(
  "/statistics",
  validateQuery(dateRangeSchema.partial()),
  getMovimentacaoStatistics
);
router.get("/resumo", validateQuery(relatorioQuerySchema), getResumoFinanceiro);
router.get(
  "/relatorio/categoria",
  validateQuery(relatorioQuerySchema),
  getRelatorioPorCategoria
);
router.get(
  "/relatorio/conta",
  validateQuery(dateRangeSchema.partial()),
  getRelatorioPorConta
);
router.get("/categorias", getCategorias);
router.get("/contas", getContas);
router.get("/", validateQuery(movimentacaoQuerySchema), getMovimentacoes);
router.get("/:id", getMovimentacaoById);

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

router.post("/", validateBody(movimentacaoCreateSchema), createMovimentacao);
router.put("/:id", validateBody(movimentacaoUpdateSchema), updateMovimentacao);
router.delete("/:id", requireAdmin, deleteMovimentacao);

export default router;
