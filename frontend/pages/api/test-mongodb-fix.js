const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    let client;
    
    try {
        console.log('🔧 Testando conexão MongoDB com SSL corrigido...');
        
        // String de conexão alternativa
        const MONGODB_URI_ALT = 'mongodb+srv://pedrolvergueiro_db_user:5yoTGgxNSlf1C0us@cluster0.1u7u6q2.mongodb.net/barberbot?retryWrites=true&w=majority&ssl=true&authSource=admin&tlsInsecure=true';
        
        console.log('🔌 Conectando com configurações SSL específicas...');
        
        client = new MongoClient(MONGODB_URI_ALT, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            ssl: true,
            sslValidate: false,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        await client.connect();
        console.log('✅ Conectado!');
        
        const db = client.db('barberbot');
        
        // Testar ping
        await db.admin().ping();
        console.log('✅ Ping OK!');
        
        // Contar usuários
        const userCount = await db.collection('users').countDocuments();
        console.log(`👥 Usuários encontrados: ${userCount}`);
        
        res.json({
            success: true,
            message: 'MongoDB conectado com sucesso!',
            data: {
                connected: true,
                userCount: userCount,
                ssl_fix: 'applied'
            }
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            error_type: error.constructor.name,
            ssl_attempted: true
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}