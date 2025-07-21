import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: user?.nome_completo || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cpf: user?.cpf || '',
    cep: user?.cep || '',
    rua: user?.rua || '',
    numero: user?.numero || '',
    bairro: user?.bairro || '',
    cidade: user?.cidade || '',
    estado: user?.estado || '',
    paymentType: '',
    plataforma: ''
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/carrinho');
    }
  }, [cart, navigate]);

  useEffect(() => {
    if (formData.estado) {
      calculateShipping(formData.estado);
    }
  }, [formData.estado]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatPhone = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    // Aplicar máscaras
    if (name === 'telefone') {
      value = formatPhone(value);
    } else if (name === 'cpf') {
      value = formatCPF(value);
    } else if (name === 'cep') {
      value = formatCEP(value);
      if (value.replace(/\D/g, '').length === 8) {
        consultarCEP(value);
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const consultarCEP = async (cep) => {
    try {
      const response = await axios.get(`${API}/utils/cep/${cep}`);
      if (response.data.success) {
        const endereco = response.data.data.endereco;
        setFormData(prev => ({
          ...prev,
          rua: endereco.rua || '',
          bairro: endereco.bairro || '',
          cidade: endereco.cidade || '',
          estado: endereco.estado || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
    }
  };

  const calculateShipping = async (estado) => {
    try {
      const response = await axios.get(`${API}/utils/shipping/${estado}`);
      if (response.data.success) {
        setShippingCost(response.data.data.shipping_cost);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        carrinho: cart,
        cliente: {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf.replace(/\D/g, '')
        },
        endereco: {
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado
        },
        pagamento: {
          tipo: formData.paymentType,
          plataforma: formData.plataforma
        },
        total: getTotal() + shippingCost
      };

      const response = await axios.post(`${API}/orders/create`, orderData);
      
      if (response.data.success) {
        await clearCart();
        navigate('/confirmacao', { 
          state: { 
            orderId: response.data.payment_id,
            message: response.data.message 
          }
        });
      } else {
        alert('Erro no processamento: ' + response.data.message);
      }
    } catch (error) {
      alert('Erro ao processar pedido: ' + (error.response?.data?.detail || error.message));
    }

    setLoading(false);
  };

  const paymentMethods = [
    { id: 'credit_card', label: 'Cartão de Crédito', platforms: ['mercadopago', 'infinitepay', 'pagseguro'] },
    { id: 'paypal', label: 'PayPal', platforms: ['paypal'] },
    { id: 'pix', label: 'PIX', platforms: ['bb', 'itau'] },
    { id: 'boleto', label: 'Boleto Bancário', platforms: ['bb', 'itau'] },
    { id: 'transferencia', label: 'Transferência Bancária', platforms: ['bb', 'itau'] }
  ];

  const platformLabels = {
    mercadopago: 'Mercado Pago',
    infinitepay: 'InfinitePay', 
    pagseguro: 'PagSeguro',
    paypal: 'PayPal',
    bb: 'Banco do Brasil',
    itau: 'Itaú'
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Finalizar Compra</h1>
        
        <ProgressBar currentStep={2} />

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dados Pessoais */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Dados Pessoais
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Endereço de Entrega
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">Rua</label>
                  <input
                    type="text"
                    name="rua"
                    value={formData.rua}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Estado</label>
                    <input
                      type="text"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Forma de Pagamento
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Tipo de Pagamento</label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.label}</option>
                    ))}
                  </select>
                </div>

                {formData.paymentType && (
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      {formData.paymentType === 'credit_card' ? 'Plataforma' : 
                       ['pix', 'boleto', 'transferencia'].includes(formData.paymentType) ? 'Banco' : 'Processador'}
                    </label>
                    <select
                      name="plataforma"
                      value={formData.plataforma}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      {paymentMethods.find(m => m.id === formData.paymentType)?.platforms.map(platform => (
                        <option key={platform} value={platform}>{platformLabels[platform]}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-32">
              <h2 className="text-2xl font-bold text-white mb-6">Resumo do Pedido</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{item.name}</h4>
                      <p className="text-gray-400 text-sm">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Frete</span>
                  <span>{shippingCost > 0 ? formatCurrency(shippingCost) : 'A calcular'}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between text-xl font-bold text-blue-400">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal() + shippingCost)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>{loading ? 'Processando...' : 'Finalizar e Pagar'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;