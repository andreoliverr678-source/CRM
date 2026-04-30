import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    pending: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  
  const labels = {
    confirmed: "Confirmado",
    pending: "Pendente",
    cancelled: "Cancelado"
  };

  const icons = {
    confirmed: <CheckCircle size={14} className="mr-1.5" />,
    pending: <Clock3 size={14} className="mr-1.5" />,
    cancelled: <XCircle size={14} className="mr-1.5" />
  };

  return (
    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${API_URL}/appointments`);
        setAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Agendamentos</h1>
          <p className="text-dark-500 dark:text-dark-400">Gerencie os horários da barbearia.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex justify-between items-center bg-white/50 dark:bg-dark-900/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
          <div className="text-sm text-dark-500 dark:text-dark-400 font-medium">
            {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-50/50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 text-sm border-b border-dark-200 dark:border-dark-800">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Serviço</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Horário</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-dark-500">Carregando...</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-500 dark:text-dark-400">
                        <User size={18} />
                      </div>
                      <span className="font-medium text-dark-900 dark:text-white">{apt.client_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-600 dark:text-dark-300">{apt.service}</td>
                  <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-dark-400" />
                      {apt.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-dark-400" />
                      {apt.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Editar
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

export default Appointments;
