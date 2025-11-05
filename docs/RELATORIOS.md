# Sistema de Relatórios Financeiros - SERFO

## 📊 Visão Geral

O Sistema de Relatórios Financeiros fornece análises completas e insights sobre a situação financeira da SERFO, conectando dados de movimentações, contribuições, voluntários e assistidos em dashboards e relatórios executivos.

## 🎯 Funcionalidades Principais

### 1. **Dashboard Geral**

- **Endpoint**: `GET /api/v1/relatorios/dashboard`
- **Descrição**: Visão executiva com resumo financeiro, métricas de pessoas e movimentações recentes
- **Dados incluídos**:
  - Total de receitas/despesas e saldo líquido
  - Voluntários e assistidos ativos
  - Estatísticas de contribuições
  - Movimentações por categoria e conta
  - Últimas 10 movimentações

### 2. **Resumo Financeiro por Período**

- **Endpoint**: `GET /api/v1/relatorios/resumo-financeiro`
- **Parâmetros**: `periodo` (hoje, semana, mes, ano) ou `startDate/endDate`
- **Uso**: Reuniões executivas, relatórios de diretoria

### 3. **Métricas Chave**

- **Endpoint**: `GET /api/v1/relatorios/metricas-chave`
- **Descrição**: KPIs dos últimos 30 dias
- **Métricas calculadas**:
  - Taxa de adimplência
  - Ticket médio de contribuições
  - Eficiência de arrecadação
  - Tendências de crescimento

## 📈 Relatórios Específicos

### **Relatório de Receitas**

```
GET /api/v1/relatorios/receitas
```

**Parâmetros**:

- `categoria`: Filtrar por categoria específica
- `conta`: Filtrar por conta específica
- `agrupamento`: dia, mes, ano
- `startDate/endDate`: Período específico

**Dados retornados**:

- Total de receitas e média
- Receitas agrupadas por período
- Receitas por categoria
- Detalhes de todas as transações

### **Relatório de Despesas**

```
GET /api/v1/relatorios/despesas
```

**Parâmetros**: Similares ao relatório de receitas
**Uso**: Controle de gastos, análise de custos operacionais

### **Relatório de Contribuições**

```
GET /api/v1/relatorios/contribuicoes
```

**Parâmetros**:

- `status`: pendente, pago, atrasado, cancelado
- `tipo`: voluntario, assistido
- `startDate/endDate`: Período específico

**Análises incluídas**:

- Taxa de adimplência detalhada
- Contribuições por status e tipo
- Valor total arrecadado vs pendente

## 🔮 Análises Avançadas

### **Projeção Financeira**

```
GET /api/v1/relatorios/projecao-financeira?meses=12
```

**Funcionalidade**:

- Análise de histórico para calcular médias
- Projeção baseada em contribuições esperadas de assistidos ativos
- Estimativas de receitas e despesas futuras
- Cenários de saldo projetado

### **Comparativo Mensal**

```
GET /api/v1/relatorios/comparativo-mensal?ano=2024
```

**Análise**:

- Comparação mês a mês de receitas, despesas e contribuições
- Identificação de sazonalidades
- Totais anuais consolidados

### **Relatório Completo**

```
GET /api/v1/relatorios/completo
```

**Descrição**: Todos os relatórios em uma única consulta
**Uso**: Prestação de contas, relatórios anuais

## 🎨 Casos de Uso Práticos

### **1. Reunião Mensal da Diretoria**

```bash
# Dashboard do mês atual
curl -X GET '/api/v1/relatorios/resumo-financeiro?periodo=mes'

# Contribuições pendentes
curl -X GET '/api/v1/relatorios/contribuicoes?status=pendente'
```

### **2. Planejamento Anual**

```bash
# Projeção para próximos 12 meses
curl -X GET '/api/v1/relatorios/projecao-financeira?meses=12'

# Comparativo do ano anterior
curl -X GET '/api/v1/relatorios/comparativo-mensal?ano=2023'
```

### **3. Análise de Performance**

```bash
# Métricas dos últimos 30 dias
curl -X GET '/api/v1/relatorios/metricas-chave'

# Receitas por categoria no trimestre
curl -X GET '/api/v1/relatorios/receitas?agrupamento=mes&startDate=2024-10-01&endDate=2024-12-31'
```

### **4. Relatório para Auditoria**

```bash
# Relatório completo do ano
curl -X GET '/api/v1/relatorios/completo?startDate=2024-01-01&endDate=2024-12-31'
```

## 📊 Estrutura dos Dados

### **Resumo Financeiro**

```json
{
  "resumoFinanceiro": {
    "totalReceitas": 15000.0,
    "totalDespesas": 8000.0,
    "saldoLiquido": 7000.0,
    "qtdEntradas": 45,
    "qtdSaidas": 23
  }
}
```

### **Métricas de Contribuições**

```json
{
  "contribuicoes": {
    "total": 120,
    "pendentes": 15,
    "pagas": 100,
    "atrasadas": 5,
    "valorTotalPago": 12000.0,
    "taxaAdimplencia": 83.33
  }
}
```

### **Projeção Mensal**

```json
{
  "projecoes": [
    {
      "mes": "janeiro de 2025",
      "data": "2025-01",
      "receitaProjetada": 2500.0,
      "despesaProjetada": 1800.0,
      "contribuicoesEsperadas": 2000.0,
      "saldoProjetado": 700.0
    }
  ]
}
```

## 🔧 Configuração e Filtros

### **Filtros de Data**

- `startDate`: Data início (YYYY-MM-DD)
- `endDate`: Data fim (YYYY-MM-DD)
- `periodo`: Períodos pré-definidos (hoje, semana, mes, ano)

### **Agrupamentos**

- `dia`: Agrupamento diário
- `mes`: Agrupamento mensal (padrão)
- `ano`: Agrupamento anual

### **Filtros Específicos**

- `categoria`: Filtrar por categoria de movimentação
- `conta`: Filtrar por conta específica
- `status`: Status de contribuições
- `tipo`: Tipo de contribuição (voluntario/assistido)

## 🚀 Benefícios do Sistema

### **Para Diretoria**

- Dashboards executivos em tempo real
- Métricas de performance organizacional
- Projeções para tomada de decisão

### **Para Tesouraria**

- Controle detalhado de receitas e despesas
- Análise de categorias de gastos
- Relatórios de inadimplência

### **Para Planejamento**

- Projeções financeiras baseadas em dados históricos
- Análise de tendências e sazonalidades
- Cenários para orçamento anual

### **Para Prestação de Contas**

- Relatórios completos para auditoria
- Transparência nos dados financeiros
- Rastreabilidade de movimentações

## 📋 Próximos Passos

1. **Implementação de Gráficos**: Endpoints retornando dados formatados para charts
2. **Alertas Automáticos**: Notificações quando métricas atingem limites
3. **Exportação**: Relatórios em PDF/Excel
4. **Dashboard Web**: Interface visual para os relatórios
5. **Relatórios Agendados**: Envio automático de relatórios por email

---

_Sistema desenvolvido para gestão financeira transparente e eficiente da SERFO_
