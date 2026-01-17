const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Para Vercel, usar banco em memória ou /tmp
let dbPath;
if (process.env.VERCEL) {
    // No Vercel, usar diretório temporário
    dbPath = '/tmp/saas.db';
} else {
    // Local, usar data directory
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'saas.db');
}

console.log('📦 Banco de dados em:', dbPath);
const db = new sqlite3.Database(dbPath);

// Helper para queries com Promises
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve({ rows, rowCount: rows.length });
            }
        });
    });
};

// Helper para run (INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Inicializar tabelas
const initDatabase = async () => {
    console.log('📦 Inicializando banco de dados SQLite...');
    
    // Tabela de usuários
    await run(`
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
    await run(`
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
    
    // Criar usuário de teste apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
        const bcrypt = require('bcryptjs');
        const testPassword = await bcrypt.hash('teste123', 10);
        
        try {
            await run(`
                INSERT OR IGNORE INTO users (
                    id, email, password_hash, full_name, 
                    plan_type, status, max_bots, max_messages_month, email_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'test-user-123',
                'pedro@teste.com',
                testPassword,
                'Pedro Teste',
                'premium',
                'active',
                999,
                999999,
                true
            ]);
            console.log('✅ Usuário de teste criado: pedro@teste.com / teste123');
        } catch (err) {
            // Usuário já existe
        }
    }
    
    console.log('✅ Banco de dados inicializado!');
};

module.exports = {
    query,
    run,
    initDatabase
};