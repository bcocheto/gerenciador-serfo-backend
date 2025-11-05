# Sistema de Notas Fiscais - SERFO

## 📄 Visão Geral

O Sistema de Notas Fiscais automatiza a geração, controle e gestão de notas fiscais para contribuições recebidas pela SERFO, garantindo compliance fiscal e rastreabilidade de todas as transações.

## 🎯 Funcionalidades Principais

### 1. **Geração Automática de Notas Fiscais**

- **Endpoint**: `POST /api/v1/notas-fiscais`
- **Trigger**: Criação manual ou automática para contribuições pagas
- **Numeração**: Sequencial automática no formato `NF{ANO}{SEQUENCIA}` (ex: NF2024000001)
- **Validações**:
  - Apenas contribuições pagas podem gerar notas fiscais
  - Não permite duplicação para a mesma contribuição
  - Verifica existência de voluntário/assistido

### 2. **Controle de Status e Lifecycle**

- **Status disponíveis**: `emitida`, `cancelada`
- **Cancelamento**: Processo controlado com motivo e histórico
- **Auditoria**: Registro completo de alterações com timestamps

### 3. **Geração de PDF e Documentos**

- **Geração de PDF**: Endpoint dedicado para criação de documentos
- **Template personalizado**: Dados formatados para impressão
- **Armazenamento**: Controle de arquivos gerados
- **Download**: Endpoint seguro para download de PDFs

## 📊 Endpoints Disponíveis

### **Gestão Básica**

```
POST /api/v1/notas-fiscais                    # Criar nota fiscal
GET  /api/v1/notas-fiscais                    # Listar com filtros
GET  /api/v1/notas-fiscais/:id                # Buscar por ID
GET  /api/v1/notas-fiscais/numero/:numero     # Buscar por número
PUT  /api/v1/notas-fiscais/:id                # Atualizar
```

### **Ações Específicas**

```
POST /api/v1/notas-fiscais/gerar-lote         # Gerar múltiplas notas
POST /api/v1/notas-fiscais/:id/cancelar       # Cancelar nota
POST /api/v1/notas-fiscais/:id/gerar-pdf      # Gerar PDF
GET  /api/v1/notas-fiscais/:id/download-pdf   # Download PDF
POST /api/v1/notas-fiscais/:id/reenviar-email # Reenviar por email
```

### **Relatórios e Análises**

```
GET /api/v1/notas-fiscais/statistics          # Estatísticas gerais
GET /api/v1/notas-fiscais/contribuicoes-sem-nota # Contribuições pendentes
GET /api/v1/notas-fiscais/relatorio-mensal    # Relatório mensal
```

## 🔢 Sistema de Numeração

### **Formato da Numeração**

- **Padrão**: `NF{YYYY}{SEQUENCIA}`
- **Exemplo**: `NF2024000001`, `NF2024000002`
- **Reset anual**: Sequência reinicia a cada ano
- **Único**: Garantia de numeração única no sistema

### **Lógica de Geração**

```typescript
// Exemplo da lógica
const ultimaNota = await findLast();
if (ultimaNota?.numero?.startsWith("NF2024")) {
  proximoNumero = incrementarSequencia(ultimaNota.numero);
} else {
  proximoNumero = "NF2024000001"; // Novo ano
}
```

## 📋 Estrutura de Dados

### **Nota Fiscal Completa**

```json
{
  "id": 1,
  "numero": "NF2024000001",
  "contribuicaoId": 15,
  "valor": 100.0,
  "dataEmissao": "2024-12-04T10:30:00Z",
  "status": "emitida",
  "arquivo": "/uploads/notas-fiscais/NF_NF2024000001_1701678600.pdf",
  "observacoes": "Nota fiscal gerada automaticamente",
  "criadoEm": "2024-12-04T10:30:00Z",
  "contribuicao": {
    "id": 15,
    "valor": 100.0,
    "dataVencimento": "2024-11-30",
    "dataPagamento": "2024-11-28",
    "formaPagamento": "PIX",
    "assistido": {
      "nomeCompleto": "João Silva",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "endereco": "Rua das Flores, 123"
    }
  }
}
```

### **Dados para PDF**

```json
{
  "nota": {
    "numero": "NF2024000001",
    "dataEmissao": "04/12/2024",
    "valor": 100.0,
    "status": "emitida"
  },
  "pagador": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "endereco": "Rua das Flores, 123"
  },
  "contribuicao": {
    "id": 15,
    "dataVencimento": "30/11/2024",
    "dataPagamento": "28/11/2024",
    "formaPagamento": "PIX",
    "tipo": "Assistido"
  }
}
```

## 🚀 Fluxos de Trabalho

### **1. Fluxo Manual de Geração**

```bash
# 1. Verificar contribuições sem nota
GET /api/v1/notas-fiscais/contribuicoes-sem-nota

# 2. Gerar nota fiscal individual
POST /api/v1/notas-fiscais
{
  "contribuicaoId": 15,
  "observacoes": "Contribuição mensal de dezembro"
}

# 3. Gerar PDF
POST /api/v1/notas-fiscais/1/gerar-pdf

# 4. Enviar por email
POST /api/v1/notas-fiscais/1/reenviar-email
```

