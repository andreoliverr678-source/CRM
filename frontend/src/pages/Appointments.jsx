import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Calendar as CalendarIcon, Clock, User,
  CheckCircle, XCircle, Clock3, AlertCircle, RefreshCw, CalendarX,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useApi from '../hooks/useApi';
import { fetchAppointments } from '../services/api';

// ------- Skeleton Row (desktop) -------
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded bg-dark-200 dark:bg-dark-700" style={{ width: `${[48, 32, 28, 20, 24, 16][i]}%` }} />
      </td>
    ))}
  </tr>
);

// ------- Skeleton Card (mobile) -------
const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl p-4 animate-pulse border-l-4 border-dark-200 dark:border-dark-700">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-dark-200 dark:bg-dark-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-dark-200 dark:bg-dark-700" />
        <div className="h-3 w-24 rounded bg-dark-200 dark:bg-dark-700" />
        <div className="h-3 w-20 rounded bg-dark-200 dark:bg-dark-700" />
      </div>
      <div className="h-5 w-20 rounded-full bg-dark-200 dark:bg-dark-700" />
    </div>
  </div>
);

// ------- Status config -------
const STATUS_MAP = {
  confirmado: { style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Confirmado', icon: <CheckCircle size={13} className="mr-1" />, border: 'border-emerald-500' },
  confirmed:  { style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Confirmado', icon: <CheckCircle size={13} className="mr-1" />, border: 'border-emerald-500' },
  cancelado:  { style: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelado', icon: <XCircle size={13} className="mr-1" />, border: 'border-red-500' },
  cancelled:  { style: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelado', icon: <XCircle size={13} className="mr-1" />, border: 'border-red-500' },
  concluido:  { style: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Concluído', icon: <Clock3 size={13} className="mr-1" />, border: 'border-blue-500' },
  pending:    { style: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-800', label: 'Pendente', icon: <Clock3 size={13} className="mr-1" />, border: 'border-orange-400' },
};

// ------- Status Badge -------
const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || { style: 'bg-dark-100 text-dark-500 border-dark-200', label: status || '—', icon: null };
  return (
    <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ------- Helpers -------
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR }); }
  catch { return dateStr; }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  return timeStr.substring(0, 5);
};

// ------- Appointments Page -------
const Appointments = () => {
  const [search, setSearch] = useState('');

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
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-1">Agendamentos</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 hidden sm:block">
            Gerencie os horários da barbearia.{' '}
            {!loading && appointments && (
              <span className="font-medium text-dark-700 dark:text-dark-300">{appointments.length} no total</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            title="Atualizar"
            className="p-2.5 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all active:scale-90"
          >
            <RefreshCw size={16} />
          </button>
          {/* Botão "Novo" — só desktop */}
          <button className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
            <Plus size={18} />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-xs md:text-sm">Erro ao carregar agendamentos: {error}</span>
        </div>
      )}

      {/* Campo de Busca — sticky no topo em mobile */}
      <div className="sticky top-14 md:top-20 z-20 bg-dark-50/95 dark:bg-dark-950/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none md:py-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente ou serviço..."
            className="w-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
          />
        </div>
      </div>

      {/* ===== MOBILE: Lista de Cards ===== */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 flex flex-col items-center gap-3 text-dark-400">
            <CalendarX size={28} />
            <span className="text-sm text-center px-6">
              {search ? 'Nenhum agendamento encontrado para essa busca.' : 'Nenhum agendamento cadastrado.'}
            </span>
          </div>
        ) : (
          filtered.map((apt) => {
            const statusConfig = STATUS_MAP[apt.status] || {};
            const borderColor = statusConfig.border || 'border-dark-300 dark:border-dark-600';
            return (
              <div
                key={apt.id}
                className={`glass-panel rounded-2xl p-4 flex items-start gap-3 border-l-4 ${borderColor} active:scale-[0.98] transition-transform cursor-pointer`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-500 dark:text-dark-400 shrink-0 mt-0.5">
                  <User size={16} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-900 dark:text-white text-sm truncate">
                    {apt.nome || <span className="text-dark-400 italic">Sem nome</span>}
                  </p>
                  {apt.servico && (
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5 truncate">{apt.servico}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-dark-400">
                      <CalendarIcon size={11} />
                      {formatDate(apt.data)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-dark-400">
                      <Clock size={11} />
                      {formatTime(apt.hora)}
                    </span>
                  </div>
                </div>
                {/* Status */}
                <div className="shrink-0 mt-0.5">
                  <StatusBadge status={apt.status} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== DESKTOP: Tabela ===== */}
      <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
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

      {/* ===== FAB — Novo Agendamento (mobile) ===== */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-500/40 flex items-center justify-center transition-all active:scale-90"
        aria-label="Novo agendamento"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Appointments;
