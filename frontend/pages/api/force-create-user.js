const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    let client;
    
    try {
        console.log('🔧 FORÇANDO criação do usuário de teste...');
        
        // Conectar diretamente ao MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            return res.status(500).json({
                success: false,
                error: 'MONGODB_URI não definida',
                env_check: {
                    NODE_ENV: process.env.NODE_ENV,
                    VERCEL: process.env.VERCEL,
                    MONGODB_URI: 'NÃO DEFINIDA'
                }
            });
        }
        
        console.log('🔌 Conectando ao MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db('barberbot');
        console.log('✅ Conectado ao banco barberbot');
        
        // Verificar se usuário já existe
        const existingUser = await db.collection('users').findOne({ email: 'pedro@teste.com' });
        
        if (existingUser) {
            console.log('👤 Usuário já existe');
            return res.json({
                success: true,
                message: 'Usuário já existe',
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    full_name: existingUser.full_name
                },
                action: 'found_existing'
            });
        }
        
        // Criar usuário
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
        
        const result = await db.collection('users').insertOne(testUser);
        console.log('✅ Usuário criado:', result.insertedId);
        
        // Verificar se foi criado
        const createdUser = await db.collection('users').findOne({ email: 'pedro@teste.com' });
        
        res.json({
            success: true,
            message: 'Usuário de teste criado com sucesso!',
            user: {
                id: createdUser.id,
                email: createdUser.email,
                full_name: createdUser.full_name
            },
            action: 'created_new',
            mongodb_id: result.insertedId
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            env_check: {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                MONGODB_URI: process.env.MONGODB_URI ? 'DEFINIDA' : 'NÃO DEFINIDA'
            }
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}