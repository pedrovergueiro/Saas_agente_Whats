import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

export default function VerifyEmail() {
  const router = useRouter();
  const { token, email } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Verificar automaticamente se token estiver na URL
  useEffect(() => {
    if (token && !verifying && !success && !error) {
      verifyEmailToken(token);
    }
  }, [token]);

  const verifyEmailToken = async (tokenToVerify) => {
    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-email', {
        token: tokenToVerify
      });

      if (response.data.success) {
        setSuccess('Email verificado com sucesso! Redirecionando para o dashboard...');
        
        // Salvar token de autenticação
        localStorage.setItem('token', response.data.data.token);
        
        // Redirecionar para dashboard após 3 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao verificar email');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setError('Digite o código de verificação');
      return;
    }
    await verifyEmailToken(manualToken.trim());
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email não encontrado. Tente fazer login novamente.');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/resend-verification', {
        email: email
      });

      if (response.data.success) {
        setSuccess('Email de verificação reenviado! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao reenviar email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email - BarberBot AI SaaS</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 BarberBot AI</h1>
              <p className="text-gray-600">Plataforma SaaS</p>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verificar Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Confirme seu endereço de email para ativar sua conta
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {verifying && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Verificando email...
              </div>
            </div>
          )}

          {!success && !verifying && (
            <div className="space-y-6">
              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">📧 Verifique sua caixa de entrada</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Enviamos um email de verificação para:
                </p>
                <p className="text-sm font-mono bg-white px-2 py-1 rounded border text-blue-800">
                  {email || 'seu@email.com'}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Clique no link do email ou digite o código abaixo
                </p>
              </div>

              {/* Verificação manual */}
              <form onSubmit={handleManualVerification} className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificação
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="Cole o código do email aqui"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verifying}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    'Verificar Email'
                  )}
                </button>
              </form>

              {/* Reenviar email */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Não recebeu o email?
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading || !email}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      Reenviando...
                    </span>
                  ) : (
                    'Reenviar email de verificação'
                  )}
                </button>
              </div>

              {/* Dicas */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 Dicas:</h3>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Verifique a pasta de spam/lixo eletrônico</li>
                  <li>• O email pode demorar alguns minutos para chegar</li>
                  <li>• Certifique-se de que o email está correto</li>
                  <li>• O código expira em 24 horas</li>
                </ul>
              </div>
            </div>
          )}

          {/* Links de navegação */}
          <div className="text-center space-y-2">
            <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm">
              ← Voltar para o login
            </Link>
            <br />
            <Link href="/register" className="text-gray-500 hover:text-gray-700 text-sm">
              Criar nova conta
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}