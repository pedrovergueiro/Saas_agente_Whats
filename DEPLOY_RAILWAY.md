# 🚀 Deploy no Railway - BarberBot AI SaaS

## 📋 Pré-requisitos

1. **Conta no Railway**: https://railway.app
2. **Repositório no GitHub**: https://github.com/pedrovergueiro/Saas_agente_Whats
3. **MongoDB Atlas**: Já configurado com as credenciais

## 🔧 Configuração do Railway

### 1. Criar Novo Projeto

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório: `pedrovergueiro/Saas_agente_Whats`

### 2. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28
MONGODB_URI=mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority
```

### 3. Configurar Build e Deploy

O Railway detectará automaticamente o `package.json` na raiz e executará:

- **Build Command**: `npm run build` (executa `build-railway.js`)
- **Start Command**: `npm start` (executa `start-railway.js`)

## 🏗️ Como Funciona

### Estrutura do Deploy

```
📦 Railway Deploy
├── 🔧 Backend (Node.js + Express) - Porta 5000
│   ├── API Routes (/api/*)
│   ├── WhatsApp Integration
│   └── MongoDB Connection
├── 🎨 Frontend (Next.js) - Porta 3000
│   ├── React Components
│   ├── Static Files
│   └── API Calls to Backend
└── 🗄️ MongoDB Atlas (External)
    ├── Users Collection
    ├── Bots Collection
    └── Messages Collection
```

### Processo de Build

1. **Instala dependências** do backend e frontend
2. **Compila o frontend** (Next.js build)
3. **Cria scripts** de inicialização
4. **Configura ambiente** de produção

### Processo de Start

1. **Inicia o backend** na porta definida pelo Railway
2. **Aguarda 3 segundos** para estabilizar
3. **Inicia o frontend** conectado ao backend
4. **Monitora processos** e reinicia se necessário

## 🔍 Verificação do Deploy

### 1. Logs do Deploy

No Railway, vá em **Deployments** > **View Logs** para acompanhar:

```
🚀 Iniciando build para Railway...
📦 Instalando dependências do backend...
📦 Instalando dependências do frontend...
🏗️ Fazendo build do frontend...
✅ Build concluído com sucesso!
```

### 2. Logs da Aplicação

Após o deploy, verifique os logs em **View Logs**:

```
🚀 Iniciando BarberBot AI SaaS no Railway...
🔧 Iniciando backend na porta 5000
🔌 Conectando ao MongoDB...
✅ Conectado ao MongoDB
✅ MongoDB inicializado com sucesso!
👥 Usuários: 1
🤖 Bots: 0
🚀 Servidor: http://localhost:5000
🎨 Iniciando frontend na porta 3000
```

### 3. Testar a Aplicação

1. **Acesse a URL** fornecida pelo Railway
2. **Faça login** com: `pedro@teste.com` / `teste123`
3. **Crie um bot** para testar
4. **Gere QR Code** para conectar WhatsApp

## 🐛 Troubleshooting

### Erro de Conexão MongoDB

Se aparecer erro de SSL/TLS:

```bash
# Verificar logs do MongoDB
# O Railway tem melhor compatibilidade com MongoDB Atlas
```

### Erro de Build

Se o build falhar:

```bash
# Verificar se todas as dependências estão no package.json
# Verificar se os caminhos estão corretos
```

### Erro de Porta

Se houver conflito de portas:

```bash
# O Railway define automaticamente a PORT
# O backend usa process.env.PORT
# O frontend usa uma porta diferente
```

## 📊 Monitoramento

### Métricas Disponíveis

- **CPU Usage**: Uso do processador
- **Memory Usage**: Uso de memória
- **Network**: Tráfego de rede
- **Response Time**: Tempo de resposta

### Health Check

A aplicação tem um endpoint de saúde:

```
GET /health
```

Retorna:
```json
{
  "status": "ok",
  "whatsapp_clients": 0,
  "timestamp": "2026-01-17T16:00:00.000Z"
}
```

## 🔄 Atualizações

Para atualizar a aplicação:

1. **Faça push** para o repositório GitHub
2. **Railway detecta** automaticamente
3. **Rebuild automático** é iniciado
4. **Deploy automático** após build bem-sucedido

## 💡 Dicas

1. **Use os logs** para debugar problemas
2. **Monitore o uso** de recursos
3. **Configure alertas** se necessário
4. **Mantenha backups** do MongoDB
5. **Teste localmente** antes de fazer push

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ **Configurar domínio personalizado** (opcional)
2. ✅ **Configurar SSL** (automático no Railway)
3. ✅ **Monitorar performance**
4. ✅ **Configurar backups** do MongoDB
5. ✅ **Testar todas as funcionalidades**

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** no Railway
2. **Teste localmente** primeiro
3. **Verifique as variáveis** de ambiente
4. **Confirme a conexão** com MongoDB

**Login de Teste**: pedro@teste.com / teste123