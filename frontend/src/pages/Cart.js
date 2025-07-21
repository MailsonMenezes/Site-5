import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';

const Cart = () => {
  const { cart, updateQuantity, removeItem, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity > 0) {
      updateQuantity(itemId, quantity);
    }
  };

  const handleFinalizarCompra = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/carrinho' } } });
      return;
    }
    navigate('/finalizar-compra');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Meu Carrinho</h1>
        
        <ProgressBar currentStep={1} />

        {cart.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 8m2-8h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-400 mb-8">Adicione produtos ao carrinho para continuar</p>
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Voltar às Compras
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-6 p-4 bg-gray-700 rounded-lg">
                      {/* Product Image */}
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{item.name}</h3>
                        <p className="text-blue-400 font-medium">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-300">Qtd:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-center"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-bold text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Remover item"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-32">
                <h2 className="text-2xl font-bold text-white mb-6">Resumo do Pedido</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Frete</span>
                    <span>A calcular</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-xl font-bold text-blue-400">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleFinalizarCompra}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Finalizar Compra</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center block"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;