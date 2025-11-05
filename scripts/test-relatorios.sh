#!/bin/bash
# scripts/test-relatorios.sh
# Script para testar todas as funcionalidades da API de Relatórios

BASE_URL="http://localhost:3001/api/v1/relatorios"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir cabeçalhos
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Função para testar endpoints
test_endpoint() {
    echo -e "\n${GREEN}Testando: $1${NC}"
    echo "Comando: $2"
    echo "Resposta:"
    eval $2
    echo -e "\n---"
}

print_header "TESTES DA API DE RELATÓRIOS FINANCEIROS"
echo "Base URL: $BASE_URL"

# 1. Dashboard Geral
test_endpoint "Dashboard Geral" \
"curl -s -X GET $BASE_URL/dashboard \
  -H 'Authorization: Bearer fake-token' | jq ."

# 2. Dashboard com filtro de período
test_endpoint "Dashboard com período específico" \
"curl -s -X GET '$BASE_URL/dashboard?startDate=2024-01-01&endDate=2024-12-31' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 3. Resumo Financeiro - Mês atual
test_endpoint "Resumo Financeiro - Mês atual" \
"curl -s -X GET '$BASE_URL/resumo-financeiro?periodo=mes' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 4. Resumo Financeiro - Ano atual
test_endpoint "Resumo Financeiro - Ano atual" \
"curl -s -X GET '$BASE_URL/resumo-financeiro?periodo=ano' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 5. Métricas Chave
test_endpoint "Métricas Chave (últimos 30 dias)" \
"curl -s -X GET $BASE_URL/metricas-chave \
  -H 'Authorization: Bearer fake-token' | jq ."

# 6. Relatório de Receitas
test_endpoint "Relatório de Receitas" \
"curl -s -X GET '$BASE_URL/receitas?agrupamento=mes' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 7. Relatório de Receitas por categoria
test_endpoint "Relatório de Receitas por categoria" \
"curl -s -X GET '$BASE_URL/receitas?categoria=Contribuições&agrupamento=mes' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 8. Relatório de Despesas
test_endpoint "Relatório de Despesas" \
"curl -s -X GET '$BASE_URL/despesas?agrupamento=mes' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 9. Relatório de Despesas por categoria
test_endpoint "Relatório de Despesas por categoria" \
"curl -s -X GET '$BASE_URL/despesas?categoria=Operacionais&agrupamento=mes' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 10. Relatório de Contribuições
test_endpoint "Relatório de Contribuições" \
"curl -s -X GET $BASE_URL/contribuicoes \
  -H 'Authorization: Bearer fake-token' | jq ."

# 11. Relatório de Contribuições por status
test_endpoint "Relatório de Contribuições - Apenas pagas" \
"curl -s -X GET '$BASE_URL/contribuicoes?status=pago' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 12. Relatório de Contribuições por tipo
test_endpoint "Relatório de Contribuições - Apenas assistidos" \
"curl -s -X GET '$BASE_URL/contribuicoes?tipo=assistido' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 13. Projeção Financeira - 6 meses
test_endpoint "Projeção Financeira - 6 meses" \
"curl -s -X GET '$BASE_URL/projecao-financeira?meses=6' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 14. Projeção Financeira - 12 meses
test_endpoint "Projeção Financeira - 12 meses" \
"curl -s -X GET '$BASE_URL/projecao-financeira?meses=12' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 15. Comparativo Mensal - Ano atual
test_endpoint "Comparativo Mensal - Ano atual" \
"curl -s -X GET '$BASE_URL/comparativo-mensal?ano=2024' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 16. Comparativo Mensal - Ano específico
test_endpoint "Comparativo Mensal - 2023" \
"curl -s -X GET '$BASE_URL/comparativo-mensal?ano=2023' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 17. Relatório Completo
test_endpoint "Relatório Completo - Período específico" \
"curl -s -X GET '$BASE_URL/completo?startDate=2024-01-01&endDate=2024-06-30' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 18. Relatórios com agrupamento por dia
test_endpoint "Receitas agrupadas por dia" \
"curl -s -X GET '$BASE_URL/receitas?agrupamento=dia&startDate=2024-12-01&endDate=2024-12-31' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 19. Relatórios com agrupamento por ano
test_endpoint "Despesas agrupadas por ano" \
"curl -s -X GET '$BASE_URL/despesas?agrupamento=ano' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 20. Teste de validação - Período inválido
test_endpoint "Teste de validação - Projeção com muitos meses" \
"curl -s -X GET '$BASE_URL/projecao-financeira?meses=100' \
  -H 'Authorization: Bearer fake-token' | jq ."

print_header "CENÁRIOS DE USO PRÁTICO"

# 21. Dashboard para reunião mensal
test_endpoint "Dashboard para reunião mensal (último mês completo)" \
"curl -s -X GET '$BASE_URL/resumo-financeiro?periodo=mes' \
  -H 'Authorization: Bearer fake-token' | jq '.data.resumoFinanceiro, .data.contribuicoes'"

# 22. Análise trimestral
test_endpoint "Análise trimestral (3 meses)" \
"curl -s -X GET '$BASE_URL/dashboard?startDate=2024-10-01&endDate=2024-12-31' \
  -H 'Authorization: Bearer fake-token' | jq '.data.resumoFinanceiro'"

# 23. Planejamento anual
test_endpoint "Dados para planejamento anual" \
"curl -s -X GET '$BASE_URL/projecao-financeira?meses=12' \
  -H 'Authorization: Bearer fake-token' | jq '.data.baseDados, .data.projecoes[0:3]'"

print_header "TESTES CONCLUÍDOS"
echo -e "${GREEN}Todos os endpoints da API de Relatórios foram testados!${NC}"
echo -e "${YELLOW}Verifique os resultados acima para possíveis erros.${NC}"
echo -e "${YELLOW}Os relatórios fornecem informações essenciais para:${NC}"
echo -e "  📊 Dashboard executivo"
echo -e "  💰 Controle financeiro"
echo -e "  📈 Análise de tendências"
echo -e "  🔮 Projeções e planejamento"
echo -e "  📋 Relatórios de prestação de contas"