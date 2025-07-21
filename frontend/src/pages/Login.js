import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loginData, setLoginData] = useState({
    email: '',
    senha: ''
  });

  const [registerData, setRegisterData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    cpf: '',
    senha: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [showAddressFields, setShowAddressFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error

  const from = location.state?.from?.pathname || '/';

  // Máscaras de input
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

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    let { name, value } = e.target;
    
    // Aplicar máscaras
    if (name === 'telefone') {
      value = formatPhone(value);
    } else if (name === 'cpf') {
      value = formatCPF(value);
    } else if (name === 'cep') {
      value = formatCEP(value);
      // Auto-completar endereço
      if (value.replace(/\D/g, '').length === 8) {
        consultarCEP(value);
      }
    }

    setRegisterData({ ...registerData, [name]: value });
  };

  const consultarCEP = async (cep) => {
    try {
      const response = await axios.get(`${API}/utils/cep/${cep}`);
      if (response.data.success) {
        const endereco = response.data.data.endereco;
        setRegisterData(prev => ({
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(loginData.email, loginData.senha);
    
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
    
    if (result.success) {
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      
      if (response.data.success) {
        setMessage('Cadastro realizado com sucesso! Faça o login para continuar.');
        setMessageType('success');
        // Reset form
        setRegisterData({
          nome_completo: '', email: '', telefone: '', cpf: '', senha: '',
          cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
        });
      } else {
        setMessage(response.data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Erro no cadastro');
      setMessageType('error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <span className="text-3xl font-bold text-blue-500">MX3</span>
            <span className="text-xl font-medium text-gray-300">NETWORK</span>
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg text-center ${
            messageType === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-200' 
              : 'bg-red-900/50 border border-red-500 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-12">
          {/* Login Form */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Já sou Cliente</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={loginData.senha}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className="bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Criar Nova Conta</h2>
            
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  name="nome_completo"
                  value={registerData.nome_completo}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={registerData.telefone}
                    onChange={handleRegisterChange}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">CPF/CNPJ</label>
                  <input
                    type="text"
                    name="cpf"
                    value={registerData.cpf}
                    onChange={handleRegisterChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">Senha</label>
                  <input
                    type="password"
                    name="senha"
                    value={registerData.senha}
                    onChange={handleRegisterChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Address Toggle */}
              <button
                type="button"
                onClick={() => setShowAddressFields(!showAddressFields)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center"
              >
                Endereço de Entrega (Opcional)
                <svg 
                  className={`ml-2 w-4 h-4 transform transition-transform ${showAddressFields ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Address Fields */}
              {showAddressFields && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={registerData.cep}
                      onChange={handleRegisterChange}
                      placeholder="00000-000"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Rua</label>
                    <input
                      type="text"
                      name="rua"
                      value={registerData.rua}
                      onChange={handleRegisterChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Número</label>
                      <input
                        type="text"
                        name="numero"
                        value={registerData.numero}
                        onChange={handleRegisterChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Bairro</label>
                      <input
                        type="text"
                        name="bairro"
                        value={registerData.bairro}
                        onChange={handleRegisterChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Cidade</label>
                      <input
                        type="text"
                        name="cidade"
                        value={registerData.cidade}
                        onChange={handleRegisterChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Estado</label>
                      <input
                        type="text"
                        name="estado"
                        value={registerData.estado}
                        onChange={handleRegisterChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;