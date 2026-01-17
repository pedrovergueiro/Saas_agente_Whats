const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, run, initDatabase } = require('../../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Inicializar banco se necessário
        await initDatabase();

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
}