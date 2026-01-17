export default async function handler(req, res) {
    try {
        console.log('🧪 Teste simples - sem MongoDB');
        
        // Testar apenas variáveis de ambiente
        const envCheck = {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDO' : 'NÃO DEFINIDO',
            MONGODB_URI: process.env.MONGODB_URI ? 'DEFINIDO' : 'NÃO DEFINIDO',
            MONGODB_URI_START: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'N/A'
        };
        
        // Testar JWT
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
        
        const testToken = jwt.sign({ test: 'data' }, JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(testToken, JWT_SECRET);
        
        res.json({
            success: true,
            message: 'Teste simples funcionando!',
            environment: envCheck,
            jwt_test: {
                token_generated: !!testToken,
                token_verified: !!decoded,
                payload: decoded
            },
            next_step: 'Testar MongoDB separadamente',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro no teste simples:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
}