const { MongoClient } = require('mongodb');

// Configuração do MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true';
const DB_NAME = 'barberbot';

let client;
let db;
let isConnecting = false;

// Conectar ao MongoDB com retry
const connectDB = async () => {
    if (db) {
        return db;
    }
    
    if (isConnecting) {
        // Aguardar conexão em andamento
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return db;
    }
    
    isConnecting = true;
    
    try {
        console.log('🔌 Conectando ao MongoDB...');
        console.log('📍 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
        
        // Configuração SSL mais permissiva para Render
        const clientOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 15000,
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsInsecure: false,
            retryWrites: true,
            w: 'majority'
        };
        
        client = new MongoClient(MONGODB_URI, clientOptions);
        
        await client.connect();
        db = client.db(DB_NAME);
        
        // Testar conexão
        await db.admin().ping();
        
        console.log('✅ Conectado ao MongoDB');
        isConnecting = false;
        return db;
    } catch (error) {
        isConnecting = false;
        console.error('❌ Erro ao conectar MongoDB:', error);
        throw error;
    }
};

// Simular interface SQLite para compatibilidade
const query = async (sql, params = []) => {
    try {
        const database = await connectDB();
        
        if (sql.includes('SELECT * FROM users WHERE email = ?')) {
            const email = params[0];
            console.log('🔍 Buscando usuário por email:', email);
            const user = await database.collection('users').findOne({ email });
            console.log('📊 Usuário encontrado:', !!user);
            return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
        }
        
        if (sql.includes('SELECT * FROM users WHERE id = ?')) {
            const id = params[0];
            console.log('🔍 Buscando usuário por ID:', id);
            const user = await database.collection('users').findOne({ id });
            return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
        }
        
        if (sql.includes('SELECT * FROM bots WHERE user_id = ?')) {
            const userId = params[0];
            const bots = await database.collection('bots').find({ user_id: userId }).sort({ created_at: -1 }).toArray();
            return { rows: bots, rowCount: bots.length };
        }
        
        if (sql.includes('SELECT * FROM bots WHERE id = ? AND user_id = ?')) {
            const [id, userId] = params;
            const bot = await database.collection('bots').findOne({ id, user_id: userId });
            return { rows: bot ? [bot] : [], rowCount: bot ? 1 : 0 };
        }
        
        if (sql.includes('SELECT * FROM bots WHERE id = ?')) {
            const id = params[0];
            const bot = await database.collection('bots').findOne({ id });
            return { rows: bot ? [bot] : [], rowCount: bot ? 1 : 0 };
        }
        
        return { rows: [], rowCount: 0 };
    } catch (error) {
        console.error('❌ Erro na query:', error);
        throw error;
    }
};

