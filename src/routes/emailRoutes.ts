// src/routes/emailRoutes.ts
import { Router } from "express";
import { emailController } from "../controllers/emailController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ROTAS DE EMAIL

// Enviar email individual
router.post(
  "/enviar",
  authorize(["admin", "secretario"]),
  emailController.enviarEmail
);

// Enviar emails em lote
router.post(
  "/enviar-lote",
  authorize(["admin", "secretario"]),
  emailController.enviarEmailLote
);

// Processar emails agendados (rota para automação)
router.post(
  "/processar-agendados",
  authorize(["admin"]),
  emailController.processarEmailsAgendados
);

// Obter logs de email
router.get(
  "/logs",
  authorize(["admin", "secretario"]),
  emailController.obterLogsEmail
);

// Reenviar email por ID do log
router.post(
  "/logs/:id/reenviar",
  authorize(["admin", "secretario"]),
  emailController.reenviarEmail
);

// Testar conexão de email
router.get(
  "/testar-conexao",
  authorize(["admin"]),
  emailController.testarConexao
);

// ROTAS DE TEMPLATES

// Criar template
router.post(
  "/templates",
  authorize(["admin", "secretario"]),
  emailController.criarTemplate
);

// Listar templates
router.get(
  "/templates",
  authorize(["admin", "secretario", "tesoureiro"]),
  emailController.listarTemplates
);

// Obter template por ID
router.get(
  "/templates/:id",
  authorize(["admin", "secretario", "tesoureiro"]),
  emailController.obterTemplate
);

// Atualizar template
router.put(
  "/templates/:id",
  authorize(["admin", "secretario"]),
  emailController.atualizarTemplate
);

// Deletar template
router.delete(
  "/templates/:id",
  authorize(["admin"]),
  emailController.deletarTemplate
);

// Ativar/desativar template
router.patch(
  "/templates/:id/status",
  authorize(["admin", "secretario"]),
  emailController.alterarStatusTemplate
);

// Duplicar template
router.post(
  "/templates/:id/duplicar",
  authorize(["admin", "secretario"]),
  emailController.duplicarTemplate
);

// Renderizar template (preview)
router.post(
  "/templates/:id/renderizar",
  authorize(["admin", "secretario", "tesoureiro"]),
  emailController.renderizarTemplate
);

// Buscar templates por tipo
router.get(
  "/templates/tipo/:tipo",
  authorize(["admin", "secretario", "tesoureiro"]),
  emailController.buscarTemplatesPorTipo
);

// Criar templates padrão
router.post(
  "/templates/criar-padrao",
  authorize(["admin"]),
  emailController.criarTemplatesPadrao
);

export default router;
