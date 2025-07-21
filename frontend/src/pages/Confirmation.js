import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import Header from '../components/Header';

const Confirmation = () => {
  const location = useLocation();
  const { orderId, message } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <ProgressBar currentStep={4} />

        <div className="bg-gray-800 rounded-xl p-12 text-center max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-6">
            Pedido Confirmado!
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-300 mb-8">
            {message || 'Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado.'}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-700 rounded-lg p-4 mb-8 inline-block">
              <p className="text-gray-300 text-sm">ID do Pedido:</p>
              <p className="text-white font-mono font-bold text-lg">{orderId}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-gray-400 text-base mb-12 space-y-2">
            <p>✓ Você receberá uma confirmação por e-mail em breve</p>
            <p>✓ Acompanhe o status do seu pedido na sua conta</p>
            <p>✓ Prazo de entrega: 5-10 dias úteis</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/minha-conta"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Ver Meus Pedidos</span>
            </Link>

            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Voltar à Loja</span>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Dúvidas? Entre em contato conosco pelo e-mail:{' '}
              <a href="mailto:suporte@mx3network.com" className="text-blue-400 hover:text-blue-300">
                suporte@mx3network.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirmation;