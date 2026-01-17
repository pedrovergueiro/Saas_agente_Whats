export default async function handler(req, res) {
    try {
        // Verificar variáveis de ambiente
        const envCheck = {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
            MONGODB_URI: process.env.MONGODB_URI ? 'DEFINIDO' : 'NÃO DEFINIDO',
            MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
        };

        // Testar conexão MongoDB
        let mongoStatus = 'NÃO TESTADO';
        let mongoError = null;
        
        try {
            const { connectDB } = require('../../lib/database-mongodb');
            const db = await connectDB();
            mongoStatus = 'CONECTADO';
            
            // Testar query simples
            const userCount = await db.collection('users').countDocuments();
            mongoStatus = `CONECTADO - ${userCount} usuários`;
        } catch (error) {
            mongoStatus = 'ERRO';
            mongoError = error.message;
        }

        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            environment: envCheck,
            mongodb: {
                status: mongoStatus,
                error: mongoError
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}