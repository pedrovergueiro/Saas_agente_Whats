require('dotenv').config();
const { initDatabase, run, query } = require('./config/database-sqlite');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initializeDatabase() {
    console.log('🗄️ Inicializando banco de dados...');
    
    try {
        // Inicializar tabelas
        await initDatabase();
        console.log('✅ Tabelas criadas/verificadas');
        
        // Verificar se usuário de teste existe
        const existingUser = await query('SELECT * FROM users WHERE email = ?', ['pedro@teste.com']);
        
        if (existingUser.rows.length === 0) {
            console.log('👤 Criando usuário de teste...');
            
            const userId = uuidv4();
            const passwordHash = await bcrypt.hash('teste123', 12);
            
            await run(`
                INSERT INTO users (
                    id, email, password_hash, full_name, phone, company_name,
                    status, email_verified, plan_type
                ) VALUES (?, ?, ?, ?, ?, ?, 'active', TRUE, 'premium')
            `, [
                userId,
                'pedro@teste.com',
                passwordHash,
                'Pedro Teste',
                '(11) 99999-9999',
                'Empresa Teste'
            ]);
            
            console.log('✅ Usuário de teste criado:');
            console.log('   Email: pedro@teste.com');
            console.log('   Senha: teste123');
        } else {
            console.log('👤 Usuário de teste já existe');
            
            // Atualizar para garantir que está verificado
            await run(`
                UPDATE users 
                SET email_verified = TRUE, status = 'active'
                WHERE email = ?
            `, ['pedro@teste.com']);
            
            console.log('✅ Usuário de teste atualizado');
        }
        
        // Verificar estrutura da tabela
        const tableInfo = await query("PRAGMA table_info(users)");
        console.log('\n📋 Estrutura da tabela users:');
        tableInfo.rows.forEach(column => {
            console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
        });
        
        console.log('\n🎉 Banco de dados inicializado com sucesso!');
        console.log('\n🚀 Para testar:');
        console.log('1. Inicie o backend: cd saas-platform/backend && npm start');
        console.log('2. Inicie o frontend: cd saas-platform/frontend && npm run dev');
        console.log('3. Acesse: http://localhost:3000');
        console.log('4. Faça login com: pedro@teste.com / teste123');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        process.exit(1);
    }
}

// Executar inicialização
initializeDatabase();