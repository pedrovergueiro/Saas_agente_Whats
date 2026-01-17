const jwt = require('jsonwebtoken');
const { query, initDatabase } = require('../../../lib/database');

const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Inicializar banco se necessário
        await initDatabase();

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
        
        const user = result.rows[0];
        
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
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
}