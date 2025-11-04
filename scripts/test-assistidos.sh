#!/bin/bash

echo "🧪 Testando API de Assistidos - Gerenciador SERFO"
echo "==============================================="

# Aguardar um pouco para garantir que o servidor esteja rodando
sleep 2

echo ""
echo "1. 📊 Testando estatísticas de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos/statistics

echo ""
echo ""
echo "2. 👥 Testando listagem de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos

echo ""
echo ""
echo "3. ✨ Testando criação de assistido..."
curl -s -X POST http://localhost:3001/api/v1/assistidos \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Pedro Santos",
    "cpf": "11122233344",
    "telefone": "(11) 55555-5555",
    "email": "pedro.santos@email.com",
    "endereco": "Rua Nova, 456, Vila Esperança, São Paulo - SP",
    "dataIngresso": "'$(date -Iseconds)'",
    "valorMensal": 75.50,
    "diaVencimento": 10,
    "observacoes": "Assistido criado via teste da API"
  }'

echo ""
echo ""
echo "4. 🔍 Testando busca de assistidos por dia de vencimento (dia 10)..."
curl -s http://localhost:3001/api/v1/assistidos/vencimento/10

echo ""
echo ""
echo "5. 🔍 Testando busca de assistidos por dia de vencimento (dia 15)..."
curl -s http://localhost:3001/api/v1/assistidos/vencimento/15

echo ""
echo ""
echo "6. 💰 Testando busca com filtro de valor..."
curl -s "http://localhost:3001/api/v1/assistidos?valorMin=50&valorMax=100"

echo ""
echo ""
echo "7. 🔍 Testando busca por nome..."
curl -s "http://localhost:3001/api/v1/assistidos?search=Maria"

echo ""
echo ""
echo "✅ Testes de assistidos concluídos!"