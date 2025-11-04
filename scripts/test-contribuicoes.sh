#!/bin/bash
# scripts/test-contribuicoes.sh
# Script para testar todas as funcionalidades da API de Contribuições

BASE_URL="http://localhost:3001/api/v1/contribuicoes"

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

print_header "TESTES DA API DE CONTRIBUIÇÕES"
echo "Base URL: $BASE_URL"

# 1. Criar contribuição para assistido
test_endpoint "Criar contribuição para assistido" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"assistidoId\": 1,
    \"valor\": 100.00,
    \"dataVencimento\": \"2024-12-31\"
  }' | jq ."

# 2. Criar contribuição para voluntário
test_endpoint "Criar contribuição para voluntário" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"voluntarioId\": 1,
    \"valor\": 50.00,
    \"dataVencimento\": \"2024-12-31\"
  }' | jq ."

# 3. Listar todas as contribuições
test_endpoint "Listar todas as contribuições" \
"curl -s -X GET '$BASE_URL?page=1&limit=10' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 4. Buscar contribuição por ID
test_endpoint "Buscar contribuição por ID" \
"curl -s -X GET $BASE_URL/1 \
  -H 'Authorization: Bearer fake-token' | jq ."

# 5. Gerar contribuições mensais
test_endpoint "Gerar contribuições mensais" \
"curl -s -X POST $BASE_URL/gerar-mensais \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"ano\": 2024,
    \"mes\": 12
  }' | jq ."

# 6. Listar contribuições pendentes
test_endpoint "Listar contribuições pendentes" \
"curl -s -X GET $BASE_URL/pendentes \
  -H 'Authorization: Bearer fake-token' | jq ."

# 7. Listar contribuições atrasadas
test_endpoint "Listar contribuições atrasadas" \
"curl -s -X GET $BASE_URL/atrasadas \
  -H 'Authorization: Bearer fake-token' | jq ."

# 8. Processar pagamento
test_endpoint "Processar pagamento" \
"curl -s -X POST $BASE_URL/1/processar-pagamento \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"dataPagamento\": \"2024-12-30\",
    \"formaPagamento\": \"PIX\",
    \"observacoes\": \"Pagamento via PIX\",
    \"criarMovimentacao\": true
  }' | jq ."

# 9. Buscar estatísticas
test_endpoint "Buscar estatísticas" \
"curl -s -X GET $BASE_URL/statistics \
  -H 'Authorization: Bearer fake-token' | jq ."

# 10. Filtrar por status
test_endpoint "Filtrar contribuições por status" \
"curl -s -X GET '$BASE_URL?status=pago&page=1&limit=5' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 11. Contribuições do mês
test_endpoint "Contribuições de um mês específico" \
"curl -s -X GET '$BASE_URL/mes?ano=2024&mes=12' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 12. Relatório de inadimplência
test_endpoint "Relatório de inadimplência" \
"curl -s -X GET $BASE_URL/relatorio-inadimplencia \
  -H 'Authorization: Bearer fake-token' | jq ."

# 13. Marcar contribuições atrasadas
test_endpoint "Marcar contribuições atrasadas" \
"curl -s -X PATCH $BASE_URL/marcar-atrasadas \
  -H 'Authorization: Bearer fake-token' | jq ."

# 14. Atualizar contribuição
test_endpoint "Atualizar contribuição" \
"curl -s -X PUT $BASE_URL/1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"valor\": 120.00,
    \"observacoes\": \"Valor ajustado\"
  }' | jq ."

# 15. Filtros avançados
test_endpoint "Filtros avançados (valor e período)" \
"curl -s -X GET '$BASE_URL?valorMin=50&valorMax=150&startDate=2024-12-01&endDate=2024-12-31' \
  -H 'Authorization: Bearer fake-token' | jq ."

print_header "TESTES CONCLUÍDOS"
echo -e "${GREEN}Todos os endpoints da API de Contribuições foram testados!${NC}"
echo -e "${YELLOW}Verifique os resultados acima para possíveis erros.${NC}"