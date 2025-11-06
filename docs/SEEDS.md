# 🌱 Seeds e Validação do Sistema

Este documento descreve como usar os scripts de seed e validação do Gerenciador SERFO.

## Scripts Disponíveis

### 📊 Seeds do Banco de Dados

#### `npm run db:seed`

Popula o banco com dados iniciais completos (desenvolvimento):

- Configurações do sistema
- Templates de email padrão
- Dados de exemplo (voluntários, assistidos, contribuições)

#### `npm run db:seed:prod`

Popula apenas com dados essenciais (produção):

- Configurações mínimas do sistema
- Templates de email básicos
- Sem dados de exemplo

### 🧹 Limpeza e Reset

#### `npm run db:reset`

Limpa completamente o banco de dados (remove todos os dados)

#### `npm run db:fresh`

Limpa o banco e repopula com dados de desenvolvimento:

```bash
npm run db:reset && npm run db:seed
```

### 🔍 Validação

#### `npm run validate`

Executa validação completa do sistema:

- Testa conexão com banco
- Verifica estrutura das tabelas
- Valida configurações essenciais
- Testa templates de email
- Verifica relacionamentos
- Mostra estatísticas

#### `npm run test:db`

Teste básico de conexão com banco

## 📋 Dados Criados pelos Seeds

### Configurações do Sistema

- `sistema_nome`: Nome do sistema
- `sistema_versao`: Versão atual
- `email_remetente_padrao`: Email padrão para notificações
- `contribuicao_dia_vencimento_padrao`: Dia padrão de vencimento
- `contribuicao_valor_minimo`: Valor mínimo de contribuição
- `notificacao_dias_antecedencia`: Dias para notificar vencimentos

### Templates de Email

- **Cobrança Padrão**: Para cobrança de contribuições
- **Lembrete Vencimento**: Lembrete antes do vencimento
- **Agradecimento Pagamento**: Confirmação de pagamento
- **Boas-vindas**: Para novos usuários

### Dados de Exemplo (apenas desenvolvimento)

- Voluntário administrador: `admin@serfo.org`
- Assistido exemplo: `assistido@exemplo.com`
- Contribuições de exemplo
- Movimentação financeira exemplo

## 🚀 Fluxo Recomendado

### Primeiro Setup (Desenvolvimento)

```bash
npm run db:migrate        # Criar tabelas
npm run db:seed           # Popular com dados
npm run validate          # Validar sistema
```

### Primeiro Setup (Produção)

```bash
npm run db:migrate        # Criar tabelas
npm run db:seed:prod      # Popular apenas essenciais
npm run validate          # Validar sistema
```

### Reset para Desenvolvimento

```bash
npm run db:fresh          # Limpa e repopula
npm run validate          # Validar
```

### Validação Regular

```bash
npm run validate          # Verificar integridade
```

## 🔧 Customização

### Adicionando Novas Configurações

Edite `scripts/seed.ts` ou `scripts/seed-production.ts` e adicione na array `configuracoes`:

```typescript
{
  chave: 'nova_configuracao',
  valor: 'valor_padrao',
  descricao: 'Descrição da configuração',
  tipo: 'string'
}
```

### Adicionando Novos Templates

Adicione na array `templates`:

```typescript
{
  nome: 'Nome do Template',
  assunto: 'Assunto do email',
  corpo: 'Corpo do email com {{variaveis}}',
  tipo: 'tipo_template',
  ativo: true
}
```

### Variáveis Disponíveis nos Templates

- `{{nomeCompleto}}`: Nome da pessoa
- `{{dataVencimento}}`: Data de vencimento
- `{{valor}}`: Valor da contribuição
- `{{dataPagamento}}`: Data do pagamento
- `{{diasParaVencimento}}`: Dias até o vencimento
- `{{referencia}}`: Referência da contribuição

## ⚠️ Importantes

1. **Sempre faça backup** antes de executar `db:reset`
2. **Use `db:seed:prod`** em produção para evitar dados de teste
3. **Execute `validate`** após qualquer mudança no banco
4. **Não commite** dados sensíveis nos seeds

## 🐛 Troubleshooting

### Erro de Conexão

```bash
npm run test:db          # Verificar conexão básica
```

### Erro de Tipos

```bash
npx tsc --noEmit         # Verificar tipagens
```

### Reset Completo

```bash
npm run db:reset         # Limpar tudo
npm run db:migrate       # Recriar estrutura
npm run db:seed          # Popular novamente
```
