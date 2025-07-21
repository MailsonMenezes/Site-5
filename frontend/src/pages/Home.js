import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';

const Home = () => {
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState({});

  // Produtos de exemplo (substitua pelos seus produtos reais)
  const products = [
    {
      id: '1',
      name: 'Notebook Gamer Pro',
      price: 2999.99,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
      description: 'Notebook gamer com placa de vídeo dedicada'
    },
    {
      id: '2', 
      name: 'Smartphone Premium',
      price: 1599.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      description: 'Smartphone com câmera profissional'
    },
    {
      id: '3',
      name: 'Tablet Ultra HD',
      price: 899.99,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      description: 'Tablet com tela de alta resolução'
    },
    {
      id: '4',
      name: 'Smartwatch Fitness',
      price: 499.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      description: 'Relógio inteligente com monitoramento de saúde'
    },
    {
      id: '5',
      name: 'Fone Bluetooth Premium',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      description: 'Fone de ouvido sem fio com cancelamento de ruído'
    },
    {
      id: '6',
      name: 'Câmera Digital 4K',
      price: 1899.99,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=300&fit=crop',
      description: 'Câmera digital profissional 4K'
    }
  ];

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const handleAddToCart = async (product) => {
    setAddingToCart({ ...addingToCart, [product.id]: true });
    
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      
      // Feedback visual
      setTimeout(() => {
        setAddingToCart({ ...addingToCart, [product.id]: false });
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      setAddingToCart({ ...addingToCart, [product.id]: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 via-gray-900 to-blue-900 py-24">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-blue-400">MX3</span> Network
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Tecnologia de ponta com os melhores preços do mercado. 
              Descubra nossa seleção exclusiva de produtos eletrônicos.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/carrinho"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                Ver Carrinho
              </Link>
              <a
                href="#products"
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors border border-gray-600"
              >
                Ver Produtos
              </a>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Nossos Produtos</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Explore nossa seleção de produtos tecnológicos de última geração
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-blue-500">
                  <div className="aspect-w-16 aspect-h-12">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 text-sm">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-400">
                        {formatCurrency(product.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart[product.id]}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        {addingToCart[product.id] ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Adicionando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Por que escolher a MX3 Network?</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Compra Segura</h3>
                <p className="text-gray-400">Pagamento 100% seguro com criptografia SSL</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Entrega Rápida</h3>
                <p className="text-gray-400">Frete calculado automaticamente por região</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Suporte 24/7</h3>
                <p className="text-gray-400">Atendimento especializado quando precisar</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center space-x-2">
              <span className="text-3xl font-bold text-blue-500">MX3</span>
              <span className="text-xl font-medium text-gray-300">NETWORK</span>
            </Link>
          </div>
          <p className="text-gray-400">
            &copy; 2025 MX3 Network. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;