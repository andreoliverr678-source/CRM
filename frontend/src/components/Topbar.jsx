import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-dark-200 dark:border-dark-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar clientes, agendamentos..." 
          className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 text-dark-900 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-900"></span>
        </button>

        <div className="h-8 w-px bg-dark-200 dark:bg-dark-700 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold border border-primary-200 dark:border-primary-800">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-dark-900 dark:text-white">Admin</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Barbearia Master</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
