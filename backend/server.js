// SERVIDOR SAAS COM QR CODE QUE FUNCIONA!
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, run, initDatabase } = require('./config/database-vercel');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// Armazenar clientes WhatsApp (Map por botId)
const whatsappClients = new Map();
const whatsappQRCodes = new Map();
const whatsappStatus = new Map();

// Criar cliente WhatsApp para um bot
function createWhatsAppClient(botId) {
    if (whatsappClients.has(botId)) {
        console.log(`✅ Cliente já existe para bot ${botId}`);
        return;
    }

    console.log(`📱 Criando cliente WhatsApp para bot ${botId}...`);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `bot-${botId}`
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log(`✅ QR Code gerado para bot ${botId}`);
        whatsappQRCodes.set(botId, qr);
        whatsappStatus.set(botId, 'qr_ready');
    });

    client.on('ready', async () => {
        console.log(`✅ Bot ${botId} conectado!`);
        whatsappQRCodes.delete(botId);
        whatsappStatus.set(botId, 'connected');
        
        try {
            const info = client.info;
            const phoneNumber = info.wid.user;
            
            await run(`
                UPDATE bots 
                SET status = 'connected', whatsapp_number = ?, connected_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [phoneNumber, botId]);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    });

    client.on('disconnected', async (reason) => {
        console.log(`❌ Bot ${botId} desconectado:`, reason);
        whatsappClients.delete(botId);
        whatsappQRCodes.delete(botId);
        whatsappStatus.set(botId, 'disconnected');
        
        try {
            await run(`UPDATE bots SET status = 'disconnected' WHERE id = ?`, [botId]);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    });

    client.on('message', async (message) => {
        if (!message.fromMe) {
            console.log(`📩 Mensagem no bot ${botId}: ${message.body}`);
            try {
                await run(`
                    UPDATE bots 
                    SET total_messages = total_messages + 1, last_activity_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [botId]);
            } catch (error) {
                console.error('Erro ao atualizar mensagens:', error);
            }
        }
    });

    whatsappClients.set(botId, client);
    whatsappStatus.set(botId, 'initializing');

    console.log(`🔄 Inicializando cliente para bot ${botId}...`);
    client.initialize();
}

// Middleware de autenticação
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token não fornecido' });
        }
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const result = await query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        req.user = result.rows[0];
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
        const { email, password } = req.body;
        
        const result = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }

        // Verificar se o email foi verificado (removido - cadastro direto)
        // if (!user.email_verified) {
        //     return res.status(403).json({ 
        //         success: false, 
        //         message: 'Email não verificado. Verifique sua caixa de entrada.',
        //         code: 'EMAIL_NOT_VERIFIED',
        //         email: user.email
        //     });
        // }
        
        // Atualizar último login
        await run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
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
                    email_verified: true // Sempre true agora
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
                email_verified: true // Sempre true agora
            }
        }
    });
});

// Rota para cadastro simples (sem verificação de email)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, full_name, phone, company_name } = req.body;

        // Validações básicas
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

        // Verificar se email já existe
        const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Este email já está cadastrado' 
            });
        }

        // Hash da senha
        const passwordHash = await bcrypt.hash(password, 12);

        // Criar usuário diretamente ativo
        const userId = uuidv4();
        await run(`
            INSERT INTO users (
                id, email, password_hash, full_name, phone, company_name,
                status, email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE)
        `, [userId, email, passwordHash, full_name, phone, company_name]);

        // Gerar token JWT
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
        const result = await query('SELECT * FROM bots WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json({ success: true, data: { bots: result.rows } });
    } catch (error) {
        console.error('Erro ao listar bots:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar bots' });
    }
});

app.post('/api/bots', authenticate, async (req, res) => {
    try {
        const { name, business_name, business_type } = req.body;
        
        const botId = uuidv4();
        await run(`
            INSERT INTO bots (id, user_id, name, business_name, business_type)
            VALUES (?, ?, ?, ?, ?)
        `, [botId, req.user.id, name, business_name, business_type || 'barber']);
        
        const result = await query('SELECT * FROM bots WHERE id = ?', [botId]);
        
        res.status(201).json({
            success: true,
            message: 'Bot criado com sucesso',
            data: { bot: result.rows[0] }
        });
    } catch (error) {
        console.error('Erro ao criar bot:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar bot' });
    }
});

app.get('/api/bots/:botId', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        res.json({ success: true, data: { bot: result.rows[0] } });
    } catch (error) {
        console.error('Erro ao buscar bot:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar bot' });
    }
});

