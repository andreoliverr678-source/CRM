import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, MessageCircle, Settings, LogOut, Scissors } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/clients' },
    { name: 'Agendamentos', icon: <Calendar size={20} />, path: '/appointments' },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, path: '/whatsapp' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 flex flex-col transition-colors duration-200">
      <div className="h-20 flex items-center px-8 border-b border-dark-200 dark:border-dark-800">
        <div className="flex items-center gap-3 text-primary-600 dark:text-primary-500">
          <Scissors size={28} />
          <h1 className="text-xl font-bold text-dark-900 dark:text-white tracking-wider">BARBER<span className="text-primary-500">CRM</span></h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' 
                  : 'text-dark-500 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-800/50 hover:text-dark-900 dark:hover:text-dark-100'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-dark-200 dark:border-dark-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-dark-500 dark:text-dark-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors duration-200">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
