const { connectDB } = require('../../lib/database-mongodb');

export default async function handler(req, res) {
    try {
        console.log('📋 Listando usuários...');
        
        const database = await connectDB();
        
        // Buscar todos os usuários (sem mostrar senhas)
        const users = await database.collection('users').find({}, {
            projection: {
                password_hash: 0 // Não mostrar senha
            }
        }).toArray();
        
        console.log(`👥 Encontrados ${users.length} usuários`);
        
        res.json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                plan_type: user.plan_type,
                status: user.status,
                created_at: user.created_at,
                last_login_at: user.last_login_at
            }))
        });
        
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar usuários',
            error: error.message
        });
    }
}