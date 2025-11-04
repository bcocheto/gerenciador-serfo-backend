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
echo "5. ✨ Testando criação de voluntário..."
curl -s -X POST http://localhost:3001/api/v1/voluntarios \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Ana Costa",
    "cpf": "55566677788",
    "telefone": "(11) 66666-6666",
    "email": "ana.costa@serfo.org",
    "endereco": "Rua das Flores, 321, Centro, São Paulo - SP",
    "dataIngresso": "'$(date -Iseconds)'",
    "observacoes": "Voluntária criada via teste da API"
  }'

echo ""
echo ""
echo "=== TESTES DE ASSISTIDOS ==="
echo ""
echo "6. 👥 Testando listagem de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos

echo ""
echo ""
echo "7. 📊 Testando estatísticas de assistidos..."
curl -s http://localhost:3001/api/v1/assistidos/statistics

echo ""
echo ""
echo "8. ✨ Testando criação de assistido..."
curl -s -X POST http://localhost:3001/api/v1/assistidos \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Carlos Silva",
    "cpf": "99988877766",
    "telefone": "(11) 77777-7777",
    "email": "carlos.silva@email.com",
    "endereco": "Av. Principal, 789, Jardim Norte, São Paulo - SP",
    "dataIngresso": "'$(date -Iseconds)'",
    "valorMensal": 100.00,
    "diaVencimento": 5,
    "observacoes": "Assistido criado via teste da API"
  }'

echo ""
echo ""
echo "9. 🔍 Testando busca de assistidos por dia de vencimento..."
curl -s http://localhost:3001/api/v1/assistidos/vencimento/15

echo ""
echo ""
echo "✅ Testes concluídos!"