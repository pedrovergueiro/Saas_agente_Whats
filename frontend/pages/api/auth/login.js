// Backend integrado no Next.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// Dados em memória
let users = [];
let bots = [];

// Inicializar dados de teste
const initData = () => {
    if (users.length === 0) {
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
        
        console.log('✅ Dados de teste inicializados');
    }
};

export default async function handler(req, res) {
    initData();
    
    const { email, password } = req.body;
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido' });
    }
    
    try {
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
}