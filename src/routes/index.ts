// src/routes/index.ts
import { Router } from "express";
import voluntarioRoutes from "./voluntarioRoutes.js";

const router = Router();

// Definir todas as rotas da API
router.use("/voluntarios", voluntarioRoutes);

// Rota de health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Gerenciador SERFO está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
