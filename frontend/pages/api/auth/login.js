const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run, initDatabase } = require('../../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Inicializar banco se necessário
        await initDatabase();

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