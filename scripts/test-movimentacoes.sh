#!/bin/bash

echo "🧪 Testando API de Movimentações - Gerenciador SERFO"
echo "================================================="

# Aguardar um pouco para garantir que o servidor esteja rodando
sleep 2

echo ""
echo "1. 📊 Testando estatísticas de movimentações..."
curl -s http://localhost:3001/api/v1/movimentacoes/statistics

echo ""
echo ""
echo "2. 📋 Testando listagem de categorias..."
curl -s http://localhost:3001/api/v1/movimentacoes/categorias

echo ""
echo ""
echo "3. 🏦 Testando listagem de contas..."
curl -s http://localhost:3001/api/v1/movimentacoes/contas

echo ""
echo ""
echo "4. ✨ Testando criação de movimentação (entrada)..."
curl -s -X POST http://localhost:3001/api/v1/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "data": "'$(date -Iseconds)'",
    "descricao": "Doação recebida - Teste API",
    "valor": 250.00,
    "tipo": "entrada",
    "categoria": "Doações",
    "conta": "Conta Corrente Principal",
    "favorecidoPagador": "João Silva",
    "observacoes": "Movimentação criada via teste da API"
  }'

echo ""
echo ""
echo "5. ✨ Testando criação de movimentação (saída)..."
curl -s -X POST http://localhost:3001/api/v1/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{
    "data": "'$(date -Iseconds)'",
    "descricao": "Compra de materiais - Teste API",
    "valor": 75.50,
    "tipo": "saida",
    "categoria": "Materiais",
    "conta": "Conta Corrente Principal",
    "favorecidoPagador": "Papelaria Central",
    "centroDeCusto": "Administração",
    "observacoes": "Compra de materiais de escritório"
  }'

echo ""
echo ""
echo "6. 👥 Testando listagem de movimentações..."
curl -s http://localhost:3001/api/v1/movimentacoes

echo ""
echo ""
echo "7. 💰 Testando resumo financeiro..."
curl -s http://localhost:3001/api/v1/movimentacoes/resumo

echo ""
echo ""
echo "8. 📊 Testando relatório por categoria..."
curl -s http://localhost:3001/api/v1/movimentacoes/relatorio/categoria

echo ""
echo ""
echo "9. 🏦 Testando relatório por conta..."
curl -s http://localhost:3001/api/v1/movimentacoes/relatorio/conta

echo ""
echo ""
echo "10. 🔍 Testando busca por tipo (entradas)..."
curl -s "http://localhost:3001/api/v1/movimentacoes?tipo=entrada"

echo ""
echo ""
echo "11. 🔍 Testando busca por categoria..."
curl -s "http://localhost:3001/api/v1/movimentacoes?categoria=Doações"

echo ""
echo ""
echo "12. 💰 Testando busca por faixa de valor..."
curl -s "http://localhost:3001/api/v1/movimentacoes?valorMin=100&valorMax=300"

echo ""
echo ""
echo "✅ Testes de movimentações concluídos!"