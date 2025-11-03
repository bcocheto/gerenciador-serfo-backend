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

const router = Router();

// Rotas públicas (para demonstração - remover em produção)
router.get("/statistics", getVoluntarioStatistics);
router.get("/", validateQuery(paginationSchema), getVoluntarios);
router.get("/:id", getVoluntarioById);

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

router.post("/", validateBody(voluntarioCreateSchema), createVoluntario);
router.put("/:id", validateBody(voluntarioUpdateSchema), updateVoluntario);
router.patch("/:id/status", requireAdmin, updateVoluntarioStatus);
router.delete("/:id", requireAdmin, deleteVoluntario);

export default router;
