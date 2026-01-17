# Deploy no Vercel - BarberBot AI SaaS

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Projeto no GitHub/GitLab/Bitbucket

## Passos para Deploy

### 1. Preparar o Repositório

```bash
# Fazer commit de todas as mudanças
git add .
git commit -m "Preparado para deploy no Vercel"
git push origin main
```

### 2. Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório
4. Configure as variáveis de ambiente:

#### Variáveis de Ambiente Obrigatórias:

```
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_mude_isso
VERCEL=1
```

#### Variáveis Opcionais:
```
NEXT_PUBLIC_API_URL=/api
```

### 3. Configurações do Projeto

- **Framework Preset**: Next.js
- **Root Directory**: Deixe vazio (raiz do projeto)
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/.next`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Teste a aplicação

## Estrutura de Arquivos para Vercel

```
projeto/
├── vercel.json              # Configuração do Vercel
├── backend/
│   ├── api/
│   │   └── index.js         # Entry point para serverless
│   ├── server.js            # Servidor principal
│   └── config/
│       └── database-vercel.js # Banco adaptado
├── frontend/
│   ├── .env.production      # Variáveis de produção
│   └── next.config.js       # Config do Next.js
└── README.md
```

## Funcionalidades Adaptadas

✅ **Backend Serverless**: Adaptado para functions do Vercel
✅ **Banco SQLite**: Usando /tmp no Vercel (dados temporários)
✅ **Frontend Next.js**: Otimizado para Vercel
✅ **API Routes**: Configuradas para /api/*
✅ **Variáveis de Ambiente**: Configuradas para produção

## Limitações no Vercel

⚠️ **Banco de Dados**: SQLite em /tmp é temporário (dados são perdidos a cada deploy)
⚠️ **WhatsApp Sessions**: Sessões não persistem entre restarts
⚠️ **File Storage**: Arquivos não persistem

## Recomendações para Produção

Para um ambiente de produção real, considere:

1. **Banco de Dados**: PostgreSQL (Supabase, PlanetScale)
2. **File Storage**: AWS S3, Cloudinary
3. **Session Storage**: Redis (Upstash)
4. **WhatsApp**: Implementar reconexão automática

## Comandos Úteis

```bash
# Testar localmente
npm run dev

# Build de produção
cd frontend && npm run build

# Deploy manual via CLI
npx vercel --prod
```

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no package.json
- Confirme as variáveis de ambiente

### API não funciona
- Verifique se as rotas estão em /api/*
- Confirme o vercel.json

### Banco não inicializa
- Verifique logs no Vercel Dashboard
- Confirme permissões de /tmp

## Suporte

Para problemas específicos, verifique:
1. Logs no Vercel Dashboard
2. Console do navegador
3. Network tab para erros de API