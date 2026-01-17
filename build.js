#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Vercel...');

// 1. Verificar se estamos no ambiente correto
if (!fs.existsSync('frontend/package.json')) {
    console.error('❌ Diretório frontend não encontrado!');
    process.exit(1);
}

if (!fs.existsSync('backend/server.js')) {
    console.error('❌ Arquivo backend/server.js não encontrado!');
    process.exit(1);
}

// 2. Instalar dependências do backend
console.log('📦 Instalando dependências do backend...');
try {
    execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
} catch (error) {
    console.error('❌ Erro ao instalar dependências do backend');
    process.exit(1);
}

// 3. Instalar dependências do frontend
console.log('📦 Instalando dependências do frontend...');
try {
    execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
} catch (error) {
    console.error('❌ Erro ao instalar dependências do frontend');
    process.exit(1);
}

// 4. Build do frontend
console.log('🏗️ Fazendo build do frontend...');
try {
    execSync('npm run build', { cwd: 'frontend', stdio: 'inherit' });
} catch (error) {
    console.error('❌ Erro no build do frontend');
    process.exit(1);
}

console.log('✅ Build concluído com sucesso!');
console.log('🚀 Pronto para deploy no Vercel!');
console.log('');
console.log('Próximos passos:');
console.log('1. git add .');
console.log('2. git commit -m "Preparado para Vercel"');
console.log('3. git push origin main');
console.log('4. Deploy no Vercel Dashboard');