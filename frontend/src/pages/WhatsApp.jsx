import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Phone, MoreVertical, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const WhatsApp = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Optimistic UI update
    const newMessage = {
      id: Date.now(),
      client_name: 'Barbearia',
      text: inputText,
      direction: 'out',
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Here you would integrate with backend / n8n webhook
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in flex gap-6">
      {/* Sidebar - Chat List */}
      <div className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-200 dark:border-dark-800">
          <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">WhatsApp</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar conversa..." 
              className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Active Chat Item */}
          <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-dark-900 dark:text-white">João Silva</h3>
              <span className="text-xs text-dark-400">09:05</span>
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400 truncate">Bom dia João! Temos vaga às...</p>
          </div>
          
          {/* Other Chat Item */}
          <div className="p-4 border-l-4 border-transparent hover:bg-dark-50 dark:hover:bg-dark-800/50 cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-dark-900 dark:text-white">Carlos Santos</h3>
              <span className="text-xs text-dark-400">Ontem</span>
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400 truncate">Confirmado, até lá.</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              J
            </div>
            <div>
              <h2 className="font-bold text-dark-900 dark:text-white">João Silva</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
              <Phone size={20} />
            </button>
            <button className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Chat Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")' }}></div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
          {loading ? (
            <div className="text-center text-dark-500">Carregando mensagens...</div>
          ) : (
            messages.map((msg) => {
              const isOut = msg.direction === 'out';
              return (
                <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    isOut 
                      ? 'bg-emerald-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white rounded-tl-none border border-dark-100 dark:border-dark-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] flex items-center justify-end mt-1 gap-1 ${isOut ? 'text-emerald-100' : 'text-dark-400'}`}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                      {isOut && <CheckCheck size={14} className="text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-dark-200 dark:border-dark-800 z-10">
          <form onSubmit={handleSend} className="flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..." 
              className="flex-1 bg-dark-50 dark:bg-dark-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/30"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
