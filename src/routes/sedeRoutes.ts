import { Router } from "express";
import {
  createSede,
  getSedes,
  getSedeById,
  updateSede,
  deleteSede,
  toggleSedeStatus,
  getSedesAtivas,
  getSedeStatistics,
} from "../controllers/sedeController.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import {
  sedeCreateSchema,
  sedeUpdateSchema,
  paginationSchema,
} from "../config/validations.js";
import { z } from "zod";

const router = Router();

// Schema para validar parâmetros de consulta específicos de sedes
const sedeQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
  nome: z.string().optional(),
});

// Rotas públicas (para demonstração - adicionar auth em produção)
router.get("/statistics", getSedeStatistics);
router.get("/", validateQuery(sedeQuerySchema), getSedes);
router.get("/ativas", getSedesAtivas);
router.get("/:id", getSedeById);

// Rotas que requerem autenticação (descomente quando implementar auth)
router.post("/", validateBody(sedeCreateSchema), createSede);
router.put("/:id", validateBody(sedeUpdateSchema), updateSede);
router.patch("/:id/toggle-status", toggleSedeStatus);
router.delete("/:id", deleteSede);

export default router;
