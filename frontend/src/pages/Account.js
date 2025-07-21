import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Account = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/my-orders`);
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'pendente': return 'bg-yellow-500';
      case 'cancelado': return 'bg-red-500';
      case 'erro': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'erro': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user?.nome_completo?.charAt(0) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{user?.nome_completo}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">CPF/CNPJ:</span>
                  <p className="text-white font-medium">{user?.cpf}</p>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-400">Telefone:</span>
                  <p className="text-white font-medium">{user?.telefone}</p>
                </div>

                {user?.cidade && (
                  <div className="text-sm">
                    <span className="text-gray-400">Localização:</span>
                    <p className="text-white font-medium">{user.cidade}, {user.estado}</p>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl p-6">
              <h1 className="text-3xl font-bold text-white mb-8">Meus Pedidos</h1>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-r-transparent rounded-full"></div>
                  <p className="text-gray-400 mt-4">Carregando pedidos...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 text-gray-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-4">Nenhum pedido encontrado</h3>
                  <p className="text-gray-400 mb-6">Você ainda não fez nenhuma compra conosco</p>
                  <a
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Fazer Primeira Compra
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">Pedido #{order.payment_id || order.id.slice(-8)}</h3>
                          <p className="text-gray-400 text-sm">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-xl font-bold text-blue-400">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-300 border-b border-gray-600 pb-2">Itens do Pedido:</h4>
                        {order.carrinho?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 py-2">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-white">{item.name}</p>
                              <p className="text-sm text-gray-400">Qtd: {item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                            <p className="font-medium text-white">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <h4 className="font-medium text-gray-300 mb-2">Endereço de Entrega:</h4>
                        <p className="text-sm text-gray-400">
                          {order.endereco?.rua}, {order.endereco?.numero} - {order.endereco?.bairro}
                          <br />
                          {order.endereco?.cidade}, {order.endereco?.estado} - CEP: {order.endereco?.cep}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-300">Pagamento:</h4>
                          <p className="text-sm text-gray-400 capitalize">
                            {order.pagamento?.tipo?.replace('_', ' ')} 
                            {order.pagamento?.plataforma && ` - ${order.pagamento.plataforma}`}
                          </p>
                        </div>
                        {order.status === 'pendente' && (
                          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                            Ver Status do Pagamento
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;