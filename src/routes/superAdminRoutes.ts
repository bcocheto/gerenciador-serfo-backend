import { Router } from "express";
import {
  getAllUsers,
  createUserInAnySede,
  updateUserAnySede,
  deleteUserAnySede,
  transferUserToSede,
  getAllAssistidos,
  createAssistidoInAnySede,
  updateAssistidoAnySede,
  deleteAssistidoAnySede,
  createSedeAdmin,
  updateSedeAdmin,
  deleteSedeAdmin,
  getDashboardStats,
  getActivityLogs,
} from "../controllers/superAdminController.js";
import { validateBody, validateQuery } from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireSuperAdmin } from "../middleware/superAdminAuth.js";
import {
  voluntarioCreateSchema,
  voluntarioUpdateSchema,
  assistidoCreateSchema,
  assistidoUpdateSchema,
  sedeCreateSchema,
  sedeUpdateSchema,
  paginationSchema,
} from "../config/validations.js";
import { z } from "zod";

const router = Router();

// Todas as rotas requerem autenticação e cargo de Super Admin
router.use(authenticateToken);
router.use(requireSuperAdmin);

// ========== DASHBOARD ==========
router.get("/dashboard", getDashboardStats);

// ========== GESTÃO DE USUÁRIOS ==========
const userQuerySchema = paginationSchema.extend({
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
  ativo: z.coerce.boolean().optional(),
});

const userCreateWithPasswordSchema = voluntarioCreateSchema.extend({
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),
});

const transferUserSchema = z.object({
  newSedeId: z.number().positive("Sede de destino é obrigatória"),
});

router.get("/users", validateQuery(userQuerySchema), getAllUsers);
router.post(
  "/users",
  validateBody(userCreateWithPasswordSchema),
  createUserInAnySede
);
router.put(
  "/users/:id",
  validateBody(voluntarioUpdateSchema),
  updateUserAnySede
);
router.delete("/users/:id", deleteUserAnySede);
router.patch(
  "/users/:userId/transfer",
  validateBody(transferUserSchema),
  transferUserToSede
);

// ========== GESTÃO DE ASSISTIDOS ==========
const assistidoQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sedeId: z.coerce.number().positive().optional(),
  status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
  valorMin: z.coerce.number().positive().optional(),
  valorMax: z.coerce.number().positive().optional(),
});

router.get(
  "/assistidos",
  validateQuery(assistidoQuerySchema),
  getAllAssistidos
);
router.post(
  "/assistidos",
  validateBody(assistidoCreateSchema),
  createAssistidoInAnySede
);
router.put(
  "/assistidos/:id",
  validateBody(assistidoUpdateSchema),
  updateAssistidoAnySede
);
router.delete("/assistidos/:id", deleteAssistidoAnySede);

// ========== GESTÃO DE SEDES ==========
router.post("/sedes", validateBody(sedeCreateSchema), createSedeAdmin);
router.put("/sedes/:id", validateBody(sedeUpdateSchema), updateSedeAdmin);
router.delete("/sedes/:id", deleteSedeAdmin);

// ========== AUDITORIA ==========
const auditQuerySchema = paginationSchema.extend({
  sedeId: z.coerce.number().positive().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

router.get("/activity-logs", validateQuery(auditQuerySchema), getActivityLogs);

export default router;
