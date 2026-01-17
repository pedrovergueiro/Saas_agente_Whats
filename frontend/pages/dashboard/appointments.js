import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export default function Appointments() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Agendamentos - Dashboard</title>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Agendamentos</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🚧 Em Desenvolvimento</h2>
            <p className="text-blue-700">
              Esta página está em desenvolvimento. Em breve você terá acesso a:
            </p>
            <ul className="mt-4 space-y-2 text-blue-700">
              <li>📅 Calendário de agendamentos</li>
              <li>⏰ Horários disponíveis</li>
              <li>✅ Confirmar/cancelar agendamentos</li>
              <li>🔔 Lembretes automáticos</li>
              <li>👥 Lista de clientes agendados</li>
              <li>📊 Relatório de agendamentos</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento ainda</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
