import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import WhatsApp from './pages/WhatsApp';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="settings" element={<div className="p-8"><h1 className="text-2xl text-dark-900 dark:text-white">Configurações em breve...</h1></div>} />
              </Route>
            </Route>
          </Routes>
        </Router>

        {/* Toast global — disponível em toda a aplicação */}
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
