const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run, initDatabase } = require('../../../lib/database-mongodb');

const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';

export default async function handler(req, res) {
    // Log para debug
    console.log('🔐 Login attempt:', {
        method: req.method,
        body: req.body ? { email: req.body.email, hasPassword: !!req.body.password } : 'no body',
        env: process.env.NODE_ENV,
        mongoUri: process.env.MONGODB_URI ? 'defined' : 'undefined'
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Verificar se dados foram enviados
        if (!req.body || !req.body.email || !req.body.password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email e senha são obrigatórios',
                debug: { hasBody: !!req.body, hasEmail: !!req.body?.email, hasPassword: !!req.body?.password }
            });
        }

        // Inicializar banco se necessário
        console.log('📦 Inicializando banco...');
        await initDatabase();
        console.log('✅ Banco inicializado');

        const { email, password } = req.body;
        
        console.log('🔍 Buscando usuário:', email);
        const result = await query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('📊 Resultado da busca:', { found: result.rows.length > 0 });
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou senha incorretos',
                debug: { userFound: false }
            });
        }
        
        const user = result.rows[0];
        console.log('👤 Usuário encontrado:', { id: user.id, email: user.email });
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('🔒 Senha válida:', isValid);
        
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou senha incorretos',
                debug: { userFound: true, passwordValid: false }
            });
        }
        
        // Atualizar último login
        console.log('📝 Atualizando último login...');
        await run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        console.log('🎫 Token gerado');
        
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
        console.error('❌ Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao fazer login',
            debug: {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
}