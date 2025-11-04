// src/routes/index.ts
import { Router } from "express";
import voluntarioRoutes from "./voluntarioRoutes.js";
import assistidoRoutes from "./assistidoRoutes.js";
import movimentacaoRoutes from "./movimentacaoRoutes.js";

const router = Router();

// Definir todas as rotas da API
router.use("/voluntarios", voluntarioRoutes);
router.use("/assistidos", assistidoRoutes);
router.use("/movimentacoes", movimentacaoRoutes);

// Rota de health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API Gerenciador SERFO está funcionando!",
    timestamp: new Date().toISOString(),
    endpoints: {
      voluntarios: "/api/v1/voluntarios",
      assistidos: "/api/v1/assistidos",
      movimentacoes: "/api/v1/movimentacoes",
    },
  });
});

export default router;
