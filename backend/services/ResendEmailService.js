const { Resend } = require('resend');

class ResendEmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        // Verificar configuração
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ RESEND_API_KEY não configurado!');
        } else {
            console.log('✅ Resend configurado com API key:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
        }
    }

    async sendVerificationEmail(email, verificationToken, userName = 'Usuário') {
        try {
            const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
            
            console.log(`📧 Enviando email de verificação para: ${email}`);
            
            // MODO DESENVOLVIMENTO: Simular envio para emails não registrados
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isRegisteredEmail = email === 'pedrol.vergueiro@gmail.com';
            
            if (isDevelopment && !isRegisteredEmail) {
                console.log('🧪 MODO DESENVOLVIMENTO - Email simulado (Resend limitado):');
                console.log('📧 Destinatário:', email);
                console.log('👤 Nome:', userName);
                console.log('🔗 Link de verificação:', verificationUrl);
                console.log('🔑 Token:', verificationToken);
                console.log('');
                console.log('📋 INSTRUÇÕES PARA O CLIENTE:');
                console.log(`1. Acesse: ${verificationUrl}`);
                console.log(`2. Ou use o token: ${verificationToken}`);
                console.log('');
                console.log('⚠️ Para envios reais, configure domínio no Resend');
                console.log('📖 Veja: CONFIGURAR_DOMINIO_RESEND.md');
                
                return { 
                    success: true, 
                    messageId: 'dev-simulation-' + Date.now(),
                    simulated: true,
                    verificationUrl: verificationUrl,
                    token: verificationToken
                };
            }
            
            // ENVIO REAL via Resend (apenas para email registrado ou produção)
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [email],
                subject: '✅ Confirme seu email - BarberBot AI SaaS',
                html: this.getVerificationEmailTemplate(userName, verificationUrl, verificationToken)
            });

            if (error) {
                console.error('❌ Erro ao enviar email de verificação:', error);
                throw new Error(`Erro ao enviar email: ${error.message}`);
            }

            console.log('✅ Email de verificação enviado:', data.id);
            return { success: true, messageId: data.id };
        } catch (error) {
            console.error('❌ Erro no ResendEmailService:', error);
            throw error;
        }
    }

    async sendWelcomeEmail(email, userName = 'Usuário') {
        try {
            console.log(`🎉 Enviando email de boas-vindas para: ${email}`);
            
            // MODO DESENVOLVIMENTO: Simular envio para emails não registrados
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isRegisteredEmail = email === 'pedrol.vergueiro@gmail.com';
            
            if (isDevelopment && !isRegisteredEmail) {
                console.log('🧪 MODO DESENVOLVIMENTO - Email de boas-vindas simulado:');
                console.log('📧 Destinatário:', email);
                console.log('👤 Nome:', userName);
                console.log('🎉 Mensagem: Bem-vindo ao BarberBot AI SaaS!');
                console.log('');
                console.log('⚠️ Para envios reais, configure domínio no Resend');
                
                return { 
                    success: true, 
                    messageId: 'dev-welcome-' + Date.now(),
                    simulated: true
                };
            }
            
            // ENVIO REAL via Resend
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [email],
                subject: '🎉 Bem-vindo ao BarberBot AI SaaS!',
                html: this.getWelcomeEmailTemplate(userName)
            });

            if (error) {
                console.error('❌ Erro ao enviar email de boas-vindas:', error);
                throw new Error(`Erro ao enviar email: ${error.message}`);
            }

            console.log('✅ Email de boas-vindas enviado:', data.id);
            return { success: true, messageId: data.id };
        } catch (error) {
            console.error('❌ Erro no ResendEmailService:', error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email, resetToken, userName = 'Usuário') {
        try {
            const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;
            
            console.log(`🔐 Enviando email de reset para: ${email}`);
            
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: [email],
                subject: '🔐 Redefinir sua senha - BarberBot AI SaaS',
                html: this.getPasswordResetTemplate(userName, resetUrl)
            });

            if (error) {
                console.error('❌ Erro ao enviar email de reset:', error);
                throw new Error(`Erro ao enviar email: ${error.message}`);
            }

            console.log('✅ Email de reset enviado:', data.id);
            return { success: true, messageId: data.id };
        } catch (error) {
            console.error('❌ Erro no ResendEmailService:', error);
            throw error;
        }
    }

    // Método para testar configuração
    async testConnection() {
        try {
            console.log('🧪 Testando conexão com Resend...');
            
            // Usar email registrado para teste (limitação da conta gratuita)
            const testResult = await this.sendVerificationEmail(
                'pedrol.vergueiro@gmail.com', // Email registrado na conta Resend
                'test-connection-token-' + Date.now(),
                'Teste de Conexão'
            );
            
            console.log('✅ Conexão com Resend OK!');
            return { success: true, message: 'Conexão estabelecida' };
        } catch (error) {
            console.error('❌ Erro na conexão com Resend:', error.message);
            
            if (error.message.includes('API key')) {
                console.log('🔧 SOLUÇÃO: Verifique RESEND_API_KEY no .env');
            } else if (error.message.includes('domain')) {
                console.log('🔧 NOTA: Conta Resend limitada ao email registrado');
                console.log('📧 Email registrado: pedrol.vergueiro@gmail.com');
                console.log('🌐 Para outros emails, configure domínio em: https://resend.com/domains');
                // Não considerar como erro se for limitação de domínio
                return { success: true, message: 'Resend funcionando (limitado ao email registrado)' };
            }
            
            return { success: false, error: error.message };
        }
    }

    getVerificationEmailTemplate(userName, verificationUrl, token) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirme seu email</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #666;
                    font-size: 16px;
                }
                .content {
                    margin: 30px 0;
                }
                .btn {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-align: center;
                }
                .btn:hover {
                    opacity: 0.9;
                }
                .token-box {
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                    font-family: monospace;
                    font-size: 18px;
                    font-weight: bold;
                    color: #495057;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .features {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .feature-item {
                    margin: 8px 0;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .feature-item:last-child {
                    border-bottom: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🤖 BarberBot AI SaaS</div>
                    <div class="subtitle">Plataforma de Automação para Negócios</div>
                </div>
                
                <div class="content">
                    <h2>Olá, ${userName}! 👋</h2>
                    
                    <p>Obrigado por se cadastrar no <strong>BarberBot AI SaaS</strong>! Para completar seu cadastro e começar a usar nossa plataforma, você precisa confirmar seu endereço de email.</p>
                    
                    <div class="features">
                        <h3>🚀 O que você terá acesso:</h3>
                        <div class="feature-item">
                            <strong>🤖 Bots WhatsApp Ilimitados</strong> - Crie quantos bots precisar
                        </div>
                        <div class="feature-item">
                            <strong>📱 Atendimento 24/7</strong> - IA que nunca dorme
                        </div>
                        <div class="feature-item">
                            <strong>💳 Pagamentos Automáticos</strong> - Integração com Mercado Pago
                        </div>
                        <div class="feature-item">
                            <strong>📊 Dashboard Completo</strong> - Relatórios e análises
                        </div>
                        <div class="feature-item">
                            <strong>🎯 5 Personas de IA</strong> - Atendimento personalizado
                        </div>
                    </div>
                    
                    <p>Clique no botão abaixo para verificar seu email:</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="btn">✅ Confirmar Email</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Importante:</strong> Se o botão não funcionar, você pode copiar e colar o código abaixo em nossa página de verificação:
                    </div>
                    
                    <div class="token-box">
                        ${token}
                    </div>
                    
                    <p><strong>🔗 Link alternativo:</strong><br>
                    <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a></p>
                    
                    <div class="warning">
                        <strong>🕒 Atenção:</strong> Este link expira em 24 horas por segurança. Se expirar, você pode solicitar um novo email de verificação.
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>🤖 BarberBot AI SaaS</strong> - Automatize qualquer negócio com IA</p>
                    <p>Se você não se cadastrou em nossa plataforma, pode ignorar este email com segurança.</p>
                    <p style="font-size: 12px; color: #999;">
                        Este é um email automático, não responda a esta mensagem.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getWelcomeEmailTemplate(userName) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao BarberBot AI SaaS</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .welcome-badge {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    display: inline-block;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .features {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .feature-item {
                    margin: 10px 0;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .feature-item:last-child {
                    border-bottom: none;
                }
                .btn {
                    display: inline-block;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
                .steps {
                    background: #e8f5e8;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #28a745;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🤖 BarberBot AI SaaS</div>
                    <div class="welcome-badge">🎉 Email Verificado!</div>
                </div>
                
                <div class="content">
                    <h2>Parabéns, ${userName}! 🚀</h2>
                    
                    <p>Seu email foi verificado com sucesso! Agora você tem acesso completo ao <strong>BarberBot AI SaaS</strong>, a plataforma mais avançada para criar bots WhatsApp com Inteligência Artificial.</p>
                    
                    <div class="features">
                        <h3>🤖 Recursos Disponíveis:</h3>
                        
                        <div class="feature-item">
                            <strong>🏗️ Criador de Bots</strong><br>
                            Interface visual para criar bots sem programação
                        </div>
                        
                        <div class="feature-item">
                            <strong>📱 WhatsApp Multi-Instância</strong><br>
                            Conecte múltiplos números simultaneamente
                        </div>
                        
                        <div class="feature-item">
                            <strong>🧠 IA Avançada</strong><br>
                            5 personas diferentes para cada tipo de negócio
                        </div>
                        
                        <div class="feature-item">
                            <strong>📅 Agendamento Inteligente</strong><br>
                            Sistema completo de reservas automatizado
                        </div>
                        
                        <div class="feature-item">
                            <strong>💳 Pagamentos Integrados</strong><br>
                            Mercado Pago, PIX e cartões automáticos
                        </div>
                        
                        <div class="feature-item">
                            <strong>📊 Analytics Completo</strong><br>
                            Relatórios detalhados e métricas em tempo real
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${this.frontendUrl}/dashboard" class="btn">🚀 Acessar Dashboard</a>
                    </div>
                    
                    <div class="steps">
                        <h3>📚 Primeiros Passos:</h3>
                        <ol>
                            <li><strong>Acesse seu dashboard</strong> - Clique no botão acima</li>
                            <li><strong>Crie seu primeiro bot</strong> - Use nosso assistente visual</li>
                            <li><strong>Configure seu negócio</strong> - Defina serviços e preços</li>
                            <li><strong>Conecte o WhatsApp</strong> - Escaneie o QR Code</li>
                            <li><strong>Teste o atendimento</strong> - Envie uma mensagem de teste</li>
                            <li><strong>Publique e lucre!</strong> - Comece a receber clientes</li>
                        </ol>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>💡 Dica Pro:</strong> Comece com o template "Barbearia" - já vem configurado com agendamento, pagamentos e todas as funcionalidades prontas!
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>🤖 BarberBot AI SaaS</strong> - Automatize qualquer negócio com IA</p>
                    <p>Precisa de ajuda? Nossa documentação está disponível no dashboard!</p>
                    <p style="font-size: 12px; color: #999;">
                        Este é um email automático, não responda a esta mensagem.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getPasswordResetTemplate(userName, resetUrl) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .btn {
                    display: inline-block;
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 14px;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🤖 BarberBot AI SaaS</div>
                </div>
                
                <div class="content">
                    <h2>🔐 Redefinir Senha</h2>
                    
                    <p>Olá, ${userName}!</p>
                    
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>BarberBot AI SaaS</strong>.</p>
                    
                    <p>Clique no botão abaixo para criar uma nova senha:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="btn">🔐 Redefinir Senha</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Importante:</strong><br>
                        • Este link expira em 1 hora por segurança<br>
                        • Se você não solicitou esta alteração, ignore este email<br>
                        • Sua senha atual permanece ativa até você criar uma nova
                    </div>
                    
                    <p><strong>🔗 Link alternativo:</strong><br>
                    <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a></p>
                </div>
                
                <div class="footer">
                    <p><strong>🤖 BarberBot AI SaaS</strong> - Automatize qualquer negócio com IA</p>
                    <p>Se você não solicitou esta alteração, pode ignorar este email com segurança.</p>
                    <p style="font-size: 12px; color: #999;">
                        Este é um email automático, não responda a esta mensagem.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = ResendEmailService;