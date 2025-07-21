import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Carrega carrinho do localStorage ou servidor
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user) {
        // Usuário logado - tenta carregar do servidor
        try {
          const response = await axios.get(`${API}/cart/get`);
          if (response.data.success) {
            const serverCart = response.data.data.cart || [];
            setCart(serverCart);
            // Sincroniza com localStorage
            localStorage.setItem('mx3-cart', JSON.stringify(serverCart));
          }
        } catch (error) {
          console.error('Erro ao carregar carrinho do servidor:', error);
          // Fallback para localStorage
          const localCart = JSON.parse(localStorage.getItem('mx3-cart') || '[]');
          setCart(localCart);
        }
      } else {
        // Usuário não logado - usa localStorage
        const localCart = JSON.parse(localStorage.getItem('mx3-cart') || '[]');
        setCart(localCart);
      }
    };

    loadCart();
  }, [isAuthenticated, user]);

  const saveCart = async (newCart) => {
    setCart(newCart);
    localStorage.setItem('mx3-cart', JSON.stringify(newCart));
    
    // Se usuário estiver logado, salva no servidor também
    if (isAuthenticated) {
      try {
        await axios.post(`${API}/cart/save`, newCart);
      } catch (error) {
        console.error('Erro ao salvar carrinho no servidor:', error);
      }
    }
  };

  const addItem = async (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      // Item já existe, aumenta quantidade
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += item.quantity || 1;
      await saveCart(newCart);
    } else {
      // Novo item
      const newCart = [...cart, { ...item, quantity: item.quantity || 1 }];
      await saveCart(newCart);
    }
  };

  const removeItem = async (itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    await saveCart(newCart);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    
    const newCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    await saveCart(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('mx3-cart');
    
    if (isAuthenticated) {
      try {
        await axios.delete(`${API}/cart/clear`);
      } catch (error) {
        console.error('Erro ao limpar carrinho no servidor:', error);
      }
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};