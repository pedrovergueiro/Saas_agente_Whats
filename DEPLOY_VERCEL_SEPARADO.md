# 🚀 Deploy Separado no Vercel - Backend + Frontend

## 🎯 Estratégia: Dois Projetos Separados

### **📋 Pré-requisitos**
- Conta no Vercel
- Repositório no GitHub atualizado
- MongoDB Atlas configurado

## 🔧 **PASSO 1: Deploy do Backend**

### 1.1 Criar Projeto Backend
1. Acesse https://vercel.com/new
2. Selecione o repositório: `pedrovergueiro/Saas_agente_Whats`
3. **Configure:**
   - **Project Name**: `barberbot-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: (deixe vazio)
   - **Install Command**: `npm install`

### 1.2 Variáveis de Ambiente Backend
```env
NODE_ENV=production
JWT_SECRET=4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28
MONGODB_URI=mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority
VERCEL=1
```

### 1.3 Configuração Especial Backend
Crie arquivo `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/health",
      "dest": "server.js"
    }
  ]
}
```

## 🎨 **PASSO 2: Deploy do Frontend**

### 2.1 Criar Projeto Frontend
1. Acesse https://vercel.com/new novamente
2. Selecione o MESMO repositório: `pedrovergueiro/Saas_agente_Whats`
3. **Configure:**
   - **Project Name**: `barberbot-frontend`
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.2 Variáveis de Ambiente Frontend
```env
NEXT_PUBLIC_API_URL=https://barberbot-backend.vercel.app/api
NODE_ENV=production
```

**⚠️ IMPORTANTE**: Substitua `barberbot-backend` pela URL real do seu backend!

## 🔗 **PASSO 3: Conectar Frontend ao Backend**

### 3.1 Atualizar URL do Backend
Após o deploy do backend, você terá uma URL como:
```
https://barberbot-backend-abc123.vercel.app
```

### 3.2 Atualizar Frontend
1. Vá no projeto frontend no Vercel
2. Settings → Environment Variables
3. Atualize `NEXT_PUBLIC_API_URL`:
```env
NEXT_PUBLIC_API_URL=https://SUA-URL-BACKEND.vercel.app/api
```

### 3.3 Redeploy Frontend
1. Vá em Deployments
2. Clique nos "..." do último deploy
3. Clique em "Redeploy"

## ✅ **PASSO 4: Testar**

### 4.1 Testar Backend
Acesse: `https://SUA-URL-BACKEND.vercel.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "whatsapp_clients": 0,
  "timestamp": "2026-01-17T..."
}
```

### 4.2 Testar Frontend
1. Acesse: `https://SUA-URL-FRONTEND.vercel.app`
2. Faça login: `pedro@teste.com / teste123`
3. Crie um bot
4. Gere QR Code

## 🔧 **Configuração Avançada (Opcional)**

### Arquivo backend/vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/health",
      "dest": "server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

## 🐛 **Troubleshooting**

### Erro de CORS
Se der erro de CORS, adicione no backend:
```javascript
app.use(cors({
  origin: ['https://SUA-URL-FRONTEND.vercel.app'],
  credentials: true
}));
```

### Erro de MongoDB
- Verificar se MONGODB_URI está correto
- Verificar se IP está liberado no MongoDB Atlas
- Verificar logs no Vercel

### Erro de Build
- Verificar se todas as dependências estão no package.json
- Verificar se Root Directory está correto

## 📊 **Vantagens desta Abordagem**

✅ **Backend e Frontend independentes**
✅ **Escalabilidade separada**
✅ **Deploys independentes**
✅ **Logs separados**
✅ **Configurações específicas**

## 🎯 **URLs Finais**

Após o deploy, você terá:
- **Backend**: `https://barberbot-backend-xyz.vercel.app`
- **Frontend**: `https://barberbot-frontend-abc.vercel.app`
- **Login**: pedro@teste.com / teste123

---

**Status**: ✅ PRONTO PARA DEPLOY SEPARADO NO VERCEL