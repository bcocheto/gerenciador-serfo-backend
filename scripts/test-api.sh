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
echo "✅ Testes concluídos!"