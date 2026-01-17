import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email
      });

      if (response.data.success) {
        setSuccess('Se o email existir, você receberá instruções para redefinir sua senha.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Senha - BarberBot AI SaaS</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 BarberBot AI</h1>
              <p className="text-gray-600">Plataforma SaaS</p>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Recuperar Senha
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Digite seu email para receber instruções de recuperação
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

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Instruções'
                )}
              </button>
            </div>
          </form>

          <div className="text-center space-y-2">
            <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm">
              ← Voltar para o login
            </Link>
            <br />
            <Link href="/register" className="text-gray-500 hover:text-gray-700 text-sm">
              Criar nova conta
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔐 Como funciona:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Digite seu email cadastrado</li>
              <li>• Você receberá um link por email</li>
              <li>• Clique no link para criar nova senha</li>
              <li>• O link expira em 1 hora por segurança</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}