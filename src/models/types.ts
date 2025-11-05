// src/models/types.ts
// Types baseados nos models do Prisma para maior type safety

export interface BaseEntity {
  id: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Voluntario extends BaseEntity {
  nomeCompleto: string;
  cpf?: string | null;
  telefone?: string | null;
  email: string;
  endereco?: string | null;
  dataIngresso: Date;
  observacoes?: string | null;
  ativo: boolean;
}

export interface Assistido extends BaseEntity {
  nomeCompleto: string;
  cpf?: string | null;
  telefone?: string | null;
  email: string;
  endereco?: string | null;
  dataIngresso: Date;
  valorMensal: number;
  diaVencimento: number;
  observacoes?: string | null;
  ativo: boolean;
}

export interface Contribuicao extends BaseEntity {
  voluntarioId?: number | null;
  assistidoId?: number | null;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date | null;
  status: StatusContribuicao;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}

export interface Movimentacao extends BaseEntity {
  data: Date;
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  categoria: string;
  conta: string;
  centroDeCusto?: string | null;
  favorecidoPagador?: string | null;
  contribuicaoId?: number | null;
  observacoes?: string | null;
}

export interface NotaFiscal extends BaseEntity {
  numero: string;
  contribuicaoId: number;
  dataEmissao: Date;
  valor: number;
  status: StatusNotaFiscal;
  observacoes?: string | null;
}

export interface TemplateEmail extends BaseEntity {
  nome: string;
  assunto: string;
  corpo: string;
  tipo: TipoTemplateEmail;
  ativo: boolean;
}

export interface LogEmail extends BaseEntity {
  destinatario: string;
  assunto: string;
  corpo: string;
  templateId?: number | null;
  status: StatusEmailEnvio;
  tentativas: number;
  ultimaTentativa?: Date | null;
  erroEnvio?: string | null;
  agendarPara?: Date | null;
  enviadoEm?: Date | null;
}

export interface Configuracao extends BaseEntity {
  chave: string;
  valor: string;
  descricao?: string | null;
  tipo: TipoConfiguracao;
}

// Enums
export enum StatusContribuicao {
  PENDENTE = "pendente",
  PAGO = "pago",
  ATRASADO = "atrasado",
  CANCELADO = "cancelado",
}

export enum FormaPagamento {
  PIX = "pix",
  BOLETO = "boleto",
  TRANSFERENCIA = "transferencia",
  DINHEIRO = "dinheiro",
  CARTAO = "cartao",
}

export enum TipoMovimentacao {
  ENTRADA = "entrada",
  SAIDA = "saida",
}

export enum StatusNotaFiscal {
  EMITIDA = "emitida",
  CANCELADA = "cancelada",
}

export enum TipoTemplateEmail {
  COBRANCA = "cobranca",
  LEMBRETE = "lembrete",
  AGRADECIMENTO = "agradecimento",
  BOAS_VINDAS = "boas_vindas",
}

export enum StatusEmailEnvio {
  PENDENTE = "pendente",
  ENVIADO = "enviado",
  ERRO = "erro",
  AGENDADO = "agendado",
}

export enum TipoConfiguracao {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  JSON = "json",
}

// Types para relações (com includes)
export interface VoluntarioWithRelations extends Voluntario {
  contribuicoes?: Contribuicao[];
}

export interface AssistidoWithRelations extends Assistido {
  contribuicoes?: Contribuicao[];
}

export interface ContribuicaoWithRelations extends Contribuicao {
  voluntario?: Voluntario | null;
  assistido?: Assistido | null;
  movimentacoes?: Movimentacao[];
  notasFiscais?: NotaFiscal[];
}

export interface MovimentacaoWithRelations extends Movimentacao {
  contribuicao?: Contribuicao | null;
}

export interface NotaFiscalWithRelations extends NotaFiscal {
  contribuicao?: Contribuicao;
}

export interface LogEmailWithRelations extends LogEmail {
  template?: TemplateEmail | null;
}

// Types para paginação
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Types para filtros
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface BaseFilter {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface VoluntarioFilter extends BaseFilter {
  search?: string;
  ativo?: boolean;
  dataIngressoRange?: DateRangeFilter;
}

export interface AssistidoFilter extends BaseFilter {
  search?: string;
  ativo?: boolean;
  dataIngressoRange?: DateRangeFilter;
  valorMensalRange?: {
    min?: number;
    max?: number;
  };
}

export interface ContribuicaoFilter extends BaseFilter {
  voluntarioId?: number;
  assistidoId?: number;
  status?: StatusContribuicao;
  formaPagamento?: FormaPagamento;
  dataVencimentoRange?: DateRangeFilter;
  dataPagamentoRange?: DateRangeFilter;
  valorRange?: {
    min?: number;
    max?: number;
  };
}

export interface MovimentacaoFilter extends BaseFilter {
  tipo?: TipoMovimentacao;
  categoria?: string;
  conta?: string;
  dataRange?: DateRangeFilter;
  valorRange?: {
    min?: number;
    max?: number;
  };
}

export interface NotaFiscalFilter extends BaseFilter {
  status?: StatusNotaFiscal;
  contribuicaoId?: number;
  dataEmissaoRange?: DateRangeFilter;
}

export interface LogEmailFilter extends BaseFilter {
  status?: StatusEmailEnvio;
  templateId?: number;
  destinatario?: string;
  dataRange?: DateRangeFilter;
}

// Types para estatísticas
export interface ContribuicaoStatistics {
  totalContribuicoes: number;
  totalArrecadado: number;
  contribuicoesPendentes: number;
  contribuicoesAtrasadas: number;
  contribuicoesPagas: number;
  mediaValorContribuicao: number;
  ultimasContribuicoes: Contribuicao[];
}

export interface MovimentacaoStatistics {
  totalEntradas: number;
  totalSaidas: number;
  saldoAtual: number;
  movimentacoesPorCategoria: Array<{
    categoria: string;
    total: number;
    tipo: TipoMovimentacao;
  }>;
  ultimasMovimentacoes: Movimentacao[];
}

export interface DashboardStatistics {
  voluntarios: {
    total: number;
    ativos: number;
    novosEsteAno: number;
  };
  assistidos: {
    total: number;
    ativos: number;
    novosEsteAno: number;
  };
  contribuicoes: ContribuicaoStatistics;
  movimentacoes: MovimentacaoStatistics;
  notasFiscais: {
    totalEmitidas: number;
    totalCanceladas: number;
    valorTotal: number;
  };
}
