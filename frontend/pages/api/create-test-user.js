const bcrypt = require('bcryptjs');
const { connectDB } = require('../../lib/database-mongodb');

export default async function handler(req, res) {
    try {
        console.log('🔧 Criando/verificando usuário de teste...');
        
        const database = await connectDB();
        
        // Verificar se usuário já existe
        const existingUser = await database.collection('users').findOne({ email: 'pedro@teste.com' });
        
        if (existingUser) {
            return res.json({
                success: true,
                message: 'Usuário de teste já existe',
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    full_name: existingUser.full_name,
                    created_at: existingUser.created_at
                }
            });
        }
        
        // Criar usuário de teste
        console.log('➕ Criando usuário de teste...');
        const testPassword = await bcrypt.hash('teste123', 10);
        
        const testUser = {
            id: 'test-user-123',
            email: 'pedro@teste.com',
            password_hash: testPassword,
            full_name: 'Pedro Teste',
            phone: null,
            company_name: null,
            plan_type: 'premium',
            status: 'active',
            email_verified: true,
            trial_ends_at: null,
            subscription_ends_at: null,
            max_bots: 999,
            max_messages_month: 999999,
            messages_used_month: 0,
            created_at: new Date(),
            updated_at: new Date(),
            last_login_at: null
        };
        
        const result = await database.collection('users').insertOne(testUser);
        console.log('✅ Usuário de teste criado:', result.insertedId);
        
        res.json({
            success: true,
            message: 'Usuário de teste criado com sucesso!',
            user: {
                id: testUser.id,
                email: testUser.email,
                full_name: testUser.full_name,
                created_at: testUser.created_at
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário de teste:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário de teste',
            error: error.message
        });
    }
}