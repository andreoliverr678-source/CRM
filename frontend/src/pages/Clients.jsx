import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, Phone, Clock, MoreVertical, AlertCircle, RefreshCw, UserX, ChevronRight, Edit2, Trash2, Eye, Calendar, MessageCircle, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { fetchClients, createClient, updateClient, deleteClient } from '../services/api';

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

// ------- Action Dropdown -------
const ActionDropdown = ({ client, onEdit, onDelete, onView }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onView(client); }} className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 flex items-center gap-2">
            <Eye size={14} /> Visualizar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(client); }} className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 flex items-center gap-2">
            <Edit2 size={14} /> Editar
          </button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); window.open(`https://wa.me/${client.phone?.replace(/\D/g, '')}`, '_blank'); }} className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 flex items-center gap-2">
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); navigate('/appointments'); }} className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 flex items-center gap-2">
            <Calendar size={14} /> Criar Agendamento
          </button>
          <div className="h-px bg-dark-200 dark:bg-dark-700 my-1"></div>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(client); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2">
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
};

// ------- Clients Page -------
const Clients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: clients, loading, error, refetch } = useApi(fetchClients, { interval: 60_000 });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', phone: '', status: 'lead', notes: '' });

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = debouncedSearch.toLowerCase();
    return clients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
    );
  }, [clients, debouncedSearch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getInitial = (client) =>
    (client.name || client.phone || '?').charAt(0).toUpperCase();

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name || '', phone: client.phone || '', status: client.status || 'lead', notes: client.notes || '' });
    } else {
      setEditingClient(null);
      setFormData({ name: '', phone: '', status: 'lead', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        showToast('Cliente atualizado com sucesso');
      } else {
        await createClient(formData);
        showToast('Cliente criado com sucesso');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar cliente', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    setIsSubmitting(true);
    try {
      await deleteClient(deletingClient.id);
      showToast('Cliente excluído com sucesso');
      setIsDeleteModalOpen(false);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao excluir cliente', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {/* Botão "Novo" — só desktop */}
          <button 
            onClick={() => handleOpenModal()} 
            className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/30"
          >
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
              onClick={() => { setViewingClient(client); setIsViewModalOpen(true); }}
              className="glass-panel rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 shrink-0">
                {getInitial(client)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark-900 dark:text-white text-sm truncate">
                  {client.name || <span className="text-dark-400 italic">Sem nome</span>}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={12} className="text-dark-400 shrink-0" />
                  <span className="text-xs text-dark-500 dark:text-dark-400 truncate">{client.phone || '—'}</span>
                </div>
              </div>
              {/* Status + Dropdown */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={client.status} />
                <ActionDropdown 
                  client={client} 
                  onEdit={() => handleOpenModal(client)} 
                  onDelete={() => { setDeletingClient(client); setIsDeleteModalOpen(true); }} 
                  onView={() => { setViewingClient(client); setIsViewModalOpen(true); }} 
                />
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
                <th className="px-6 py-4 font-medium">Cadastrado em</th>
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
                    <td className="px-6 py-4 cursor-pointer" onClick={() => { setViewingClient(client); setIsViewModalOpen(true); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 shrink-0">
                          {getInitial(client)}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-white">
                          {client.name || <span className="text-dark-400 italic">Sem nome</span>}
                        </span>
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
                        <Clock size={16} className="text-dark-400" />
                        {formatDate(client.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <ActionDropdown 
                          client={client} 
                          onEdit={() => handleOpenModal(client)} 
                          onDelete={() => { setDeletingClient(client); setIsDeleteModalOpen(true); }} 
                          onView={() => { setViewingClient(client); setIsViewModalOpen(true); }} 
                        />
                      </div>
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
        onClick={() => handleOpenModal()}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-500/40 flex items-center justify-center transition-all active:scale-90"
        aria-label="Novo cliente"
      >
        <Plus size={24} />
      </button>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white animate-fade-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-800">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Nome do cliente"
                  className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Telefone *</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="(00) 00000-0000"
                  className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white"
                >
                  <option value="lead">Lead</option>
                  <option value="cliente">Cliente</option>
                  <option value="agendado">Agendado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Observações</label>
                <textarea 
                  rows="3"
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  placeholder="Detalhes adicionais..."
                  className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-white resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar */}
      {isViewModalOpen && viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-800">
              <h2 className="text-lg font-bold text-dark-900 dark:text-white">Detalhes do Cliente</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {getInitial(viewingClient)}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{viewingClient.name || 'Sem nome'}</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">{viewingClient.phone}</p>
                <div className="mt-2"><StatusBadge status={viewingClient.status} /></div>
              </div>
              
              <div className="w-full mt-4 space-y-3 text-sm">
                <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3">
                  <p className="text-dark-500 dark:text-dark-400 text-xs font-medium uppercase mb-1">Cadastrado em</p>
                  <p className="text-dark-900 dark:text-white">{formatDate(viewingClient.created_at)}</p>
                </div>
                {viewingClient.notes && (
                  <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3">
                    <p className="text-dark-500 dark:text-dark-400 text-xs font-medium uppercase mb-1">Observações</p>
                    <p className="text-dark-900 dark:text-white whitespace-pre-wrap">{viewingClient.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-dark-50 dark:bg-dark-800/50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-dark-200 dark:bg-dark-700 text-dark-900 dark:text-white rounded-xl text-sm font-medium hover:bg-dark-300 dark:hover:bg-dark-600 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {isDeleteModalOpen && deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">Excluir Cliente?</h3>
            <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
              Tem certeza que deseja excluir <strong>{deletingClient.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white font-medium rounded-xl hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
