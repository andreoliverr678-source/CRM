import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, Clock3, AlertCircle, RefreshCw, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useApi from '../hooks/useApi';
import { fetchAppointments } from '../services/api';

// ------- Skeleton Row -------
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded bg-dark-200 dark:bg-dark-700" style={{ width: `${[48, 32, 28, 20, 24, 16][i]}%` }} />
      </td>
    ))}
  </tr>
);

// ------- Status Badge -------
const StatusBadge = ({ status }) => {
  // Mapeia os status do Supabase (pt) e inglês (legacy)
  const map = {
    confirmado: { style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Confirmado', icon: <CheckCircle size={14} className="mr-1.5" /> },
    confirmed:  { style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Confirmado', icon: <CheckCircle size={14} className="mr-1.5" /> },
    cancelado:  { style: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelado', icon: <XCircle size={14} className="mr-1.5" /> },
    cancelled:  { style: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelado', icon: <XCircle size={14} className="mr-1.5" /> },
    concluido:  { style: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Concluído', icon: <Clock3 size={14} className="mr-1.5" /> },
    pending:    { style: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'Pendente', icon: <Clock3 size={14} className="mr-1.5" /> },
  };

  const config = map[status] || { style: 'bg-dark-100 text-dark-500 border-dark-200', label: status || '—', icon: null };
  return (
    <span className={`flex items-center w-fit px-3 py-1 rounded-full text-xs font-medium border ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ------- Format helpers -------
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR }); }
  catch { return dateStr; }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  // time pode vir como "14:00:00" — pegar só HH:mm
  return timeStr.substring(0, 5);
};

// ------- Appointments Page -------
const Appointments = () => {
  const [search, setSearch] = useState('');

  // Polling a cada 30 segundos (agenda muda com frequência)
  const { data: appointments, loading, error, refetch } = useApi(fetchAppointments, { interval: 30_000 });

  const filtered = useMemo(() => {
    if (!appointments) return [];
    const q = search.toLowerCase();
    return appointments.filter(
      (a) =>
        (a.nome || '').toLowerCase().includes(q) ||
        (a.telefone || '').includes(q) ||
        (a.servico || '').toLowerCase().includes(q)
    );
  }, [appointments, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Agendamentos</h1>
          <p className="text-dark-500 dark:text-dark-400">
            Gerencie os horários da barbearia.{' '}
            {!loading && appointments && (
              <span className="font-medium text-dark-700 dark:text-dark-300">{appointments.length} no total</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} title="Atualizar" className="p-2.5 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all">
            <RefreshCw size={18} />
          </button>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
            <Plus size={20} />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm">Erro ao carregar agendamentos: {error}</span>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-dark-900/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente ou serviço..."
              className="w-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
          <div className="text-sm text-dark-500 dark:text-dark-400 font-medium shrink-0">
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
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-dark-400">
                      <CalendarX size={32} />
                      <span className="text-sm">
                        {search ? 'Nenhum agendamento encontrado para essa busca.' : 'Nenhum agendamento cadastrado.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-500 dark:text-dark-400 shrink-0">
                          <User size={18} />
                        </div>
                        <div>
                          <span className="font-medium text-dark-900 dark:text-white block">
                            {apt.nome || <span className="text-dark-400 italic">Sem nome</span>}
                          </span>
                          {apt.telefone && (
                            <span className="text-xs text-dark-400">{apt.telefone}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600 dark:text-dark-300">{apt.servico || '—'}</td>
                    <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-dark-400" />
                        {formatDate(apt.data)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-dark-400" />
                        {formatTime(apt.hora)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
