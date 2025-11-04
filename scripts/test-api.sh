#!/bin/bash

echo "🧪 Testando API do Gerenciador SERFO"
echo "======================================"

# Aguardar um pouco para garantir que o servidor esteja rodando
sleep 2

echo ""
echo "1. 🏥 Testando Health Check..."
curl -s http://localhost:3001/api/v1/health

echo ""
echo ""
echo "2. 📋 Testando endpoint raiz..."
curl -s http://localhost:3001/

echo ""
echo ""
echo "=== TESTES DE VOLUNTÁRIOS ==="
echo ""
echo "3. 👥 Testando listagem de voluntários..."
curl -s http://localhost:3001/api/v1/voluntarios

echo ""
echo ""
echo "4. 📊 Testando estatísticas de voluntários..."
curl -s http://localhost:3001/api/v1/voluntarios/statistics

echo ""
echo ""
echo "=== TESTES DE ASSISTIDOS ==="
echo ""
echo "5. 👥 Testando listagem de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos

echo ""
echo ""
echo "6. 📊 Testando estatísticas de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos/statistics

echo ""
echo ""
echo "=== TESTES DE MOVIMENTAÇÕES ==="
echo ""
echo "7. � Testando listagem de movimentações..."
curl -s http://localhost:3001/api/v1/movimentacoes

echo ""
echo ""
echo "8. 📊 Testando estatísticas de movimentações..."
curl -s http://localhost:3001/api/v1/movimentacoes/statistics

echo ""
echo ""
echo "9. ✨ Testando criação de movimentação..."
curl -s -X POST http://localhost:3001/api/v1/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "data": "'$(date -Iseconds)'",
    "descricao": "Contribuição mensal - Teste API",
    "valor": 150.00,
    "tipo": "entrada",
    "categoria": "Contribuições",
    "conta": "Conta Principal",
    "favorecidoPagador": "Teste Contribuinte",
    "observacoes": "Movimentação criada via teste da API"
  }'

echo ""
echo ""
echo "10. � Testando resumo financeiro..."
curl -s http://localhost:3001/api/v1/movimentacoes/resumo

echo ""
echo ""
echo "11. 📊 Testando relatório por categoria..."
curl -s http://localhost:3001/api/v1/movimentacoes/relatorio/categoria

echo ""
echo ""
echo "✅ Testes concluídos!"