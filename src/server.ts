// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega as variáveis de ambiente do .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (ex: seu frontend React)
app.use(express.json()); // Permite que o Express entenda JSON no corpo das requisições

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do Gerenciador SERFO está no ar!");
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
