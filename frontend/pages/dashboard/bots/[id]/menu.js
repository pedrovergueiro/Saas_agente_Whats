import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Eye, ExternalLink } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function BotMenu() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bot, setBot] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 0
  });
  
  const [itemForm, setItemForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    display_order: 0
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
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

      const [botRes, categoriesRes, itemsRes] = await Promise.all([
        api.get(`/bots/${id}`),
        api.get(`/bots/${id}/menu/categories`),
        api.get(`/bots/${id}/menu/items`)
      ]);

      setBot(botRes.data.data.bot);
      setCategories(categoriesRes.data.data.categories);
      setItems(itemsRes.data.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (editingCategory) {
        await api.put(`/bots/${id}/menu/categories/${editingCategory.id}`, {
          ...categoryForm,
          active: 1
        });
        toast.success('Categoria atualizada!');
      } else {
        await api.post(`/bots/${id}/menu/categories`, categoryForm);
        toast.success('Categoria criada!');
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', display_order: 0 });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Tem certeza? Isso excluirá todos os itens desta categoria.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await api.delete(`/bots/${id}/menu/categories/${categoryId}`);
      toast.success('Categoria excluída!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleSaveItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = {
        ...itemForm,
        price: parseFloat(itemForm.price)
      };

      if (editingItem) {
        await api.put(`/bots/${id}/menu/items/${editingItem.id}`, {
          ...data,
          available: 1
        });
        toast.success('Item atualizado!');
      } else {
        await api.post(`/bots/${id}/menu/items`, data);
        toast.success('Item criado!');
      }

      setShowItemForm(false);
      setEditingItem(null);
      setItemForm({ category_id: '', name: '', description: '', price: '', image_url: '', display_order: 0 });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.error('Erro ao salvar item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await api.delete(`/bots/${id}/menu/items/${itemId}`);
      toast.success('Item excluído!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const getItemsByCategory = (categoryId) => {
    return items.filter(item => item.category_id === categoryId);
  };

  const menuUrl = `http://localhost:3000/menu/${id}`;

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
        <title>Cardápio - {bot?.name}</title>
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
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
                Cardápio Digital
              </h1>
              <p className="text-gray-600">{bot?.business_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="h-5 w-5" />
                <span>Ver Cardápio</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(menuUrl);
                  toast.success('Link copiado!');
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          {/* Link do Cardápio */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-900 mb-2">🔗 Link do Cardápio:</p>
            <code className="text-sm text-blue-700 bg-white px-3 py-2 rounded block">
              {menuUrl}
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Compartilhe este link com seus clientes ou use no bot do WhatsApp
            </p>
          </div>

          {/* Categorias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Categorias</h2>
              <button
                onClick={() => {
                  setShowCategoryForm(true);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', display_order: 0 });
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>Nova Categoria</span>
              </button>
            </div>

            {showCategoryForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nome da categoria (ex: Entradas, Pratos Principais)"
                  />
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Descrição (opcional)"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveCategory}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma categoria criada. Crie a primeira!
                </p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {getItemsByCategory(category.id).length} itens
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({
                            name: category.name,
                            description: category.description || '',
                            display_order: category.display_order
                          });
                          setShowCategoryForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Itens do Cardápio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Itens do Cardápio</h2>
              <button
                onClick={() => {
                  if (categories.length === 0) {
                    toast.error('Crie uma categoria primeiro!');
                    return;
                  }
                  setShowItemForm(true);
                  setEditingItem(null);
                  setItemForm({
                    category_id: categories[0].id,
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    display_order: 0
                  });
                }}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Item</span>
              </button>
            </div>

            {showItemForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h3>
                <div className="space-y-3">
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nome do item (ex: Filé à Parmegiana)"
                  />
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Descrição (ex: Acompanha arroz, fritas e salada)"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Preço (ex: 45.00)"
                  />
                  <input
                    type="text"
                    value={itemForm.image_url}
                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL da imagem (opcional)"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveItem}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowItemForm(false);
                        setEditingItem(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {categories.map((category) => {
              const categoryItems = getItemsByCategory(category.id);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                          <p className="text-lg font-semibold text-green-600 mt-1">
                            R$ {parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm({
                                category_id: item.category_id,
                                name: item.name,
                                description: item.description || '',
                                price: item.price.toString(),
                                image_url: item.image_url || '',
                                display_order: item.display_order
                              });
                              setShowItemForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Nenhum item no cardápio. Adicione o primeiro!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
