import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import WhatsApp from './pages/WhatsApp';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="whatsapp" element={<WhatsApp />} />
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl text-dark-900 dark:text-white">Configurações em breve...</h1></div>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
