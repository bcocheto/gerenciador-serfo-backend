// src/config/validations.ts
import { z } from "zod";

// Validações para Sedes
export const sedeCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
});

export const sedeUpdateSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  ativo: z.boolean().optional(),
});

// Validações para Voluntários
export const voluntarioCreateSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido"),
  endereco: z.string().optional(),
  dataIngresso: z.string().datetime("Data de ingresso inválida"),
  observacoes: z.string().optional(),
  sedeId: z.number().int().positive("Sede é obrigatória"),
  cargo: z
    .enum([
      "VOLUNTARIO",
      "SECRETARIO",
      "TESOUREIRO",
      "PRESIDENTE",
      "SUPER_ADMIN",
    ])
    .default("VOLUNTARIO"),
});

export const voluntarioUpdateSchema = voluntarioCreateSchema.partial();

// Validações para Assistidos
export const assistidoCreateSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido"),
  endereco: z.string().optional(),
  dataIngresso: z.string().datetime("Data de ingresso inválida"),
  valorMensal: z.number().positive("Valor mensal deve ser positivo"),
  diaVencimento: z
    .number()
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31"),
  observacoes: z.string().optional(),
  sedeId: z.number().int().positive("Sede é obrigatória"),
});

export const assistidoUpdateSchema = assistidoCreateSchema.partial();

// Validações para Contribuições
export const contribuicaoCreateSchema = z
  .object({
    voluntarioId: z.number().positive().optional(),
    assistidoId: z.number().positive().optional(),
    valor: z.number().positive("Valor deve ser positivo"),
    dataVencimento: z.string().datetime("Data de vencimento inválida"),
    dataPagamento: z.string().datetime("Data de pagamento inválida").optional(),
    formaPagamento: z
      .enum(["pix", "boleto", "transferencia", "dinheiro", "cartao"])
      .optional(),
    observacoes: z.string().optional(),
  })
  .refine((data) => data.voluntarioId || data.assistidoId, {
    message: "Deve ser informado voluntário ou assistido",
    path: ["voluntarioId"],
  });

export const contribuicaoUpdateSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo").optional(),
  dataVencimento: z.string().datetime("Data de vencimento inválida").optional(),
  dataPagamento: z.string().datetime("Data de pagamento inválida").optional(),
  status: z.enum(["pendente", "pago", "atrasado", "cancelado"]).optional(),
  formaPagamento: z
    .enum(["pix", "boleto", "transferencia", "dinheiro", "cartao"])
    .optional(),
  observacoes: z.string().optional(),
});

// Validações para Movimentações
export const movimentacaoCreateSchema = z.object({
  data: z.string().datetime("Data inválida"),
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  valor: z.number().positive("Valor deve ser positivo"),
  tipo: z.enum(["entrada", "saida"], {
    message: "Tipo deve ser entrada ou saída",
  }),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  centroDeCusto: z.string().optional(),
  favorecidoPagador: z.string().optional(),
  contribuicaoId: z.number().positive().optional(),
  observacoes: z.string().optional(),
});

export const movimentacaoUpdateSchema = movimentacaoCreateSchema.partial();

// Validações para Templates de Email
export const templateEmailCreateSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  assunto: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  corpo: z.string().min(10, "Corpo do email deve ter pelo menos 10 caracteres"),
  tipo: z.enum(["cobranca", "lembrete", "agradecimento", "boas_vindas"]),
});

export const templateEmailUpdateSchema = templateEmailCreateSchema
  .partial()
  .extend({
    ativo: z.boolean().optional(),
  });

// Validações para envio de emails
export const enviarEmailSchema = z.object({
  destinatario: z.string().email("Email inválido"),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  corpo: z.string().min(1, "Corpo do email é obrigatório"),
  templateId: z.number().int().positive().optional(),
  agendarPara: z.string().datetime().optional(),
});

export const enviarEmailLoteSchema = z.object({
  destinatarios: z
    .array(z.string().email())
    .min(1, "Pelo menos um destinatário é necessário"),
  templateId: z
    .number()
    .int()
    .positive("ID do template deve ser um número positivo"),
  dados: z.record(z.string(), z.any()).optional(), // Dados para substituição no template
  agendarPara: z.string().datetime().optional(),
});

