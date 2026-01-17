// Banco de dados em memória para Vercel (temporário)
let users = [];
let bots = [];

// Simular SQLite com arrays em memória
const query = async (sql, params = []) => {
    console.log('Query:', sql, params);
    
    if (sql.includes('SELECT * FROM users WHERE email = ?')) {
        const email = params[0];
        const user = users.find(u => u.email === email);
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
        const id = params[0];
        const user = users.find(u => u.id === id);
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    
    if (sql.includes('SELECT * FROM bots WHERE user_id = ?')) {
        const userId = params[0];
        const userBots = bots.filter(b => b.user_id === userId);
        return { rows: userBots, rowCount: userBots.length };
    }
    
    return { rows: [], rowCount: 0 };
};

const run = async (sql, params = []) => {
    console.log('Run:', sql, params);
    
    if (sql.includes('INSERT INTO users')) {
        const [id, email, password_hash, full_name, phone, company_name] = params;
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
            created_at: new Date().toISOString()
        };
        users.push(user);
        return { lastID: id, changes: 1 };
    }
    
    if (sql.includes('INSERT INTO bots')) {
        const [id, user_id, name, business_name, business_type] = params;
        const bot = {
            id,
            user_id,
            name,
            business_name,
            business_type: business_type || 'barber',
            status: 'disconnected',
            total_messages: 0,
            total_appointments: 0,
            total_revenue: 0,
            created_at: new Date().toISOString()
        };
        bots.push(bot);
        return { lastID: id, changes: 1 };
    }
    
    if (sql.includes('UPDATE users SET last_login_at')) {
        const userId = params[0];
        const user = users.find(u => u.id === userId);
        if (user) {
            user.last_login_at = new Date().toISOString();
        }
        return { changes: 1 };
    }
    
    return { changes: 0 };
};

const initDatabase = async () => {
    console.log('📦 Inicializando banco em memória...');
    
    // Criar usuário de teste se não existir
    if (users.length === 0) {
        const bcrypt = require('bcryptjs');
        const testPassword = await bcrypt.hash('teste123', 10);
        
        users.push({
            id: 'test-user-123',
            email: 'pedro@teste.com',
            password_hash: testPassword,
            full_name: 'Pedro Teste',
            phone: null,
            company_name: null,
            plan_type: 'premium',
            status: 'active',
            email_verified: true,
            max_bots: 999,
            max_messages_month: 999999,
            created_at: new Date().toISOString()
        });
        
        console.log('✅ Usuário de teste criado: pedro@teste.com / teste123');
    }
    
    console.log('✅ Banco em memória inicializado!');
    console.log('👥 Usuários:', users.length);
    console.log('🤖 Bots:', bots.length);
};

module.exports = {
    query,
    run,
    initDatabase
};