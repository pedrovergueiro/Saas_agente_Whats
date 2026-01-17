// Health check API
export default function handler(req, res) {
    res.json({
        status: 'ok',
        platform: 'vercel-nextjs',
        timestamp: new Date().toISOString(),
        message: 'BarberBot API funcionando!'
    });
}