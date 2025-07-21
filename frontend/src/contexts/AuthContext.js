import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mx3_token'));
  const [loading, setLoading] = useState(true);

  // Configura axios com token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verifica se usuário está logado na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`);
          setUser(response.data);
        } catch (error) {
          // Token inválido, remove
          localStorage.removeItem('mx3_token');
          localStorage.removeItem('mx3_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, senha) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, senha });
      
      if (response.data.success) {
        const { user: userData, token: newToken } = response.data;
        
        // Salva no localStorage
        localStorage.setItem('mx3_token', newToken);
        localStorage.setItem('mx3_user', JSON.stringify(userData));
        
        // Atualiza estado
        setToken(newToken);
        setUser(userData);
        
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro no login';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro no cadastro';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('mx3_token');
    localStorage.removeItem('mx3_user');
    localStorage.removeItem('mx3-cart');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};