# 🧪 TESTAR CONTA NO VERCEL

## ✅ CONFIRMADO: A conta existe e funciona localmente!

**Teste local realizado:**
- ✅ MongoDB conectado: 2 usuários
- ✅ Conta `pedro@teste.com` existe
- ✅ Login funcionando perfeitamente

## 🚀 DEPLOY DAS CORREÇÕES:

```bash
git add .
git commit -m "APIs de debug para verificar conta de teste no Vercel"
git push origin main
```

## 🧪 TESTAR NO VERCEL:

### 1. Primeiro, verificar se MongoDB está conectado:
`https://seu-app.vercel.app/api/debug`

**Deve mostrar:**
```json
{
  "success": true,
  "mongodb": {
    "status": "CONECTADO - X usuários"
  }
}
```

### 2. Listar usuários existentes:
`https://seu-app.vercel.app/api/list-users`

**Deve mostrar:**
```json
{
  "success": true,
  "count": X,
  "users": [...]
}
```

### 3. Criar/verificar conta de teste:
`https://seu-app.vercel.app/api/create-test-user`

**Deve mostrar:**
```json
{
  "success": true,
  "message": "Usuário de teste criado/já existe"
}
```

### 4. Testar login no frontend:
- Email: `pedro@teste.com`
- Senha: `teste123`

## 🔧 SE DER ERRO:

### ❌ Se `/api/debug` falhar:
- Variável `MONGODB_URI` não está no Vercel
- MongoDB Atlas está bloqueando conexões

### ❌ Se `/api/list-users` mostrar 0 usuários:
- Banco está vazio
- Problema na conexão

### ❌ Se `/api/create-test-user` falhar:
- Problema de permissão no MongoDB
- Erro na criação do usuário

## 📋 CHECKLIST VERCEL:

1. **Variáveis de ambiente definidas?**
   - `NODE_ENV=production`
   - `JWT_SECRET=...`
   - `MONGODB_URI=mongodb+srv://...`
   - `VERCEL=1`

2. **MongoDB Atlas configurado?**
   - Cluster ativo
   - Network Access: 0.0.0.0/0
   - Database User: pedrolvergueiro_db_user
   - Senha: 5yoTGgxNSlf1C0us

3. **Deploy realizado?**
   - Commit e push feitos
   - Build no Vercel concluído

## 🎯 RESULTADO ESPERADO:

Após o deploy, a conta `pedro@teste.com` / `teste123` deve funcionar no Vercel.

**Se ainda não funcionar, me mande o resultado das APIs de debug!** 🔍