# 🚀 Deploy Rápido no Vercel

## 1. Preparar Repositório
```bash
git add .
git commit -m "Preparado para Vercel"
git push origin main
```

## 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique "New Project"
3. Importe seu repositório
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: (deixe vazio)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/.next`

## 3. Variáveis de Ambiente
Adicione no Vercel Dashboard:
```
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
VERCEL=1
```

## 4. Deploy!
Clique "Deploy" e aguarde.

## ✅ Pronto!
Seu BarberBot AI SaaS estará online em poucos minutos.

## 📝 Notas Importantes
- Banco SQLite é temporário no Vercel
- Para produção real, use PostgreSQL
- WhatsApp sessions não persistem entre deploys