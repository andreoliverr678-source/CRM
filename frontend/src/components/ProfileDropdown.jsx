import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Building, Mail, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ProfileDropdown = () => {
  const { user, logout, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Estados modal edição
  const [name, setName] = useState(user?.name || '');
  const [barbershopName, setBarbershopName] = useState(user?.barbershop_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Sincroniza estado quando user carrega
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBarbershopName(user.barbershop_name || '');
    }
  }, [user]);

  // Fecha dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openModal = () => {
    setIsOpen(false);
    setMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      // 1. Atualiza dados
      await api.put('/profile', { name, barbershop_name: barbershopName });
      updateUser({ name, barbershop_name: barbershopName });
      
      // 2. Tenta trocar senha se preenchido
      if (currentPassword && newPassword) {
        await api.put('/profile/password', { currentPassword, newPassword });
        setCurrentPassword('');
        setNewPassword('');
      }
      
      setMessage('Perfil salvo com sucesso!');
      setTimeout(() => setIsModalOpen(false), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger (Avatar) */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 cursor-pointer rounded-full md:rounded-xl p-1 md:pr-4 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold border border-primary-200 dark:border-primary-800 text-sm overflow-hidden shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-dark-900 dark:text-white leading-tight">
              {user.name.split(' ')[0]}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400 truncate max-w-[120px]">
              {user.barbershop_name || 'Admin'}
            </p>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 glass-panel bg-white/95 dark:bg-dark-900/95 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-800 overflow-hidden z-50 animate-fade-in origin-top-right">
            
            <div className="p-4 border-b border-dark-100 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-800/50">
              <p className="font-bold text-dark-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{user.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={openModal}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
              >
                <Settings size={16} /> Configurações da Conta
              </button>
            </div>
            
            <div className="p-2 border-t border-dark-100 dark:border-dark-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
              >
                <LogOut size={16} /> Sair do sistema
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Edição Perfil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-6">Configurações</h2>
              
              <div className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-xl text-sm ${message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {message}
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-dark-500 dark:text-dark-400 mb-1.5"><User size={14}/> Nome</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-dark-500 dark:text-dark-400 mb-1.5"><Building size={14}/> Barbearia</label>
                  <input type="text" value={barbershopName} onChange={e => setBarbershopName(e.target.value)} className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>

                <div className="pt-4 border-t border-dark-100 dark:border-dark-800">
                  <label className="flex items-center gap-2 text-xs font-medium text-dark-500 dark:text-dark-400 mb-3"><ShieldCheck size={14}/> Trocar Senha (opcional)</label>
                  <div className="space-y-3">
                    <input type="password" placeholder="Senha atual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                    <input type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors flex justify-center items-center">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;
