// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Importações locais
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega as variáveis de ambiente do .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP a cada 15 minutos
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em 15 minutos.",
  },
});

// Middlewares de segurança
app.use(helmet()); // Define vários headers de segurança
app.use(limiter); // Rate limiting
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json({ limit: "10mb" })); // Permite que o Express entenda JSON
app.use(express.urlencoded({ extended: true })); // Para formulários

// Middleware de logging (desenvolvimento)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API
app.use("/api/v1", routes);

// Rota de teste básica
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API do Gerenciador SERFO está no ar!",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      voluntarios: "/api/v1/voluntarios",
      assistidos: "/api/v1/assistidos",
      movimentacoes: "/api/v1/movimentacoes",
      contribuicoes: "/api/v1/contribuicoes",
      relatorios: "/api/v1/relatorios",
      notasFiscais: "/api/v1/notas-fiscais",
      docs: "/api/v1/docs", // Para futura documentação
    },
  });
});

// Middlewares de tratamento de erros (devem estar no final)
app.use(notFoundHandler);
app.use(errorHandler);

// Função para iniciar o servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDatabase();

    // Iniciar o servidor
    app.listen(port, () => {
      console.log(`🚀 Servidor rodando na porta ${port}`);
      console.log(`📡 API disponível em: http://localhost:${port}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${port}/api/v1/health`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await disconnectDatabase();
  process.exit(0);
});

// Iniciar servidor
startServer();
