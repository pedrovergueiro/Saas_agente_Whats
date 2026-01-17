# 🤖 BarberBot AI SaaS - WhatsApp Bot Platform

Uma plataforma SaaS completa para criar e gerenciar bots de WhatsApp com foco em barbearias e estabelecimentos de serviços.

## 🚀 Funcionalidades

- ✅ **Autenticação completa** (cadastro, login, JWT)
- ✅ **Criação de bots WhatsApp** com QR Code
- ✅ **Dashboard analytics** em tempo real
- ✅ **Gerenciamento de mensagens** personalizadas
- ✅ **Sistema de agendamentos** automatizado
- ✅ **Interface moderna** com Next.js e Tailwind
- ✅ **Backend robusto** com Node.js e SQLite
- ✅ **Deploy fácil** no Vercel

## 🛠️ Tecnologias

### Frontend
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações
- **Recharts** - Gráficos

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **SQLite** - Banco de dados
- **WhatsApp Web.js** - Integração WhatsApp
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 🚀 Deploy Rápido no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pedrovergueiro/Saas_agente_Whats)

### Variáveis de Ambiente no Vercel:
```
NODE_ENV=production
JWT_SECRET=4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28
VERCEL=1
```

## 💻 Desenvolvimento Local

### 1. Clone o repositório
```bash
git clone https://github.com/pedrovergueiro/Saas_agente_Whats.git
cd Saas_agente_Whats
```

### 2. Instale as dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure o ambiente
```bash
# Backend - copie e configure
cp backend/.env.example backend/.env
```

### 4. Inicialize o banco
```bash
cd backend
node init-database.js
```

### 5. Execute o projeto
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Login de teste**: `pedro@teste.com` / `teste123`

## 📁 Estrutura do Projeto

```
├── backend/
│   ├── api/                 # Serverless functions
│   ├── config/              # Configurações
│   ├── services/            # Serviços
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/
│   ├── pages/               # Páginas Next.js
│   ├── styles/              # Estilos
│   ├── next.config.js       # Config Next.js
│   └── package.json
├── docs/                    # Documentação
├── vercel.json              # Config Vercel
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=seu_jwt_secret_aqui
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📱 Como Usar

1. **Cadastre-se** na plataforma
2. **Crie um bot** no dashboard
3. **Escaneie o QR Code** com WhatsApp
4. **Configure mensagens** personalizadas
5. **Monitore** analytics em tempo real

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

Veja instruções detalhadas em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

## 📊 Funcionalidades Detalhadas

### Dashboard
- Analytics em tempo real
- Gráficos de mensagens e agendamentos
- Métricas de performance

### Bots WhatsApp
- Conexão via QR Code
- Mensagens automáticas
- Agendamento inteligente
- Cardápio digital

### Gerenciamento
- Múltiplos bots por usuário
- Configurações personalizáveis
- Histórico de atividades

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: suporte@barberbot.com
- 💬 WhatsApp: (11) 99999-9999
- 🐛 Issues: [GitHub Issues](https://github.com/pedrovergueiro/Saas_agente_Whats/issues)

## 🎯 Roadmap

- [ ] Integração com pagamentos (Stripe/PagSeguro)
- [ ] Sistema de templates de mensagens
- [ ] API para integrações externas
- [ ] App mobile React Native
- [ ] Suporte a múltiplos idiomas
- [ ] Analytics avançados
- [ ] Sistema de afiliados

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