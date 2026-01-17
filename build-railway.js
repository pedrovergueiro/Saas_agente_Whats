#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Railway...');

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
    console.log(`📦 Executando: ${command}`);
    try {
        execSync(command, { 
            stdio: 'inherit', 
            cwd: cwd,
            env: { ...process.env, NODE_ENV: 'production' }
        });
    } catch (error) {
        console.error(`❌ Erro ao executar: ${command}`);
        throw error;
    }
}

try {
    // 1. Verificar e instalar dependências do backend
    console.log('📦 Verificando dependências do backend...');
    if (!fs.existsSync('./backend/node_modules')) {
        console.log('📦 Instalando dependências do backend...');
        runCommand('npm install', './backend');
    } else {
        console.log('✅ Dependências do backend já instaladas');
    }
    
    // 2. Verificar e instalar dependências do frontend
    console.log('📦 Verificando dependências do frontend...');
    if (!fs.existsSync('./frontend/node_modules')) {
        console.log('📦 Instalando dependências do frontend...');
        runCommand('npm install --include=dev', './frontend');
    } else {
        console.log('✅ Dependências do frontend já instaladas');
    }
    
    // 3. Build do frontend
    console.log('🏗️ Fazendo build do frontend...');
    runCommand('npm run build', './frontend');
    
    // 4. Copiar arquivos necessários para a raiz
    console.log('📁 Organizando arquivos...');
    
    // Criar package.json na raiz para Railway
    const rootPackage = {
        "name": "barberbot-ai-saas-railway",
        "version": "1.0.0",
        "description": "BarberBot AI SaaS - Railway Deployment",
        "main": "start-railway.js",
        "scripts": {
            "start": "node start-railway.js",
            "build": "node build-railway.js"
        },
        "dependencies": {
            "concurrently": "^8.2.2"
        }
    };
    
    fs.writeFileSync('./package.json', JSON.stringify(rootPackage, null, 2));
    console.log('✅ package.json criado na raiz');
    
    // Criar script de inicialização
    const startScript = `
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
            NEXT_PUBLIC_API_URL: \`http://localhost:\${BACKEND_PORT}/api\`
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
`;
    
    fs.writeFileSync('./start-railway.js', startScript);
    console.log('✅ start-railway.js criado');
    
    console.log('✅ Build concluído com sucesso!');
    console.log('🚀 Pronto para deploy no Railway!');
    
} catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
}