// API para cadastro de usuários
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_super_seguro_mude_isso';

// Dados em memória
let users = [];

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
    }
};

export default async function handler(req, res) {
    initData();
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido' });
    }
    
    try {
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
}