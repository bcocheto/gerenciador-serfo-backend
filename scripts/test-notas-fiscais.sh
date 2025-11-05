#!/bin/bash
# scripts/test-notas-fiscais.sh
# Script para testar todas as funcionalidades da API de Notas Fiscais

BASE_URL="http://localhost:3001/api/v1/notas-fiscais"

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

print_header "TESTES DA API DE NOTAS FISCAIS"
echo "Base URL: $BASE_URL"

# 1. Verificar contribuições sem nota fiscal
test_endpoint "Buscar contribuições sem nota fiscal" \
"curl -s -X GET $BASE_URL/contribuicoes-sem-nota \
  -H 'Authorization: Bearer fake-token' | jq ."

# 2. Criar nota fiscal para uma contribuição
test_endpoint "Criar nota fiscal para contribuição ID 1" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"contribuicaoId\": 1,
    \"observacoes\": \"Primeira nota fiscal de teste\"
  }' | jq ."

# 3. Criar segunda nota fiscal
test_endpoint "Criar nota fiscal para contribuição ID 2" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"contribuicaoId\": 2,
    \"observacoes\": \"Segunda nota fiscal de teste\"
  }' | jq ."

# 4. Listar todas as notas fiscais
test_endpoint "Listar todas as notas fiscais" \
"curl -s -X GET '$BASE_URL?page=1&limit=10' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 5. Buscar nota fiscal por ID
test_endpoint "Buscar nota fiscal por ID" \
"curl -s -X GET $BASE_URL/1 \
  -H 'Authorization: Bearer fake-token' | jq ."

# 6. Buscar nota fiscal por número
test_endpoint "Buscar nota fiscal por número" \
"curl -s -X GET $BASE_URL/numero/NF2024000001 \
  -H 'Authorization: Bearer fake-token' | jq ."

# 7. Gerar PDF da nota fiscal
test_endpoint "Gerar PDF da nota fiscal" \
"curl -s -X POST $BASE_URL/1/gerar-pdf \
  -H 'Authorization: Bearer fake-token' | jq ."

# 8. Estatísticas de notas fiscais
test_endpoint "Estatísticas de notas fiscais" \
"curl -s -X GET $BASE_URL/statistics \
  -H 'Authorization: Bearer fake-token' | jq ."

# 9. Filtrar notas por status
test_endpoint "Filtrar notas fiscais por status emitida" \
"curl -s -X GET '$BASE_URL?status=emitida&page=1&limit=5' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 10. Relatório mensal
test_endpoint "Relatório mensal de notas fiscais" \
"curl -s -X GET '$BASE_URL/relatorio-mensal?ano=2024&mes=12' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 11. Atualizar nota fiscal
test_endpoint "Atualizar observações da nota fiscal" \
"curl -s -X PUT $BASE_URL/1 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"observacoes\": \"Observações atualizadas\"
  }' | jq ."

# 12. Filtrar por período
test_endpoint "Filtrar notas por período" \
"curl -s -X GET '$BASE_URL?startDate=2024-12-01&endDate=2024-12-31' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 13. Gerar notas fiscais em lote
test_endpoint "Gerar notas fiscais em lote" \
"curl -s -X POST $BASE_URL/gerar-lote \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"contribuicaoIds\": [3, 4, 5]
  }' | jq ."

# 14. Download PDF
test_endpoint "Download PDF da nota fiscal" \
"curl -s -X GET $BASE_URL/1/download-pdf \
  -H 'Authorization: Bearer fake-token' | jq ."

# 15. Reenviar por email
test_endpoint "Reenviar nota fiscal por email" \
"curl -s -X POST $BASE_URL/1/reenviar-email \
  -H 'Authorization: Bearer fake-token' | jq ."

# 16. Cancelar nota fiscal
test_endpoint "Cancelar nota fiscal" \
"curl -s -X POST $BASE_URL/2/cancelar \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"motivo\": \"Cancelamento por erro de dados\"
  }' | jq ."

# 17. Verificar notas canceladas
test_endpoint "Filtrar notas fiscais canceladas" \
"curl -s -X GET '$BASE_URL?status=cancelada' \
  -H 'Authorization: Bearer fake-token' | jq ."

# 18. Estatísticas com filtro de período
test_endpoint "Estatísticas de notas fiscais - último mês" \
"curl -s -X GET '$BASE_URL/statistics?startDate=2024-11-01&endDate=2024-11-30' \
  -H 'Authorization: Bearer fake-token' | jq ."

print_header "TESTES DE VALIDAÇÃO"

# 19. Teste de erro - Contribuição inexistente
test_endpoint "Erro: Criar nota para contribuição inexistente" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"contribuicaoId\": 99999
  }' | jq ."

# 20. Teste de erro - Nota duplicada
test_endpoint "Erro: Criar nota duplicada para mesma contribuição" \
"curl -s -X POST $BASE_URL \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer fake-token' \
  -d '{
    \"contribuicaoId\": 1
  }' | jq ."

# 21. Teste de erro - Download PDF inexistente
test_endpoint "Erro: Download PDF não gerado" \
"curl -s -X GET $BASE_URL/999/download-pdf \
  -H 'Authorization: Bearer fake-token' | jq ."

print_header "CENÁRIOS DE USO PRÁTICO"

# 22. Fluxo completo de geração de nota
test_endpoint "Fluxo: Contribuições pagas sem nota → Gerar lote" \
"curl -s -X GET $BASE_URL/contribuicoes-sem-nota \
  -H 'Authorization: Bearer fake-token' | jq '.data | length'"

# 23. Relatório para auditoria mensal
test_endpoint "Relatório para auditoria - dezembro 2024" \
"curl -s -X GET '$BASE_URL/relatorio-mensal?ano=2024&mes=12' \
  -H 'Authorization: Bearer fake-token' | jq '.data.statistics'"

# 24. Dashboard de notas fiscais
test_endpoint "Dashboard: Estatísticas + Notas recentes" \
"curl -s -X GET '$BASE_URL/statistics' \
  -H 'Authorization: Bearer fake-token' | jq '.data | {total, emitidas, canceladas, valorTotalEmitido}'"

print_header "TESTES CONCLUÍDOS"
echo -e "${GREEN}Todos os endpoints da API de Notas Fiscais foram testados!${NC}"
echo -e "${YELLOW}Funcionalidades testadas:${NC}"
echo -e "  📄 Geração automática de notas fiscais"
echo -e "  🔢 Numeração sequencial"
echo -e "  📊 Relatórios e estatísticas"
echo -e "  🚫 Cancelamento de notas"
echo -e "  📧 Reenvio por email"
echo -e "  📁 Geração de PDF"
echo -e "  🔍 Filtros e consultas avançadas"
echo -e "  ⚡ Processamento em lote"