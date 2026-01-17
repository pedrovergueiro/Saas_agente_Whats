# 🔧 DEBUG ERRO LOGIN VERCEL

## 🧪 Para investigar o erro:

### 1. Testar API de Debug
Acesse: `https://seu-app.vercel.app/api/debug`

Isso vai mostrar:
- ✅ Variáveis de ambiente
- ✅ Status da conexão MongoDB
- ✅ Contagem de usuários
- ❌ Erros específicos

### 2. Verificar Logs no Vercel
1. Vá no Vercel Dashboard
2. Clique no seu projeto
3. Vá em **Functions**
4. Clique em **View Function Logs**
5. Procure por erros na API `/api/auth/login`

### 3. Verificar Variáveis de Ambiente
No Vercel Dashboard → Settings → Environment Variables:

**OBRIGATÓRIAS:**
```
NODE_ENV=production
JWT_SECRET=4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28
VERCEL=1
MONGODB_URI=mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority
```

### 4. Possíveis Problemas:

#### ❌ MongoDB URI incorreta
- Verificar se a string está completa
- Verificar se a senha está correta
- Verificar se o IP está liberado no MongoDB Atlas

#### ❌ Timeout de conexão
- MongoDB Atlas pode estar bloqueando conexões
- Verificar se o cluster está ativo

#### ❌ Variáveis de ambiente
- JWT_SECRET não definido
- MONGODB_URI não definido

#### ❌ Usuário de teste não existe
- Em produção, o usuário de teste não é criado
- Precisa cadastrar um usuário primeiro

## 🔧 SOLUÇÕES:

### Solução 1: Verificar MongoDB Atlas
1. Login no MongoDB Atlas
2. Verificar se o cluster está ativo
3. Verificar Network Access (liberar 0.0.0.0/0)
4. Verificar Database Access (usuário tem permissões)

### Solução 2: Criar usuário de teste em produção
Adicionar no `database-mongodb.js`:
```javascript
// Criar usuário de teste SEMPRE (não só em dev)
const existingUser = await database.collection('users').findOne({ email: 'pedro@teste.com' });
if (!existingUser) {
    // criar usuário...
}
```

### Solução 3: Redeploy
```bash
git add .
git commit -m "Debug melhorado"
git push origin main
```

## 🧪 TESTAR:

1. **Debug API**: `/api/debug`
2. **Test API**: `/api/test`
3. **Login**: Tentar login no frontend
4. **Logs**: Verificar logs no Vercel

## 📞 PRÓXIMOS PASSOS:

1. Acesse `/api/debug` e me mande o resultado
2. Verifique os logs no Vercel
3. Confirme se as variáveis de ambiente estão corretas