import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, MessageSquare, Calendar, DollarSign } from 'lucide-react';

export default function Analytics() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Analytics - Dashboard</title>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🚧 Em Desenvolvimento</h2>
            <p className="text-blue-700">
              Esta página está em desenvolvimento. Em breve você terá acesso a:
            </p>
            <ul className="mt-4 space-y-2 text-blue-700">
              <li>📊 Gráficos de mensagens por dia/semana/mês</li>
              <li>📈 Taxa de conversão de leads</li>
              <li>⏱️ Tempo médio de resposta</li>
              <li>👥 Clientes mais ativos</li>
              <li>💰 Faturamento por período</li>
              <li>📱 Horários de pico</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Crescimento</h3>
              <p className="text-gray-600 text-sm">Análise de crescimento mensal</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Clientes</h3>
              <p className="text-gray-600 text-sm">Análise de base de clientes</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Engajamento</h3>
              <p className="text-gray-600 text-sm">Taxa de resposta e interação</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
