const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    let client;
    
    try {
        console.log('🔧 TESTE FINAL - Configuração SSL limpa...');
        
        const MONGODB_URI = process.env.MONGODB_URI;
        const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';
        
        // Configuração SSL limpa - sem conflitos
        client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000
        });
        
        console.log('🔌 Conectando ao MongoDB...');
        await client.connect();
        
        const db = client.db('barberbot');
        
        // Testar ping
        await db.admin().ping();
        console.log('✅ MongoDB conectado!');
        
        // Verificar/criar usuário de teste
        let user = await db.collection('users').findOne({ email: 'pedro@teste.com' });
        
        if (!user) {
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
            
            await db.collection('users').insertOne(testUser);
            user = testUser;
            console.log('✅ Usuário criado!');
        } else {
            console.log('👤 Usuário já existe!');
        }
        
        // Testar login
        const isValidPassword = await bcrypt.compare('teste123', user.password_hash);
        if (!isValidPassword) {
            throw new Error('Senha inválida');
        }
        
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        console.log('🎫 Token gerado!');
        
        res.json({
            success: true,
            message: '🎉 TUDO FUNCIONANDO! Login deve funcionar agora!',
            data: {
                mongodb_connected: true,
                user_exists: true,
                password_valid: true,
                token_generated: true,
                login_credentials: {
                    email: 'pedro@teste.com',
                    password: 'teste123'
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}