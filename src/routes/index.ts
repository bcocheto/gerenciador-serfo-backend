// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import voluntarioRoutes from "./voluntarioRoutes.js";
import assistidoRoutes from "./assistidoRoutes.js";
import movimentacaoRoutes from "./movimentacaoRoutes.js";
import contribuicaoRoutes from "./contribuicaoRoutes.js";
import relatorioRoutes from "./relatorioRoutes.js";
import notaFiscalRoutes from "./notaFiscalRoutes.js";
import emailRoutes from "./emailRoutes.js";
import sedeRoutes from "./sedeRoutes.js";
import superAdminRoutes from "./superAdminRoutes.js";

const router = Router();

// Definir todas as rotas da API
router.use("/auth", authRoutes);
router.use("/voluntarios", voluntarioRoutes);
router.use("/assistidos", assistidoRoutes);
router.use("/movimentacoes", movimentacaoRoutes);
router.use("/contribuicoes", contribuicaoRoutes);
router.use("/relatorios", relatorioRoutes);
router.use("/notas-fiscais", notaFiscalRoutes);
router.use("/emails", emailRoutes);
router.use("/sedes", sedeRoutes);
router.use("/super-admin", superAdminRoutes);

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
      notasFiscais: "/api/v1/notas-fiscais",
      emails: "/api/v1/emails",
      sedes: "/api/v1/sedes",
      superAdmin: "/api/v1/super-admin",
    },
  });
});

export default router;
