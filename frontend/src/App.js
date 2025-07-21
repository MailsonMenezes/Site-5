import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Account from './pages/Account';

// Styles
import './App.css';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/carrinho" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              
              <Route path="/finalizar-compra" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/confirmacao" element={
                <ProtectedRoute>
                  <Confirmation />
                </ProtectedRoute>
              } />
              
              <Route path="/minha-conta" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;