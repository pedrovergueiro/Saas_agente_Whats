import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Bot, Plus, Activity, MessageSquare, Calendar, DollarSign, TrendingUp, Settings, LogOut, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    // Verificar se tem token ao carregar
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Configurar axios com token
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Carregar dados do usuário
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data.user);

      // Carregar bots
      const botsRes = await api.get('/bots');
      setBots(botsRes.data.data.bots || []);

      // Calcular estatísticas gerais
      const totalMessages = (botsRes.data.data.bots || []).reduce((sum, bot) => sum + (bot.total_messages || 0), 0);
      const totalAppointments = (botsRes.data.data.bots || []).reduce((sum, bot) => sum + (bot.total_appointments || 0), 0);
      const totalRevenue = (botsRes.data.data.bots || []).reduce((sum, bot) => sum + parseFloat(bot.total_revenue || 0), 0);

      setStats({
        totalMessages,
        totalAppointments,
        totalRevenue,
        activeBots: (botsRes.data.data.bots || []).filter(b => b.status === 'active' || b.status === 'connected').length
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        toast.error('Erro ao carregar dados');
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleDeleteBot = async (botId, botName) => {
    if (!confirm(`Tem certeza que deseja excluir o bot "${botName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await api.delete(`/bots/${botId}`);
      toast.success('Bot excluído com sucesso!');
      loadDashboard(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir bot:', error);
      toast.error('Erro ao excluir bot');
    }
  };

  const handleToggleBot = async (botId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const isActive = currentStatus === 'active' || currentStatus === 'connected';
      const endpoint = isActive ? 'deactivate' : 'activate';
      
      await api.post(`/bots/${botId}/${endpoint}`);
      toast.success(isActive ? 'Bot desativado!' : 'Bot ativado!');
      loadDashboard(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status do bot:', error);
      toast.error('Erro ao alterar status do bot');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'active': return 'Ativo';
      case 'connecting': return 'Conectando';
      case 'inactive': return 'Inativo';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
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
        <title>Dashboard - WhatsApp Bot SaaS</title>
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center space-x-2 p-6 border-b">
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold">WhatsApp Bot</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/dashboard/bots" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Bot className="h-5 w-5" />
                <span>Meus Bots</span>
              </Link>
              <Link href="/dashboard/messages" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <MessageSquare className="h-5 w-5" />
                <span>Mensagens</span>
              </Link>
              <Link href="/dashboard/appointments" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5" />
                <span>Agendamentos</span>
              </Link>
              <Link href="/dashboard/analytics" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
              <Link href="/dashboard/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">Plano {user?.plan_type}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user?.full_name}!
            </h1>
            <p className="text-gray-600">
              Aqui está um resumo da sua conta
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeBots || 0}</p>
              <p className="text-sm text-gray-600">Bots Ativos</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
              <p className="text-sm text-gray-600">Mensagens Enviadas</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAppointments || 0}</p>
              <p className="text-sm text-gray-600">Agendamentos</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                R$ {stats?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600">Faturamento Total</p>
            </div>
          </div>

          {/* Bots List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Seus Bots</h2>
              <Link
                href="/dashboard/bots/new"
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Bot</span>
              </Link>
            </div>

            {bots.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum bot criado ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro bot para começar a atender clientes
                </p>
                <Link
                  href="/dashboard/bots/new"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="h-5 w-5" />
                  <span>Criar Primeiro Bot</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Bot className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                        <p className="text-sm text-gray-600">{bot.business_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bot.status)}`}>
                        {getStatusText(bot.status)}
                      </span>
                      <button
                        onClick={() => handleToggleBot(bot.id, bot.status)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          bot.status === 'active' || bot.status === 'connected'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={bot.status === 'active' || bot.status === 'connected' ? 'Desativar bot' : 'Ativar bot'}
                      >
                        {bot.status === 'active' || bot.status === 'connected' ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDeleteBot(bot.id, bot.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir bot"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <Link
                        href={`/dashboard/bots/${bot.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Gerenciar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Uso do Plano</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Mensagens este mês:</span>
                <span className="font-medium text-blue-900">
                  {user?.messages_used_month || 0} / {user?.max_messages_month || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Bots ativos:</span>
                <span className="font-medium text-blue-900">
                  {bots.length} / {user?.max_bots || 0}
                </span>
              </div>
            </div>
            {user?.status === 'trial' && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  ⏰ Seu período de teste termina em{' '}
                  {new Date(user.trial_ends_at).toLocaleDateString('pt-BR')}
                </p>
                <Link
                  href="/dashboard/billing"
                  className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Assinar agora →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
