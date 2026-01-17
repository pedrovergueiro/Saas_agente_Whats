import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function BotMessages() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    trigger: '',
    message_text: '',
    options: []
  });

  useEffect(() => {
    if (id) {
      loadBot();
      loadMessages();
    }
  }, [id]);

  const loadBot = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const res = await api.get(`/bots/${id}`);
      setBot(res.data.data.bot);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar bot:', error);
      toast.error('Erro ao carregar bot');
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const res = await api.get(`/bots/${id}/messages`);
      setMessages(res.data.data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { number: '', text: '', action: '' }]
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (editingMessage) {
        await api.put(`/bots/${id}/messages/${editingMessage.id}`, formData);
        toast.success('Mensagem atualizada!');
      } else {
        await api.post(`/bots/${id}/messages`, formData);
        toast.success('Mensagem criada!');
      }

      setShowAddForm(false);
      setEditingMessage(null);
      setFormData({ trigger: '', message_text: '', options: [] });
      loadMessages();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar mensagem');
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      trigger: message.trigger,
      message_text: message.message_text,
      options: message.options || []
    });
    setShowAddForm(true);
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await api.delete(`/bots/${id}/messages/${messageId}`);
      toast.success('Mensagem excluída!');
      loadMessages();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mensagens - {bot?.name}</title>
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/dashboard/bots/${id}`}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar ao Bot</span>
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mensagens Personalizadas
              </h1>
              <p className="text-gray-600">{bot?.name}</p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingMessage(null);
                setFormData({ trigger: '', message_text: '', options: [] });
              }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Mensagem</span>
            </button>
          </div>

          {/* Formulário de Adicionar/Editar */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingMessage ? 'Editar Mensagem' : 'Nova Mensagem'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gatilho (palavra-chave ou número)
                  </label>
                  <input
                    type="text"
                    value={formData.trigger}
                    onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 1, menu, oi, agendar"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Quando o cliente digitar isso, esta mensagem será enviada
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.message_text}
                    onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Digite a mensagem que será enviada..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Opções (Menu)
                    </label>
                    <button
                      onClick={handleAddOption}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Adicionar Opção
                    </button>
                  </div>

                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={option.number}
                        onChange={(e) => handleOptionChange(index, 'number', e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="1️⃣"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Texto da opção"
                      />
                      <input
                        type="text"
                        value={option.action}
                        onChange={(e) => handleOptionChange(index, 'action', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ação"
                      />
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}

                  <p className="text-sm text-gray-500 mt-2">
                    Exemplo: Número: "1️⃣", Texto: "Agendar corte", Ação: "agendar"
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="h-5 w-5" />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMessage(null);
                      setFormData({ trigger: '', message_text: '', options: [] });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Mensagens */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">Nenhuma mensagem cadastrada</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Criar primeira mensagem
                </button>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {message.trigger}
                        </span>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap mb-4">
                        {message.message_text}
                      </p>
                      
                      {message.options && message.options.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Opções:</p>
                          {message.options.map((option, index) => (
                            <div key={index} className="text-sm text-gray-600 mb-1">
                              {option.number} {option.text} → {option.action}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(message)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
