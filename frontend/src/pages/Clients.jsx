import React, { useState, useMemo } from 'react';
import { Plus, Search, Phone, Clock, MoreVertical, AlertCircle, RefreshCw, UserX, ChevronRight } from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchClients } from '../services/api';

// ------- Skeleton Row (desktop) -------
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-dark-200 dark:bg-dark-700" />
        <div className="h-4 w-32 rounded bg-dark-200 dark:bg-dark-700" />
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-4 w-36 rounded bg-dark-200 dark:bg-dark-700" /></td>
    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-dark-200 dark:bg-dark-700" /></td>
    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-dark-200 dark:bg-dark-700 ml-auto" /></td>
  </tr>
);

// ------- Skeleton Card (mobile) -------
const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-11 h-11 rounded-full bg-dark-200 dark:bg-dark-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-28 rounded bg-dark-200 dark:bg-dark-700" />
      <div className="h-3 w-24 rounded bg-dark-200 dark:bg-dark-700" />
    </div>
    <div className="h-5 w-16 rounded-full bg-dark-200 dark:bg-dark-700" />
  </div>
);

// ------- Status Badge -------
const StatusBadge = ({ status }) => {
  const map = {
    cliente:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    lead:     'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    agendado: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  };
  const label = { cliente: 'Cliente', lead: 'Lead', agendado: 'Agendado' };
  if (!status) return null;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-dark-100 text-dark-500'}`}>
      {label[status] || status}
    </span>
  );
};

// ------- Clients Page -------
const Clients = () => {
  const [search, setSearch] = useState('');

  const { data: clients, loading, error, refetch } = useApi(fetchClients, { interval: 60_000 });

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.telefone || '').includes(q)
    );
  }, [clients, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitial = (client) =>
    (client.nome || client.telefone || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-1">Clientes</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 hidden sm:block">
            Gestão de carteira.{' '}
            {!loading && clients && (
              <span className="font-medium text-dark-700 dark:text-dark-300">{clients.length} cadastrados</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            title="Atualizar lista"
            className="p-2.5 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all active:scale-90"
          >
            <RefreshCw size={16} />
          </button>
          {/* Botão "Novo" — só desktop */}
          <button className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
            <Plus size={18} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-xs md:text-sm">Erro ao carregar clientes: {error}</span>
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
            placeholder="Buscar por nome ou telefone..."
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
            <UserX size={28} />
            <span className="text-sm text-center px-6">
              {search ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}
            </span>
          </div>
        ) : (
          filtered.map((client) => (
            <div
              key={client.id}
              className="glass-panel rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 shrink-0">
                {getInitial(client)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark-900 dark:text-white text-sm truncate">
                  {client.nome || <span className="text-dark-400 italic">Sem nome</span>}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={12} className="text-dark-400 shrink-0" />
                  <span className="text-xs text-dark-500 dark:text-dark-400 truncate">{client.telefone || '—'}</span>
                </div>
              </div>
              {/* Status + seta */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={client.status} />
                <ChevronRight size={14} className="text-dark-300 dark:text-dark-600" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== DESKTOP: Tabela ===== */}
      <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
        {/* Search toolbar desktop */}
        <div className="p-6 border-b border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
          {!loading && clients && (
            <span className="text-sm text-dark-500 dark:text-dark-400 shrink-0">{clients.length} clientes</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-50/50 dark:bg-dark-800/50 text-dark-500 dark:text-dark-400 text-sm border-b border-dark-200 dark:border-dark-800">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Telefone</th>
                <th className="px-6 py-4 font-medium">Última Interação</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200 dark:divide-dark-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-dark-400">
                      <UserX size={32} />
                      <span className="text-sm">
                        {search ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 shrink-0">
                          {getInitial(client)}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-white">
                          {client.nome || <span className="text-dark-400 italic">Sem nome</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-dark-400" />
                        {client.telefone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-dark-400" />
                        {formatDate(client.ultima_interacao || client.criado_em)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FAB — Novo Cliente (mobile) ===== */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-500/40 flex items-center justify-center transition-all active:scale-90"
        aria-label="Novo cliente"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Clients;
