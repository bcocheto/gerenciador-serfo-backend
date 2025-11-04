// src/routes/assistidoRoutes.ts
import { Router } from "express";
import {
  createAssistido,
  getAssistidos,
  getAssistidoById,
  updateAssistido,
  deleteAssistido,
  updateAssistidoStatus,
  updateValorMensal,
  getAssistidoStatistics,
  getAssistidosByDiaVencimento,
} from "../controllers/assistidoController.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  assistidoCreateSchema,
  assistidoUpdateSchema,
  paginationSchema,
} from "../config/validations.js";
import { z } from "zod";

const router = Router();

// Schema para validar parâmetros de consulta específicos de assistidos
const assistidoQuerySchema = paginationSchema.extend({
  status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
  search: z.string().optional(),
  valorMin: z.coerce.number().positive().optional(),
  valorMax: z.coerce.number().positive().optional(),
});

// Schema para atualização de status
const statusUpdateSchema = z.object({
  status: z.enum(["ativo", "inativo", "suspenso"]),
});

// Schema para atualização de valor mensal
const valorMensalUpdateSchema = z.object({
  valorMensal: z.number().positive("Valor mensal deve ser positivo"),
});

// Rotas públicas (para demonstração - remover em produção)
router.get("/statistics", getAssistidoStatistics);
router.get("/vencimento/:dia", getAssistidosByDiaVencimento);
router.get("/", validateQuery(assistidoQuerySchema), getAssistidos);
router.get("/:id", getAssistidoById);

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

router.post("/", validateBody(assistidoCreateSchema), createAssistido);
router.put("/:id", validateBody(assistidoUpdateSchema), updateAssistido);
router.patch(
  "/:id/status",
  validateBody(statusUpdateSchema),
  requireAdmin,
  updateAssistidoStatus
);
router.patch(
  "/:id/valor",
  validateBody(valorMensalUpdateSchema),
  updateValorMensal
);
router.delete("/:id", requireAdmin, deleteAssistido);

export default router;
