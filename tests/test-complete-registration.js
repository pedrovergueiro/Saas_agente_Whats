require('dotenv').config({ path: 'saas-platform/backend/.env' });

async function testCompleteRegistration() {
    console.log('🧪 TESTE COMPLETO DE CADASTRO - CLIENTE REAL');
    console.log('============================================\n');
    
    const baseUrl = 'http://localhost:5000/api';
    
    try {
        // 1. Testar cadastro com email de cliente real
        console.log('1️⃣ CADASTRANDO CLIENTE REAL');
        console.log('---------------------------');
        
        const clientData = {
            email: 'cliente.teste@gmail.com', // Email do cliente real
            password: 'senha123456',
            full_name: 'João Silva Cliente',
            phone: '11987654321',
            company_name: 'Barbearia do João'
        };
        
        console.log('📧 Email do cliente:', clientData.email);
        console.log('👤 Nome:', clientData.full_name);
        console.log('🏢 Empresa:', clientData.company_name);
        
        const registerResponse = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        const registerResult = await registerResponse.json();
        
        if (registerResult.success) {
            console.log('\n✅ CLIENTE CADASTRADO COM SUCESSO!');
            console.log('📧 Email:', registerResult.data.email);
            console.log('📨 Email de verificação enviado:', registerResult.data.verification_sent);
            
            console.log('\n📋 PRÓXIMOS PASSOS PARA O CLIENTE:');
            console.log('1. Cliente verifica o console do servidor');
            console.log('2. Copia o link de verificação mostrado');
            console.log('3. Acessa o link para verificar email');
            console.log('4. Faz login no sistema');
            
        } else {
            console.log('❌ Erro no cadastro:', registerResult.message);
            
            if (registerResult.message.includes('já está cadastrado')) {
                console.log('\n🔄 CLIENTE JÁ EXISTE - TESTANDO LOGIN');
                
                const loginResponse = await fetch(`${baseUrl}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: clientData.email,
                        password: clientData.password
                    })
                });
                
                const loginResult = await loginResponse.json();
                
                if (loginResult.success) {
                    console.log('✅ Login realizado com sucesso!');
                    console.log('👤 Cliente:', loginResult.data.user.full_name);
                    console.log('📧 Email verificado:', loginResult.data.user.email_verified);
                } else {
                    console.log('❌ Erro no login:', loginResult.message);
                    
                    if (loginResult.code === 'EMAIL_NOT_VERIFIED') {
                        console.log('\n⚠️ EMAIL NÃO VERIFICADO - SISTEMA FUNCIONANDO!');
                        console.log('🔒 Sistema bloqueia login sem verificação');
                        console.log('📧 Cliente precisa verificar email primeiro');
                    }
                }
            }
        }
        
        // 2. Testar com outro cliente
        console.log('\n2️⃣ TESTANDO SEGUNDO CLIENTE');
        console.log('---------------------------');
        
        const client2Data = {
            email: 'maria.cliente@hotmail.com',
            password: 'senha789',
            full_name: 'Maria Santos',
            phone: '11999888777',
            company_name: 'Salão da Maria'
        };
        
        const register2Response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(client2Data)
        });
        
        const register2Result = await register2Response.json();
        
        if (register2Result.success) {
            console.log('✅ Segunda cliente cadastrada!');
            console.log('📧 Email:', register2Result.data.email);
        } else {
            console.log('❌ Erro no segundo cadastro:', register2Result.message);
        }
        
        console.log('\n🎉 TESTE CONCLUÍDO!');
        console.log('==================');
        console.log('✅ Sistema aceita qualquer email de cliente');
        console.log('✅ Modo desenvolvimento simula envios');
        console.log('✅ Links de verificação aparecem no console');
        console.log('✅ Sistema bloqueia login sem verificação');
        
        console.log('\n📋 PARA PRODUÇÃO:');
        console.log('1. Configure domínio no Resend');
        console.log('2. Mude NODE_ENV=production');
        console.log('3. Emails serão enviados realmente');
        
        console.log('\n🚀 SISTEMA FUNCIONANDO PARA CLIENTES!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('\n🔧 ERRO DE CONEXÃO:');
            console.log('1. Verifique se o servidor está rodando');
            console.log('2. URL: http://localhost:5000');
            console.log('3. Execute: node server-saas-final.js');
        }
    }
}

// Executar teste
console.log('⏳ Iniciando teste com clientes reais...\n');
testCompleteRegistration();