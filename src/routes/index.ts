// src/routes/index.ts
import { Router } from "express";
import voluntarioRoutes from "./voluntarioRoutes.js";
import assistidoRoutes from "./assistidoRoutes.js";
import movimentacaoRoutes from "./movimentacaoRoutes.js";
import contribuicaoRoutes from "./contribuicaoRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";

const router = Router();

// Definir todas as rotas da API
router.use("/voluntarios", voluntarioRoutes);
router.use("/assistidos", assistidoRoutes);
router.use("/movimentacoes", movimentacaoRoutes);
router.use("/contribuicoes", contribuicaoRoutes);
router.use("/relatorios", relatorioRoutes);

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
      contribuicoes: "/api/v1/contribuicoes",
      relatorios: "/api/v1/relatorios",
    },
  });
});

export default router;
