// API para estatísticas do bot
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// Dados em memória
let users = [];
let bots = [];

// Inicializar dados de teste
const initData = () => {
    if (users.length === 0) {
        const bcrypt = require('bcryptjs');
        const testPassword = bcrypt.hashSync('teste123', 10);
        
        users.push({
            id: 'test-user-123',
            email: 'pedro@teste.com',
            password_hash: testPassword,
            full_name: 'Pedro Teste',
            plan_type: 'premium',
            status: 'active',
            email_verified: true,
            max_bots: 999,
            max_messages_month: 999999
        });
    }
};

// Middleware de autenticação
const authenticate = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);
        return user;
    } catch (error) {
        return null;
    }
};

export default function handler(req, res) {
    initData();
    
    const user = authenticate(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
    const { botId } = req.query;
    
    if (req.method === 'GET') {
        const bot = bots.find(b => b.id === botId && b.user_id === user.id);
        
        if (!bot) {
            return res.status(404).json({ success: false, message: 'Bot não encontrado' });
        }
        
        return res.json({
            success: true,
            data: {
                stats: {
                    total_messages: bot.total_messages || 0,
                    total_appointments: bot.total_appointments || 0,
                    total_revenue: bot.total_revenue || 0,
                    total_customers: 0
                }
            }
        });
    }
    
    res.status(405).json({ success: false, message: 'Método não permitido' });
}