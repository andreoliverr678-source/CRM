import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Users, Calendar, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ICONS = {
  novo_cliente: <Users size={16} className="text-blue-500" />,
  novo_agendamento: <Calendar size={16} className="text-emerald-500" />,
  mensagem: <MessageCircle size={16} className="text-purple-500" />,
  followup: <AlertCircle size={16} className="text-amber-500" />
};

const BG_COLORS = {
  novo_cliente: 'bg-blue-50 dark:bg-blue-500/10',
  novo_agendamento: 'bg-emerald-50 dark:bg-emerald-500/10',
  mensagem: 'bg-purple-50 dark:bg-purple-500/10',
  followup: 'bg-amber-50 dark:bg-amber-500/10'
};

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const dropdownRef = useRef(null);

  // Fecha clicando fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white dark:border-dark-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 glass-panel bg-white/95 dark:bg-dark-900/95 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-800 overflow-hidden z-50 animate-fade-in origin-top-right">
          
          {/* Header */}
          <div className="p-4 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
            <h3 className="font-bold text-dark-900 dark:text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCircle2 size={14} /> Marcar todas lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-dark-400 dark:text-dark-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                    className={`w-full text-left p-4 flex gap-3 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors border-b border-dark-100 dark:border-dark-800/50 last:border-0 ${
                      !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    {/* Ícone */}
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${BG_COLORS[notif.type]}`}>
                      {ICONS[notif.type]}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm truncate pr-2 ${notif.read ? 'text-dark-700 dark:text-dark-200' : 'text-dark-900 dark:text-white font-semibold'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <span className="w-2 h-2 shrink-0 bg-primary-500 rounded-full mt-1.5" />}
                      </div>
                      <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-dark-400 dark:text-dark-500 mt-1.5 font-medium">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
