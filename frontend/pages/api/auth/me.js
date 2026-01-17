// API para perfil do usuário
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// Dados em memória
let users = [];

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
    
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Método não permitido' });
    }
    
    const user = authenticate(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    
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
            }
        }
    });
}