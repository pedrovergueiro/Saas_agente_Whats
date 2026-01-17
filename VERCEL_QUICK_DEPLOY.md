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
4. **IMPORTANTE**: Use um nome diferente como:
   - `barberbot-ai-saas`
   - `whatsapp-bot-platform`
   - `saas-whatsapp-bot`
   - `barber-whatsapp-ai`

## 3. Configurações do Projeto
- **Framework**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## 4. Variáveis de Ambiente
Adicione no Vercel Dashboard:
```
NODE_ENV=production
JWT_SECRET=4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28
VERCEL=1
```

## 5. Deploy!
Clique "Deploy" e aguarde.

## ✅ Pronto!
Seu BarberBot AI SaaS estará online em poucos minutos.

## 🔧 Se der erro:
1. **Nome já existe**: Use outro nome de projeto
2. **Build falha**: Verifique se Root Directory está como `frontend`
3. **API não funciona**: Verifique se as variáveis de ambiente estão corretas

## 📝 Notas Importantes
- Banco SQLite é temporário no Vercel
- Para produção real, use PostgreSQL
- WhatsApp sessions não persistem entre deploys