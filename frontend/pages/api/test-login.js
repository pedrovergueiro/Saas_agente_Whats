const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    let client;
    
    try {
        console.log('🧪 TESTANDO LOGIN COMPLETO...');
        
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            return res.status(500).json({
                success: false,
                error: 'MONGODB_URI não definida'
            });
        }
        
        // Conectar ao MongoDB
        console.log('🔌 Conectando...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db('barberbot');
        
        // Buscar usuário
        console.log('🔍 Buscando pedro@teste.com...');
        const user = await db.collection('users').findOne({ email: 'pedro@teste.com' });
        
        if (!user) {
            return res.json({
                success: false,
                error: 'Usuário não encontrado',
                step: 'user_search',
                total_users: await db.collection('users').countDocuments(),
                all_users: await db.collection('users').find({}, { projection: { email: 1, full_name: 1 } }).toArray()
            });
        }
        
        console.log('👤 Usuário encontrado:', user.email);
        
        // Testar senha
        console.log('🔒 Testando senha...');
        const isValid = await bcrypt.compare('teste123', user.password_hash);
        
        if (!isValid) {
            return res.json({
                success: false,
                error: 'Senha incorreta',
                step: 'password_check',
                user_found: true,
                password_valid: false
            });
        }
        
        console.log('✅ Senha válida!');
        
        // Gerar token
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';
        
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            message: 'Login funcionando perfeitamente!',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                plan_type: user.plan_type
            },
            token_generated: true,
            steps_completed: [
                'mongodb_connection',
                'user_search',
                'password_validation',
                'token_generation'
            ]
        });
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}