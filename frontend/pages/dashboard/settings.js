import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Lock, CreditCard } from 'lucide-react';

export default function Settings() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Configurações - Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar ao Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🚧 Em Desenvolvimento</h2>
            <p className="text-blue-700">
              Esta página está em desenvolvimento. Em breve você terá acesso a:
            </p>
            <ul className="mt-4 space-y-2 text-blue-700">
              <li>👤 Perfil do usuário</li>
              <li>🔔 Notificações</li>
              <li>🔒 Segurança e senha</li>
              <li>💳 Plano e pagamento</li>
              <li>🎨 Personalização</li>
              <li>🔗 Integrações</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Perfil</h3>
                  <p className="text-sm text-gray-600">Informações pessoais</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <Bell className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold">Notificações</h3>
                  <p className="text-sm text-gray-600">Preferências de alertas</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <Lock className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold">Segurança</h3>
                  <p className="text-sm text-gray-600">Senha e autenticação</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold">Plano</h3>
                  <p className="text-sm text-gray-600">Assinatura e pagamento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
