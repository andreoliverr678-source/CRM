import React, { useState, useMemo } from 'react';
import { Plus, Search, Phone, Clock, MoreVertical, AlertCircle, RefreshCw, UserX } from 'lucide-react';
import useApi from '../hooks/useApi';
import { fetchClients } from '../services/api';

// ------- Skeleton Row -------
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

// ------- Status Badge -------
const StatusBadge = ({ status }) => {
  const map = {
    cliente:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    lead:      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    agendado:  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
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

  // Polling a cada 60 segundos
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

  // Formata data relativa simples
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Clientes</h1>
          <p className="text-dark-500 dark:text-dark-400">
            Gestão de carteira de clientes.{' '}
            {!loading && clients && (
              <span className="font-medium text-dark-700 dark:text-dark-300">{clients.length} cadastrados</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            title="Atualizar lista"
            className="p-2.5 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30">
            <Plus size={20} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm">Erro ao carregar clientes: {error}</span>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50">
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
                          {(client.nome || client.telefone || '?').charAt(0).toUpperCase()}
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
    </div>
  );
};

export default Clients;
