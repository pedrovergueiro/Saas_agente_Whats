import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShoppingCart, Plus, Minus, X, Check, Phone, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function PublicMenu() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bot, setBot] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    payment_method: 'dinheiro',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      loadMenu();
    }
  }, [id]);

  const loadMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/public/menu/${id}`);
      setBot(res.data.data.bot);
      setCategories(res.data.data.categories);
      setItems(res.data.data.items);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      toast.error('Erro ao carregar cardápio');
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} adicionado!`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(i => {
      if (i.id === itemId) {
        const newQuantity = i.quantity + delta;
        return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!customerData.name || !customerData.phone) {
      toast.error('Preencha nome e telefone');
      return;
    }

    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      await axios.post(`http://localhost:5000/api/public/orders/${id}`, {
        ...customerData,
        items: orderItems
      });

      toast.success('Pedido enviado com sucesso!');
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setCustomerData({
        name: '',
        phone: '',
        address: '',
        payment_method: 'dinheiro',
        notes: ''
      });

      // Redirecionar para WhatsApp
      const message = `Olá! Fiz um pedido pelo cardápio:\n\n${orderItems.map(i => `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n')}\n\nTotal: R$ ${getTotal().toFixed(2)}\n\nNome: ${customerData.name}\nTelefone: ${customerData.phone}\nEndereço: ${customerData.address || 'Retirar no local'}`;
      
      const whatsappUrl = `https://wa.me/${bot.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Erro ao enviar pedido');
    }
  };

  const getItemsByCategory = (categoryId) => {
    return items.filter(item => item.category_id === categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{bot?.name} - Cardápio Digital</title>
      </Head>

      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">🍽️ {bot?.name}</h1>
            <div className="space-y-1 text-green-100">
              {bot?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{bot.address}</span>
                </div>
              )}
              {bot?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{bot.phone}</span>
                </div>
              )}
              {bot?.open_time && bot?.close_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Horário: {bot.open_time} - {bot.close_time}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="max-w-4xl mx-auto p-6">
          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                
                <div className="space-y-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-green-600 mt-2">
                            R$ {parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="ml-4 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Cardápio em breve...</p>
            </div>
          )}
        </div>

        {/* Carrinho Flutuante */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-green-700 transition flex items-center space-x-3"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="font-semibold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
            </span>
            <span className="font-bold">
              R$ {getTotal().toFixed(2)}
            </span>
          </button>
        )}

        {/* Modal do Carrinho */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Seu Pedido</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        R$ {parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      R$ {getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full mt-4 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Checkout */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Finalizar Pedido</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Entrega
                  </label>
                  <textarea
                    value={customerData.address}
                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Rua, número, complemento, bairro"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para retirar no local
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <select
                    value={customerData.payment_method}
                    onChange={(e) => setCustomerData({ ...customerData, payment_method: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Alguma observação sobre o pedido?"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Resumo do Pedido:</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm mb-1">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
