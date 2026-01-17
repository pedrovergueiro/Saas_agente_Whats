const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    let client;
    const results = {
        step1_env_check: null,
        step2_mongodb_connection: null,
        step3_user_creation: null,
        step4_login_test: null,
        final_result: null
    };
    
    try {
        // STEP 1: Verificar variáveis de ambiente
        console.log('🔍 STEP 1: Verificando variáveis...');
        const envCheck = {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
            MONGODB_URI: process.env.MONGODB_URI ? 'DEFINIDO' : 'NÃO DEFINIDO'
        };
        results.step1_env_check = { success: true, data: envCheck };
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI não definida');
        }
        
        // STEP 2: Conectar ao MongoDB
        console.log('🔌 STEP 2: Conectando ao MongoDB...');
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('barberbot');
        
        // Testar conexão
        await db.admin().ping();
        const userCount = await db.collection('users').countDocuments();
        results.step2_mongodb_connection = { 
            success: true, 
            data: { connected: true, userCount } 
        };
        
        // STEP 3: Criar/verificar usuário de teste
        console.log('👤 STEP 3: Criando/verificando usuário...');
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
            results.step3_user_creation = { success: true, data: { action: 'created' } };
        } else {
            results.step3_user_creation = { success: true, data: { action: 'found_existing' } };
        }
        
        // STEP 4: Testar login
        console.log('🔐 STEP 4: Testando login...');
        const isValidPassword = await bcrypt.compare('teste123', user.password_hash);
        
        if (!isValidPassword) {
            throw new Error('Senha inválida');
        }
        
        const JWT_SECRET = process.env.JWT_SECRET || '4d710d2f8de3134bc8517f7f2f54012dec9e9c41c7c23b27edd95b17c17b7af25ecd1b681e878207294d575e5785c8a6f6f5f64aaca4fbf8c983c7810db5ba28';
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        results.step4_login_test = { 
            success: true, 
            data: { 
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name
                },
                token_generated: true
            } 
        };
        
        // RESULTADO FINAL
        results.final_result = {
            success: true,
            message: '🎉 TUDO FUNCIONANDO! Login deve funcionar agora.',
            login_credentials: {
                email: 'pedro@teste.com',
                password: 'teste123'
            }
        };
        
        res.json({
            success: true,
            message: 'Teste completo realizado com sucesso!',
            results: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        
        results.final_result = {
            success: false,
            error: error.message,
            failed_at: Object.keys(results).find(key => results[key] === null) || 'unknown'
        };
        
        res.status(500).json({
            success: false,
            error: error.message,
            results: results,
            timestamp: new Date().toISOString()
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}