export const logEmailCreateSchema = z.object({
  destinatario: z.string().email("Email inválido"),
  assunto: z.string().min(1, "Assunto é obrigatório"),
  corpo: z.string().min(1, "Corpo do email é obrigatório"),
  templateId: z.number().int().positive().optional(),
  agendarPara: z.string().datetime().optional(),
});

// Validações para Notas Fiscais
export const notaFiscalCreateSchema = z.object({
  contribuicaoId: z
    .number()
    .int()
    .positive("ID da contribuição deve ser um número positivo"),
  observacoes: z.string().optional(),
});

export const notaFiscalUpdateSchema = z.object({
  status: z.enum(["emitida", "cancelada"]).optional(),
  observacoes: z.string().optional(),
});

// Validações para Email Service
export const emailEnvioSchema = z.object({
  destinatario: z.string().email("Email inválido"),
  assunto: z.string().min(1, "Assunto é obrigatório").optional(),
  corpo: z.string().min(1, "Corpo do email é obrigatório").optional(),
  anexos: z.array(z.string()).optional(),
  templateId: z.number().positive().optional(),
  dados: z.record(z.string(), z.any()).optional(),
  agendarPara: z.string().datetime().optional(),
});

export const emailDestinatarioSchema = z.object({
  email: z.string().email("Email inválido"),
  nome: z.string().min(1, "Nome é obrigatório"),
  dados: z.record(z.string(), z.any()).optional(),
});

export const emailLoteSchema = z.object({
  destinatarios: z
    .array(emailDestinatarioSchema)
    .min(1, "Lista de destinatários não pode estar vazia"),
  templateId: z.number().positive().optional(),
  assunto: z.string().min(1, "Assunto é obrigatório").optional(),
  corpo: z.string().min(1, "Corpo do email é obrigatório").optional(),
  anexos: z.array(z.string()).optional(),
  agendarPara: z.string().datetime().optional(),
});

// Validações para Configurações do Sistema
export const configuracaoCreateSchema = z.object({
  chave: z.string().min(1, "Chave é obrigatória"),
  valor: z.string().min(1, "Valor é obrigatório"),
  descricao: z.string().optional(),
  tipo: z.enum(["string", "number", "boolean", "json"]).default("string"),
});

// Validações para consultas/filtros
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.string().optional(),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Tipos TypeScript exportados
export type SedeCreate = z.infer<typeof sedeCreateSchema>;
export type SedeUpdate = z.infer<typeof sedeUpdateSchema>;
export type VoluntarioCreate = z.infer<typeof voluntarioCreateSchema>;
export type VoluntarioUpdate = z.infer<typeof voluntarioUpdateSchema>;
export type AssistidoCreate = z.infer<typeof assistidoCreateSchema>;
export type AssistidoUpdate = z.infer<typeof assistidoUpdateSchema>;
export type ContribuicaoCreate = z.infer<typeof contribuicaoCreateSchema>;
export type ContribuicaoUpdate = z.infer<typeof contribuicaoUpdateSchema>;
export type NotaFiscalCreate = z.infer<typeof notaFiscalCreateSchema>;
export type NotaFiscalUpdate = z.infer<typeof notaFiscalUpdateSchema>;
export type EnviarEmail = z.infer<typeof enviarEmailSchema>;
export type EnviarEmailLote = z.infer<typeof enviarEmailLoteSchema>;
export type LogEmailCreate = z.infer<typeof logEmailCreateSchema>;
export type EmailEnvio = z.infer<typeof emailEnvioSchema>;
export type EmailLote = z.infer<typeof emailLoteSchema>;
export type MovimentacaoCreate = z.infer<typeof movimentacaoCreateSchema>;
export type MovimentacaoUpdate = z.infer<typeof movimentacaoUpdateSchema>;
export type TemplateEmailCreate = z.infer<typeof templateEmailCreateSchema>;
export type TemplateEmailUpdate = z.infer<typeof templateEmailUpdateSchema>;
export type ConfiguracaoCreate = z.infer<typeof configuracaoCreateSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRangeParams = z.infer<typeof dateRangeSchema>;
