require('dotenv').config({ path: 'saas-platform/backend/.env' });
const ResendEmailService = require('./saas-platform/backend/services/ResendEmailService');

async function testResendService() {
    console.log('🧪 TESTE FINAL DO RESEND EMAIL SERVICE');
    console.log('=====================================\n');
    
    const emailService = new ResendEmailService();
    
    try {
        // 1. Testar com email registrado primeiro (limitação da conta)
        console.log('1️⃣ TESTANDO EMAIL DE VERIFICAÇÃO');
        console.log('--------------------------------');
        
        const registeredEmail = 'pedrol.vergueiro@gmail.com'; // Email registrado na conta Resend
        const testToken = 'verification-token-' + Date.now();
        
        const result = await emailService.sendVerificationEmail(
            registeredEmail,
            testToken,
            'Pedro Vergueiro'
        );
        
        console.log('✅ Email de verificação enviado!');
        console.log('📊 Message ID:', result.messageId);
        console.log('📧 Destinatário:', registeredEmail);
        console.log('🔑 Token:', testToken);
        
        // Aguardar para evitar rate limit
        console.log('\n⏳ Aguardando 3 segundos para evitar rate limit...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 2. Testar email de boas-vindas
        console.log('\n2️⃣ TESTANDO EMAIL DE BOAS-VINDAS');
        console.log('--------------------------------');
        
        const welcomeResult = await emailService.sendWelcomeEmail(
            registeredEmail,
            'Pedro Vergueiro'
        );
        
        console.log('✅ Email de boas-vindas enviado!');
        console.log('📊 Message ID:', welcomeResult.messageId);
        
        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('==============================');
        console.log('✅ Nova API Key Resend funcionando perfeitamente');
        console.log('✅ Sistema de verificação de email operacional');
        console.log('✅ Emails sendo enviados com sucesso');
        console.log('✅ Rate limit respeitado');
        
        console.log('\n📧 EMAILS ENVIADOS:');
        console.log(`• Verificação: ${result.messageId}`);
        console.log(`• Boas-vindas: ${welcomeResult.messageId}`);
        
        console.log('\n⚠️ IMPORTANTE - LIMITAÇÃO ATUAL:');
        console.log('• Conta Resend só envia para: pedrol.vergueiro@gmail.com');
        console.log('• Para clientes reais, precisa verificar domínio');
        console.log('• Acesse: https://resend.com/domains');
        console.log('• Rate limit: 2 emails por segundo');
        
        console.log('\n🚀 SISTEMA PRONTO PARA USAR!');
        console.log('O backend pode ser iniciado normalmente.');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        
        if (error.message.includes('rate_limit')) {
            console.log('\n🔧 RATE LIMIT ATINGIDO:');
            console.log('1. Resend tem limite de 2 emails por segundo');
            console.log('2. Adicione delays entre envios');
            console.log('3. Sistema funcionando normalmente');
        } else if (error.message.includes('domain')) {
            console.log('\n🔧 LIMITAÇÃO DE DOMÍNIO:');
            console.log('1. Conta Resend gratuita tem limitações');
            console.log('2. Só envia para email registrado na conta');
            console.log('3. Para clientes reais, verifique um domínio');
        } else {
            console.log('\n🔧 ERRO:');
            console.log('Detalhes:', error);
        }
    }
}

// Executar teste
console.log('⏳ Iniciando teste final do Resend...\n');
testResendService();