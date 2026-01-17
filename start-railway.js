
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando BarberBot AI SaaS no Railway...');

// Definir portas
const BACKEND_PORT = process.env.PORT || 5000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Iniciar backend
console.log('🔧 Iniciando backend na porta', BACKEND_PORT);
const backend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: {
        ...process.env,
        PORT: BACKEND_PORT,
        NODE_ENV: 'production'
    }
});

// Aguardar um pouco antes de iniciar o frontend
setTimeout(() => {
    console.log('🎨 Iniciando frontend na porta', FRONTEND_PORT);
    const frontend = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: FRONTEND_PORT,
            NODE_ENV: 'production',
            NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}/api`
        }
    });
    
    frontend.on('error', (err) => {
        console.error('❌ Erro no frontend:', err);
    });
    
    frontend.on('exit', (code) => {
        console.log('🎨 Frontend encerrado com código:', code);
        process.exit(code);
    });
}, 3000);

backend.on('error', (err) => {
    console.error('❌ Erro no backend:', err);
});

backend.on('exit', (code) => {
    console.log('🔧 Backend encerrado com código:', code);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Encerrando aplicação...');
    backend.kill();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Encerrando aplicação...');
    backend.kill();
    process.exit(0);
});
