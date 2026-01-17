// API para listar e criar bots
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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
    
    if (req.method === 'GET') {
        const userBots = bots.filter(bot => bot.user_id === user.id);
        return res.json({ success: true, data: { bots: userBots } });
    }
    
    if (req.method === 'POST') {
        const { name, business_name, business_type } = req.body;
        
        const botId = uuidv4();
        const newBot = {
            id: botId,
            user_id: user.id,
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
        
        return res.status(201).json({
            success: true,
            message: 'Bot criado com sucesso',
            data: { bot: newBot }
        });
    }
    
    res.status(405).json({ success: false, message: 'Método não permitido' });
}