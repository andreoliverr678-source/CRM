import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, User, Phone, Calendar, MoreVertical } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${API_URL}/clients`);
        setClients(res.data);
      } catch (error) {
        console.error('Error fetching clients', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Clientes</h1>
          <p className="text-dark-500 dark:text-dark-400">Gestão de carteira de clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              className="w-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-50/50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 text-sm border-b border-dark-200 dark:border-dark-800">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Telefone</th>
                <th className="px-6 py-4 font-medium">Última Visita</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-dark-500">Carregando...</td></tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
                        {client.name.charAt(0)}
                      </div>
                      <span className="font-medium text-dark-900 dark:text-white">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-dark-400" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-dark-400" />
                      {client.last_visit}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
