const mysql = require('mysql2/promise');

// Configuração do MySQL
const MYSQL_CONFIG = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '010524Np@',
    database: process.env.MYSQL_DATABASE || 'barberbot_saas',
    charset: 'utf8mb4',
    timezone: '+00:00'
};

let pool;
let isConnecting = false;

// Criar pool de conexões MySQL
const connectDB = async () => {
    if (pool) {
        return pool;
    }
    
    if (isConnecting) {
        // Aguardar conexão em andamento
        while (isConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pool;
    }
    
    isConnecting = true;
    
    try {
        console.log('🔌 Conectando ao MySQL...');
        console.log('📍 Host:', MYSQL_CONFIG.host + ':' + MYSQL_CONFIG.port);
        console.log('📍 User:', MYSQL_CONFIG.user);
        
        // Primeiro conectar sem database para criar se necessário
        const tempConfig = { ...MYSQL_CONFIG };
        delete tempConfig.database;
        
        // Criar pool temporário para criar database
        const tempPool = mysql.createPool({
            ...tempConfig,
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0
        });
        
        // Criar database se não existir
        console.log('📦 Criando database:', MYSQL_CONFIG.database);
        await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${MYSQL_CONFIG.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await tempPool.end();
        
        // Agora criar pool com database
        pool = mysql.createPool({
            ...MYSQL_CONFIG,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        // Testar conexão
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        
        console.log('✅ Conectado ao MySQL');
        console.log('📍 Database:', MYSQL_CONFIG.database);
        isConnecting = false;
        return pool;
    } catch (error) {
        isConnecting = false;
        console.error('❌ Erro ao conectar MySQL:', error.message);
        throw error;
    }
};

// Helper para queries SELECT
const query = async (sql, params = []) => {
    try {
        const connection = await connectDB();
        const [rows] = await connection.execute(sql, params);
        return { rows, rowCount: rows.length };
    } catch (error) {
        console.error('❌ Erro na query:', error);
        throw error;
    }
};

// Helper para INSERT, UPDATE, DELETE
const run = async (sql, params = []) => {
    try {
        const connection = await connectDB();
        const [result] = await connection.execute(sql, params);
        return { 
            lastID: result.insertId || null, 
            changes: result.affectedRows || 0 
        };
    } catch (error) {
        console.error('❌ Erro no run:', error);
        throw error;
    }
};

// Inicializar banco de dados e tabelas
const initDatabase = async () => {
    console.log('📦 Inicializando MySQL...');
    
    try {
        const connection = await connectDB();
        
        // Tabela de usuários
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                company_name VARCHAR(255),
                plan_type ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                email_verified BOOLEAN DEFAULT TRUE,
                trial_ends_at DATETIME NULL,
                subscription_ends_at DATETIME NULL,
                max_bots INT DEFAULT 1,
                max_messages_month INT DEFAULT 500,
                messages_used_month INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login_at DATETIME NULL,
                INDEX idx_email (email),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Tabela de bots
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bots (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                whatsapp_number VARCHAR(20),
                status ENUM('connected', 'disconnected', 'connecting') DEFAULT 'disconnected',
                qr_code TEXT,
                qr_generated_at DATETIME NULL,
                connected_at DATETIME NULL,
                last_activity_at DATETIME NULL,
                business_name VARCHAR(255),
                business_address TEXT,
                business_phone VARCHAR(20),
                business_type VARCHAR(50) DEFAULT 'barber',
                open_time TIME DEFAULT '08:00:00',
                close_time TIME DEFAULT '18:00:00',
                work_days VARCHAR(20) DEFAULT '1,2,3,4,5,6',
                ai_enabled BOOLEAN DEFAULT TRUE,
                ai_personality VARCHAR(50) DEFAULT 'friendly',
                auto_responses BOOLEAN DEFAULT TRUE,
                total_messages INT DEFAULT 0,
                total_appointments INT DEFAULT 0,
                total_revenue DECIMAL(10,2) DEFAULT 0.00,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Tabela de mensagens personalizadas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bot_messages (
                id VARCHAR(36) PRIMARY KEY,
                bot_id VARCHAR(36) NOT NULL,
                trigger_text VARCHAR(255) NOT NULL,
                message_text TEXT NOT NULL,
                options JSON,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
                INDEX idx_bot_id (bot_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Tabela de categorias do cardápio
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS menu_categories (
                id VARCHAR(36) PRIMARY KEY,
                bot_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                display_order INT DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
                INDEX idx_bot_id (bot_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Tabela de itens do cardápio
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id VARCHAR(36) PRIMARY KEY,
                bot_id VARCHAR(36) NOT NULL,
                category_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_url VARCHAR(500),
                available BOOLEAN DEFAULT TRUE,
                display_order INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
                INDEX idx_bot_id (bot_id),
                INDEX idx_category_id (category_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        // Tabela de pedidos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(36) PRIMARY KEY,
                bot_id VARCHAR(36) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_address TEXT,
                items JSON NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_fee DECIMAL(10,2) DEFAULT 0.00,
                payment_method VARCHAR(50),
                status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
                INDEX idx_bot_id (bot_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Tabelas MySQL criadas/verificadas');
        
        // Criar usuário de teste
        const bcrypt = require('bcryptjs');
        const testPassword = await bcrypt.hash('teste123', 10);
        
        try {
            await connection.execute(`
                INSERT IGNORE INTO users (
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
            console.log('✅ Usuário de teste criado: pedro@teste.com / teste123');
        } catch (err) {
            // Usuário já existe
            console.log('ℹ️ Usuário de teste já existe');
        }
        
        console.log('✅ MySQL inicializado com sucesso!');
        
        // Estatísticas
        const [userResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [botResult] = await connection.execute('SELECT COUNT(*) as count FROM bots');
        console.log(`👥 Usuários: ${userResult[0].count}`);
        console.log(`🤖 Bots: ${botResult[0].count}`);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar MySQL:', error);
        throw error;
    }
};

module.exports = {
    query,
    run,
    initDatabase,
    connectDB
};