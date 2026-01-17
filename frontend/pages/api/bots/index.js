const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, run, initDatabase } = require('../../../lib/database-simple');

const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';

// Middleware de autenticação
const authenticate = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }
    
    return result.rows[0];
};

export default async function handler(req, res) {
    try {
        // Inicializar banco se necessário
        await initDatabase();

        // Autenticar usuário
        const user = await authenticate(req);

        if (req.method === 'GET') {
            // Listar bots
            const result = await query('SELECT * FROM bots WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
            res.json({ success: true, data: { bots: result.rows } });
        } else if (req.method === 'POST') {
            // Criar bot
            const { name, business_name, business_type } = req.body;
            
            const botId = uuidv4();
            await run(`
                INSERT INTO bots (id, user_id, name, business_name, business_type)
                VALUES (?, ?, ?, ?, ?)
            `, [botId, user.id, name, business_name, business_type || 'barber']);
            
            const result = await query('SELECT * FROM bots WHERE id = ?', [botId]);
            
            res.status(201).json({
                success: true,
                message: 'Bot criado com sucesso',
                data: { bot: result.rows[0] }
            });
        } else {
            res.status(405).json({ success: false, message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Erro na API de bots:', error);
        if (error.message.includes('Token') || error.message.includes('Usuário')) {
            res.status(401).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}