### **2. Fluxo de Processamento em Lote**

```bash
# 1. Identificar contribuições pagas sem nota
GET /api/v1/notas-fiscais/contribuicoes-sem-nota

# 2. Gerar múltiplas notas de uma vez
POST /api/v1/notas-fiscais/gerar-lote
{
  "contribuicaoIds": [15, 16, 17, 18, 19]
}

# 3. Verificar resultados
# - notas criadas com sucesso
# - erros por contribuição inválida
# - estatísticas do processamento
```

### **3. Fluxo de Cancelamento**

```bash
# 1. Identificar nota a cancelar
GET /api/v1/notas-fiscais/numero/NF2024000001

# 2. Cancelar com motivo
POST /api/v1/notas-fiscais/1/cancelar
{
  "motivo": "Erro nos dados do contribuinte"
}

# 3. Verificar status atualizado
GET /api/v1/notas-fiscais/1
```

## 📊 Relatórios e Estatísticas

### **Estatísticas Gerais**

```json
{
  "total": 150,
  "emitidas": 140,
  "canceladas": 10,
  "valorTotalEmitido": 15000.0,
  "taxaCancelamento": "6.67",
  "notasPorMes": {
    "2024-11": { "quantidade": 45, "valor": 4500.0 },
    "2024-12": { "quantidade": 50, "valor": 5000.0 }
  }
}
```

### **Relatório Mensal**

```bash
GET /api/v1/notas-fiscais/relatorio-mensal?ano=2024&mes=12
```

**Retorna:**

- Estatísticas do mês específico
- Lista de todas as notas do período
- Valores totais e quantidades
- Comparações com meses anteriores

## 🔍 Filtros e Consultas

### **Filtros Disponíveis**

- **Por Status**: `?status=emitida` ou `?status=cancelada`
- **Por Período**: `?startDate=2024-01-01&endDate=2024-12-31`
- **Por Número**: `/numero/NF2024000001`
- **Por Contribuição**: `?contribuicaoId=15`
- **Busca em Número**: `?numeroNota=NF2024`

### **Paginação e Ordenação**

```bash
GET /api/v1/notas-fiscais?page=1&limit=20&orderBy=dataEmissao&orderDirection=desc
```

## ⚡ Processamento em Lote

### **Geração em Lote**

```json
{
  "contribuicaoIds": [15, 16, 17, 18, 19]
}
```

**Resultado:**

```json
{
  "notasFiscaisCriadas": [
    /* array de notas criadas */
  ],
  "erros": [
    {
      "contribuicaoId": 16,
      "erro": "Contribuição não está paga"
    }
  ],
  "totalProcessadas": 5,
  "totalCriadas": 4,
  "totalErros": 1
}
```

## 🛡️ Validações e Segurança

### **Validações de Negócio**

- ✅ Contribuição deve existir
- ✅ Contribuição deve estar com status "pago"
- ✅ Não permite nota duplicada para mesma contribuição
- ✅ Numeração sequencial única
- ✅ Cancelamento apenas com motivo

### **Validações de Dados**

- ✅ ID de contribuição obrigatório e positivo
- ✅ Status deve ser válido ('emitida', 'cancelada')
- ✅ Observações opcionais com limite de caracteres
- ✅ Datas em formato válido

## 📧 Integração com Email

### **Funcionalidades de Email**

- **Envio automático**: Nota fiscal enviada automaticamente após criação
- **Reenvio manual**: Endpoint para reenviar por email
- **Template personalizado**: Email formatado com dados da nota
- **Anexo PDF**: PDF da nota fiscal anexado ao email

### **Dados para Email**

```json
{
  "destinatario": "joao@email.com",
  "assunto": "Nota Fiscal SERFO - NF2024000001",
  "template": "nota-fiscal-emitida",
  "dados": {
    "numero": "NF2024000001",
    "valor": 100.0,
    "pagador": "João Silva",
    "dataEmissao": "04/12/2024"
  },
  "anexos": ["/uploads/notas-fiscais/NF_NF2024000001_1701678600.pdf"]
}
```

## 🎯 Benefícios do Sistema

### **Para Compliance Fiscal**

- ✅ Numeração sequencial obrigatória
- ✅ Rastreabilidade completa de notas
- ✅ Controle de cancelamentos
- ✅ Arquivos organizados e seguros

### **Para Gestão Financeira**

- ✅ Automatização do processo
- ✅ Relatórios detalhados
- ✅ Integração com contribuições
- ✅ Estatísticas e métricas

### **Para Operação**

- ✅ Processamento em lote
- ✅ Interface simples e intuitiva
- ✅ Validações automáticas
- ✅ Histórico completo

## 🔄 Próximos Passos

1. **Integração PDF**: Biblioteca para geração real de PDFs
2. **Templates Customizáveis**: Sistema de templates visuais
3. **Assinatura Digital**: Certificado digital para notas fiscais
4. **Backup Automático**: Backup dos arquivos PDF
5. **API Externa**: Integração com sistemas de contabilidade

---

_Sistema desenvolvido para automatizar e organizar a emissão de notas fiscais da SERFO com total compliance e eficiência operacional_