const run = async (sql, params = []) => {
    try {
        const database = await connectDB();
        
        if (sql.includes('INSERT INTO users')) {
            const [id, email, password_hash, full_name, phone, company_name] = params;
            console.log('➕ Inserindo usuário:', email);
            
            const user = {
                id,
                email,
                password_hash,
                full_name,
                phone,
                company_name,
                plan_type: 'basic',
                status: 'active',
                email_verified: true,
                trial_ends_at: null,
                subscription_ends_at: null,
                max_bots: 1,
                max_messages_month: 500,
                messages_used_month: 0,
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: null
            };
            
            const result = await database.collection('users').insertOne(user);
            console.log('✅ Usuário inserido:', result.insertedId);
            return { lastID: id, changes: 1 };
        }
        
        if (sql.includes('INSERT INTO bots')) {
            const [id, user_id, name, business_name, business_type] = params;
            console.log('➕ Inserindo bot:', name);
            
            const bot = {
                id,
                user_id,
                name,
                whatsapp_number: null,
                status: 'disconnected',
                qr_code: null,
                qr_generated_at: null,
                connected_at: null,
                last_activity_at: null,
                business_name,
                business_address: null,
                business_phone: null,
                business_type: business_type || 'barber',
                open_time: '08:00',
                close_time: '18:00',
                work_days: '1,2,3,4,5,6',
                ai_enabled: 1,
                ai_personality: 'friendly',
                auto_responses: 1,
                total_messages: 0,
                total_appointments: 0,
                total_revenue: 0,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            const result = await database.collection('bots').insertOne(bot);
            return { lastID: id, changes: 1 };
        }
        
        if (sql.includes('UPDATE users SET last_login_at')) {
            const userId = params[0];
            console.log('📝 Atualizando último login:', userId);
            const result = await database.collection('users').updateOne(
                { id: userId },
                { $set: { last_login_at: new Date(), updated_at: new Date() } }
            );
            return { changes: result.modifiedCount };
        }
        
        if (sql.includes('UPDATE bots') && sql.includes('SET status = \'connected\'')) {
            const [phoneNumber, botId] = params;
            console.log('📝 Atualizando bot conectado:', botId);
            const result = await database.collection('bots').updateOne(
                { id: botId },
                { 
                    $set: { 
                        status: 'connected', 
                        whatsapp_number: phoneNumber, 
                        connected_at: new Date(),
                        updated_at: new Date()
                    } 
                }
            );
            return { changes: result.modifiedCount };
        }
        
        if (sql.includes('UPDATE bots') && sql.includes('SET status = \'disconnected\'')) {
            const botId = params[0];
            console.log('📝 Atualizando bot desconectado:', botId);
            const result = await database.collection('bots').updateOne(
                { id: botId },
                { 
                    $set: { 
                        status: 'disconnected', 
                        whatsapp_number: null, 
                        connected_at: null,
                        updated_at: new Date()
                    } 
                }
            );
            return { changes: result.modifiedCount };
        }
        
        if (sql.includes('UPDATE bots') && sql.includes('total_messages = total_messages + 1')) {
            const botId = params[0];
            const result = await database.collection('bots').updateOne(
                { id: botId },
                { 
                    $inc: { total_messages: 1 },
                    $set: { last_activity_at: new Date(), updated_at: new Date() }
                }
            );
            return { changes: result.modifiedCount };
        }
        
        if (sql.includes('UPDATE bots') && sql.includes('SET name = ?')) {
            const [name, business_name, business_address, business_phone, open_time, close_time, work_days, botId, userId] = params;
            console.log('📝 Atualizando bot:', botId);
            const result = await database.collection('bots').updateOne(
                { id: botId, user_id: userId },
                { 
                    $set: { 
                        name, 
                        business_name, 
                        business_address, 
                        business_phone, 
                        open_time, 
                        close_time, 
                        work_days,
                        updated_at: new Date()
                    } 
                }
            );
            return { changes: result.modifiedCount };
        }
        
        return { changes: 0 };
    } catch (error) {
        console.error('❌ Erro no run:', error);
        throw error;
    }
};

const initDatabase = async () => {
    console.log('📦 Inicializando MongoDB...');
    
    try {
        const database = await connectDB();
        
        // Criar índices
        try {
            await database.collection('users').createIndex({ email: 1 }, { unique: true });
            await database.collection('users').createIndex({ id: 1 }, { unique: true });
            await database.collection('bots').createIndex({ id: 1 }, { unique: true });
            await database.collection('bots').createIndex({ user_id: 1 });
            console.log('📊 Índices criados');
        } catch (indexError) {
            console.log('⚠️ Índices já existem ou erro:', indexError.message);
        }
        
        // Criar usuário de teste SEMPRE (para facilitar testes)
        const existingUser = await database.collection('users').findOne({ email: 'pedro@teste.com' });
        
        if (!existingUser) {
            const bcrypt = require('bcryptjs');
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
            
            await database.collection('users').insertOne(testUser);
            console.log('✅ Usuário de teste criado: pedro@teste.com / teste123');
        }
        
        console.log('✅ MongoDB inicializado com sucesso!');
        
        // Estatísticas
        const userCount = await database.collection('users').countDocuments();
        const botCount = await database.collection('bots').countDocuments();
        console.log(`👥 Usuários: ${userCount}`);
        console.log(`🤖 Bots: ${botCount}`);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar MongoDB:', error);
        throw error;
    }
};

module.exports = {
    query,
    run,
    initDatabase,
    connectDB
};