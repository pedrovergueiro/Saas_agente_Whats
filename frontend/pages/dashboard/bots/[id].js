import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Bot, ArrowLeft, RefreshCw, Power, Settings, BarChart3, MessageSquare } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function BotDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bot, setBot] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadBot();
      loadStats();
      
      // Auto-refresh QR code a cada 10 segundos se estiver desconectado
      const interval = setInterval(() => {
        if (bot?.status !== 'connected') {
          loadQRCode();
        }
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [id, bot?.status]);

  const loadBot = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await api.get(`/bots/${id}`);
      setBot(res.data.data.bot);
      
      // Carregar QR Code se não estiver conectado
      if (res.data.data.bot.status !== 'connected') {
        loadQRCode();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar bot:', error);
      toast.error('Erro ao carregar bot');
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const res = await api.get(`/bots/${id}/qr`);
      setQrData(res.data.data);
    } catch (error) {
      console.error('Erro ao carregar QR Code:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const res = await api.get(`/bots/${id}/stats`);
      setStats(res.data.data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleReconnect = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await api.post(`/bots/${id}/reconnect`);
      toast.success('Reconexão iniciada. Aguarde o QR Code...');
      
      setTimeout(() => {
        loadBot();
        loadQRCode();
        setRefreshing(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao reconectar:', error);
      toast.error('Erro ao reconectar bot');
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar este bot?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      await api.post(`/bots/${id}/disconnect`);
      toast.success('Bot desconectado');
      loadBot();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar bot');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '✅ Conectado';
      case 'connecting': return '⏳ Conectando';
      case 'disconnected': return '❌ Desconectado';
      case 'error': return '⚠️ Erro';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{bot?.name} - WhatsApp Bot</title>
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar ao Dashboard</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{bot?.name}</h1>
              <p className="text-gray-600">{bot?.business_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(bot?.status)}`}>
                {getStatusText(bot?.status)}
              </span>
              <Link
                href={`/dashboard/bots/${id}/settings`}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code / Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Conexão WhatsApp</h2>

              {bot?.status === 'connected' ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    WhatsApp Conectado!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Número: {bot?.whatsapp_number || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    Conectado em: {new Date(bot?.connected_at).toLocaleString('pt-BR')}
                  </p>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Power className="h-4 w-4" />
                    <span>Desconectar</span>
                  </button>
                </div>
              ) : qrData?.status === 'qr_available' && qrData?.qr_code ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                    <QRCodeSVG
                      value={qrData.qr_code}
                      size={256}
                      level="H"
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Escaneie o QR Code
                  </h3>
                  <ol className="text-sm text-left text-gray-600 space-y-2 mb-4">
                    <li>1. Abra o WhatsApp no celular</li>
                    <li>2. Toque em "Mais opções" (⋮)</li>
                    <li>3. Toque em "Aparelhos conectados"</li>
                    <li>4. Toque em "Conectar um aparelho"</li>
                    <li>5. Aponte a câmera para este QR Code</li>
                  </ol>
                  <button
                    onClick={handleReconnect}
                    disabled={refreshing}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Atualizar QR Code</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Gerando QR Code...
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Aguarde alguns segundos
                  </p>
                  <button
                    onClick={handleReconnect}
                    disabled={refreshing}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/bots/${id}/menu`}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg border-l-4 border-green-500"
                >
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <div className="font-medium text-gray-900">Cardápio Digital</div>
                    <div className="text-xs text-gray-500">Gerencie seu cardápio</div>
                  </div>
                </Link>
                <Link
                  href={`/dashboard/bots/${id}/messages`}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg border-l-4 border-blue-500"
                >
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Mensagens Personalizadas</div>
                    <div className="text-xs text-gray-500">Configure respostas automáticas</div>
                  </div>
                </Link>
                <Link
                  href={`/dashboard/bots/${id}/analytics`}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                >
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href={`/dashboard/bots/${id}/settings`}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Configurações</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total de Mensagens</span>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {bot?.total_messages || 0}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Agendamentos</span>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {bot?.total_appointments || 0}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Faturamento</span>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {parseFloat(bot?.total_revenue || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Clientes</span>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_customers || 0}
                </p>
              </div>
            </div>

            {/* Bot Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Bot</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nome do Negócio</p>
                  <p className="font-medium">{bot?.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo</p>
                  <p className="font-medium capitalize">{bot?.business_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Horário de Funcionamento</p>
                  <p className="font-medium">{bot?.open_time} - {bot?.close_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">IA Ativada</p>
                  <p className="font-medium">{bot?.ai_enabled ? '✅ Sim' : '❌ Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Criado em</p>
                  <p className="font-medium">
                    {new Date(bot?.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Última Atividade</p>
                  <p className="font-medium">
                    {bot?.last_activity_at 
                      ? new Date(bot.last_activity_at).toLocaleString('pt-BR')
                      : 'Nenhuma'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
              <p className="text-gray-600 text-center py-8">
                Nenhuma atividade recente
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
