// BACKEND SERVERLESS PARA VERCEL
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

// CORS configurado para Vercel
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// ============================================
// BANCO DE DADOS EM MEMÓRIA (PARA VERCEL)
// ============================================

// Dados em memória (será perdido a cada deploy, mas funciona para testes)
let users = [];
let bots = [];

// Inicializar dados de teste
const initData = () => {
    if (users.length === 0) {
        const bcryptSync = require('bcryptjs');
        const testPassword = bcryptSync.hashSync('teste123', 10);
        
        users.push({
            id: 'test-user-123',
            email: 'pedro@teste.com',
            password_hash: testPassword,
            full_name: 'Pedro Teste',
            phone: null,
            company_name: null,
            plan_type: 'premium',
            status: 'active',
            email_verified: true,
            max_bots: 999,
            max_messages_month: 999999,
            messages_used_month: 0,
            created_at: new Date(),
            updated_at: new Date(),
            last_login_at: null
        });
        
        console.log('✅ Dados de teste inicializados');
    }
};

// Middleware de autenticação
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token não fornecido' });
        }
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = users.find(u => u.id === decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

app.post('/api/auth/login', async (req, res) => {
    try {
        initData();
        
        const { email, password } = req.body;
        
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        // Atualizar último login
        user.last_login_at = new Date();
        
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    plan_type: user.plan_type,
                    status: user.status,
                    email_verified: true
                },
                token
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro ao fazer login' });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                email: req.user.email,
                full_name: req.user.full_name,
                plan_type: req.user.plan_type,
                status: req.user.status,
                email_verified: true
            }
        }
    });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        initData();
        
        const { email, password, full_name, phone, company_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, senha e nome completo são obrigatórios' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'A senha deve ter pelo menos 6 caracteres' 
            });
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: 'Este email já está cadastrado' 
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const userId = uuidv4();
        
        const newUser = {
            id: userId,
            email,
            password_hash: passwordHash,
            full_name,
            phone,
            company_name,
            plan_type: 'basic',
            status: 'active',
            email_verified: true,
            max_bots: 1,
            max_messages_month: 500,
            messages_used_month: 0,
            created_at: new Date(),
            updated_at: new Date(),
            last_login_at: null
        };
        
        users.push(newUser);

        const token = jwt.sign({ userId: userId, email: email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'Cadastro realizado com sucesso!',
            data: {
                user: {
                    id: userId,
                    email: email,
                    full_name: full_name,
                    plan_type: 'basic',
                    status: 'active',
                    email_verified: true
                },
                token: token
            }
        });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// ============================================
// ROTAS DE BOTS
// ============================================

app.get('/api/bots', authenticate, async (req, res) => {
    try {
        const userBots = bots.filter(bot => bot.user_id === req.user.id);
        res.json({ success: true, data: { bots: userBots } });
    } catch (error) {
        console.error('Erro ao listar bots:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar bots' });
    }
});

app.post('/api/bots', authenticate, async (req, res) => {
    try {
        const { name, business_name, business_type } = req.body;
        
        const botId = uuidv4();
        const newBot = {
            id: botId,
            user_id: req.user.id,
            name,
            business_name,
            business_type: business_type || 'barber',
            whatsapp_number: null,
            status: 'disconnected',
            qr_code: null,
            qr_generated_at: null,
            connected_at: null,
            last_activity_at: null,
            business_address: null,
            business_phone: null,
            open_time: '08:00',
            close_time: '18:00',
            work_days: '1,2,3,4,5,6',
            ai_enabled: true,
            ai_personality: 'friendly',
            auto_responses: true,
            total_messages: 0,
            total_appointments: 0,
            total_revenue: 0,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        bots.push(newBot);
        
        res.status(201).json({
            success: true,
            message: 'Bot criado com sucesso',
            data: { bot: newBot }
        });
    } catch (error) {
        console.error('Erro ao criar bot:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar bot' });
    }
});

app.get('/api/bots/:botId', authenticate, async (req, res) => {
    try {
        const bot = bots.find(b => b.id === req.params.botId && b.user_id === req.user.id);
        
        if (!bot) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        res.json({ success: true, data: { bot } });
    } catch (error) {
        console.error('Erro ao buscar bot:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar bot' });
    }
});

app.get('/api/bots/:botId/qr', authenticate, async (req, res) => {
    try {
        const bot = bots.find(b => b.id === req.params.botId && b.user_id === req.user.id);
        
        if (!bot) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        // Simular QR Code para demo
        const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=WhatsApp-Bot-${req.params.botId}`;
        
        res.json({
            success: true,
            data: {
                status: 'qr_available',
                qr_code: qrCode,
                message: 'QR Code gerado (demo)'
            }
        });
    } catch (error) {
        console.error('Erro ao obter QR:', error);
        res.status(500).json({ success: false, message: 'Erro ao obter QR Code' });
    }
});

app.get('/api/bots/:botId/stats', authenticate, async (req, res) => {
    try {
        const bot = bots.find(b => b.id === req.params.botId && b.user_id === req.user.id);
        
        if (!bot) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        res.json({
            success: true,
            data: {
                stats: {
                    total_messages: bot.total_messages,
                    total_appointments: bot.total_appointments,
                    total_revenue: bot.total_revenue,
                    total_customers: 0
                }
            }
        });
    } catch (error) {
        console.error('Erro ao buscar stats:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    initData();
    res.json({
        status: 'ok',
        platform: 'vercel',
        users: users.length,
        bots: bots.length,
        timestamp: new Date().toISOString()
    });
});

// Rota raiz
app.get('/api', (req, res) => {
    res.json({
        message: 'BarberBot API - Vercel Serverless',
        status: 'running',
        endpoints: [
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/me',
            'GET /api/bots',
            'POST /api/bots',
            'GET /api/bots/:id',
            'GET /api/bots/:id/qr',
            'GET /api/health'
        ]
    });
});

// Export para Vercel
module.exports = app;