const { MongoClient } = require('mongodb');

// Configuração do MongoDB - URI otimizada para Render
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority';
const DB_NAME = 'barberbot';

let client;
let db;
let isConnecting = false;
let usingSQLite = false;
let sqliteDb = null;

// Fallback para SQLite se MongoDB falhar
const initSQLiteFallback = async () => {
    console.log('🔄 Iniciando fallback para SQLite...');
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const fs = require('fs');
    
    // Criar diretório de dados
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'saas.db');
    console.log('📦 Banco SQLite em:', dbPath);
    
    sqliteDb = new sqlite3.Database(dbPath);
    usingSQLite = true;
    
    // Inicializar tabelas SQLite
    await initSQLiteTables();
    
    console.log('✅ SQLite inicializado como fallback');
    return true;
};

const initSQLiteTables = async () => {
    const runSQLite = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqliteDb.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    };
    
    // Tabela de usuários
    await runSQLite(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            company_name TEXT,
            plan_type TEXT DEFAULT 'basic',
            status TEXT DEFAULT 'active',
            email_verified BOOLEAN DEFAULT TRUE,
            trial_ends_at TEXT,
            subscription_ends_at TEXT,
            max_bots INTEGER DEFAULT 1,
            max_messages_month INTEGER DEFAULT 500,
            messages_used_month INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login_at TEXT
        )
    `);
    
    // Tabela de bots
    await runSQLite(`
        CREATE TABLE IF NOT EXISTS bots (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            whatsapp_number TEXT,
            status TEXT DEFAULT 'disconnected',
            qr_code TEXT,
            qr_generated_at TEXT,
            connected_at TEXT,
            last_activity_at TEXT,
            business_name TEXT,
            business_address TEXT,
            business_phone TEXT,
            business_type TEXT DEFAULT 'barber',
            open_time TEXT DEFAULT '08:00',
            close_time TEXT DEFAULT '18:00',
            work_days TEXT DEFAULT '1,2,3,4,5,6',
            ai_enabled INTEGER DEFAULT 1,
            ai_personality TEXT DEFAULT 'friendly',
            auto_responses INTEGER DEFAULT 1,
            total_messages INTEGER DEFAULT 0,
            total_appointments INTEGER DEFAULT 0,
            total_revenue REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    
    // Criar usuário de teste
    const bcrypt = require('bcryptjs');
    const testPassword = await bcrypt.hash('teste123', 10);
    
    try {
        await runSQLite(`
            INSERT OR IGNORE INTO users (
                id, email, password_hash, full_name, 
                plan_type, status, email_verified, max_bots, max_messages_month
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'test-user-123',
            'pedro@teste.com',
            testPassword,
            'Pedro Teste',
            'premium',
            'active',
            true,
            999,
            999999
        ]);
        console.log('✅ Usuário de teste SQLite criado: pedro@teste.com / teste123');
    } catch (err) {
        // Usuário já existe
    }
};

// Conectar ao MongoDB com fallback para SQLite
const connectDB = async () => {
    if (db || usingSQLite) {
        return db || sqliteDb;
    }
    
    if (isConnecting) {
        // Aguardar conexão em andamento
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return db || sqliteDb;
    }
    
    isConnecting = true;
    
    try {
        console.log('🔌 Tentando conectar ao MongoDB...');
        console.log('📍 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
        
        // Configuração otimizada para Render - timeout muito menor para fallback rápido
        const clientOptions = {
            maxPoolSize: 3,
            serverSelectionTimeoutMS: 3000, // 3 segundos apenas
            socketTimeoutMS: 5000,
            connectTimeoutMS: 3000,
            retryWrites: true,
            w: 'majority',
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
        console.log('❌ MongoDB falhou:', error.message);
        console.log('🔄 Usando SQLite como fallback...');
        
        // Limpar cliente MongoDB
        if (client) {
            try {
                await client.close();
            } catch (closeError) {
                // Ignorar erro de fechamento
            }
            client = null;
        }
        
        // Inicializar SQLite
        await initSQLiteFallback();
        isConnecting = false;
        return sqliteDb;
    }
};

// Simular interface SQLite para compatibilidade
const query = async (sql, params = []) => {
    try {
        const database = await connectDB();
        
        // Se estiver usando SQLite
        if (usingSQLite) {
            return new Promise((resolve, reject) => {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ rows, rowCount: rows.length });
                    }
                });
            });
        }
        
        // Código MongoDB existente
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
        
        // Se estiver usando SQLite
        if (usingSQLite) {
            return new Promise((resolve, reject) => {
                sqliteDb.run(sql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ lastID: this.lastID, changes: this.changes });
                    }
                });
            });
        }
        
        // Código MongoDB existente
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
    console.log('📦 Inicializando banco de dados...');
    
    try {
        const database = await connectDB();
        
        if (usingSQLite) {
            console.log('✅ SQLite inicializado com fallback!');
            
            // Estatísticas SQLite
            const userResult = await query('SELECT COUNT(*) as count FROM users');
            const botResult = await query('SELECT COUNT(*) as count FROM bots');
            console.log(`👥 Usuários: ${userResult.rows[0].count}`);
            console.log(`🤖 Bots: ${botResult.rows[0].count}`);
            return;
        }
        
        // Código MongoDB existente
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
        console.error('❌ Erro ao inicializar banco:', error);
        throw error;
    }
};

module.exports = {
    query,
    run,
    initDatabase,
    connectDB
};