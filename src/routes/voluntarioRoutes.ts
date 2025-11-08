// src/routes/voluntarioRoutes.ts
import { Router } from "express";
import {
  createVoluntario,
  getVoluntarios,
  getVoluntarioById,
  updateVoluntario,
  deleteVoluntario,
  updateVoluntarioStatus,
  getVoluntarioStatistics,
} from "../controllers/voluntarioController.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  voluntarioCreateSchema,
  voluntarioUpdateSchema,
  paginationSchema,
} from "../config/validations.js";
import { z } from "zod";

const router = Router();

// Schema para validar parâmetros de consulta específicos de voluntários
const voluntarioQuerySchema = paginationSchema.extend({
  status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
  search: z.string().optional(),
  sedeId: z.coerce.number().positive().optional(),
  cargo: z
    .enum([
      "VOLUNTARIO",
      "SECRETARIO",
      "TESOUREIRO",
      "PRESIDENTE",
      "SUPER_ADMIN",
    ])
    .optional(),
});

// Rotas públicas (para demonstração - remover em produção)
router.get("/statistics", getVoluntarioStatistics);
router.get("/", validateQuery(voluntarioQuerySchema), getVoluntarios);
router.get("/:id", getVoluntarioById);

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

router.post("/", validateBody(voluntarioCreateSchema), createVoluntario);
router.put("/:id", validateBody(voluntarioUpdateSchema), updateVoluntario);
router.patch("/:id/status", requireAdmin, updateVoluntarioStatus);
router.delete("/:id", requireAdmin, deleteVoluntario);

export default router;