app.put('/api/bots/:botId', authenticate, async (req, res) => {
    try {
        const { name, business_name, business_address, business_phone, open_time, close_time, work_days } = req.body;
        
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        await run(`
            UPDATE bots 
            SET name = ?, business_name = ?, business_address = ?, business_phone = ?, 
                open_time = ?, close_time = ?, work_days = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `, [name, business_name, business_address, business_phone, open_time, close_time, work_days, req.params.botId, req.user.id]);
        
        const updated = await query('SELECT * FROM bots WHERE id = ?', [req.params.botId]);
        
        res.json({
            success: true,
            message: 'Bot atualizado com sucesso',
            data: { bot: updated.rows[0] }
        });
    } catch (error) {
        console.error('Erro ao atualizar bot:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar bot' });
    }
});

// QR Code - USANDO O CÓDIGO QUE FUNCIONA!
app.get('/api/bots/:botId/qr', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        const botId = req.params.botId;
        const status = whatsappStatus.get(botId) || 'disconnected';

        // Se conectado
        if (status === 'connected') {
            return res.json({
                success: true,
                data: {
                    status: 'connected',
                    message: 'WhatsApp conectado'
                }
            });
        }

        // Se tem QR Code
        if (whatsappQRCodes.has(botId)) {
            const qr = whatsappQRCodes.get(botId);
            return res.json({
                success: true,
                data: {
                    status: 'qr_available',
                    qr_code: qr
                }
            });
        }

        // Se está inicializando
        if (status === 'initializing') {
            return res.json({
                success: true,
                data: {
                    status: 'initializing',
                    message: 'Gerando QR Code...'
                }
            });
        }

        // Se não tem cliente, criar
        if (!whatsappClients.has(botId)) {
            createWhatsAppClient(botId);
            return res.json({
                success: true,
                data: {
                    status: 'initializing',
                    message: 'Iniciando WhatsApp...'
                }
            });
        }

        res.json({
            success: true,
            data: {
                status: status,
                message: 'Aguardando...'
            }
        });
    } catch (error) {
        console.error('Erro ao obter QR:', error);
        res.status(500).json({ success: false, message: 'Erro ao obter QR Code' });
    }
});

app.post('/api/bots/:botId/reconnect', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        const botId = req.params.botId;
        const client = whatsappClients.get(botId);
        
        if (client) {
            try {
                await client.destroy();
            } catch (err) {
                console.log('Erro ao destruir, continuando...');
            }
            whatsappClients.delete(botId);
            whatsappQRCodes.delete(botId);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        createWhatsAppClient(botId);
        
        res.json({
            success: true,
            message: 'Reconexão iniciada'
        });
    } catch (error) {
        console.error('Erro ao reconectar:', error);
        res.status(500).json({ success: false, message: 'Erro ao reconectar' });
    }
});

app.post('/api/bots/:botId/disconnect', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        const botId = req.params.botId;
        const client = whatsappClients.get(botId);
        
        if (client) {
            await client.destroy();
            whatsappClients.delete(botId);
            whatsappQRCodes.delete(botId);
            whatsappStatus.set(botId, 'disconnected');
        }

        await run(`
            UPDATE bots 
            SET status = 'disconnected', whatsapp_number = NULL, connected_at = NULL
            WHERE id = ?
        `, [botId]);
        
        res.json({
            success: true,
            message: 'Bot desconectado'
        });
    } catch (error) {
        console.error('Erro ao desconectar:', error);
        res.status(500).json({ success: false, message: 'Erro ao desconectar' });
    }
});

app.get('/api/bots/:botId/stats', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT * FROM bots WHERE id = ? AND user_id = ?', [req.params.botId, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        const bot = result.rows[0];
        
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

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsapp_clients: whatsappClients.size,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
    initDatabase().then(() => {
        app.listen(PORT, () => {
            console.log('🚀 ============================================');
            console.log('🚀 SAAS COM QR CODE QUE FUNCIONA!');
            console.log(`🚀 Servidor: http://localhost:${PORT}`);
            console.log('🚀 ============================================');
            console.log('👤 Login: pedro@teste.com / teste123');
            console.log('🌐 Frontend: http://localhost:3000');
            console.log('🚀 ============================================');
        });
    }).catch(err => {
        console.error('❌ Erro:', err);
        process.exit(1);
    });
} else {
    // Para produção (Vercel), inicializar banco sem listen
    initDatabase().catch(err => {
        console.error('❌ Erro ao inicializar banco:', err);
    });
}

// Exportar app para Vercel
module.exports = app;
