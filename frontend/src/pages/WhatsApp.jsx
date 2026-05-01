import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Send, CheckCheck, AlertCircle, RefreshCw, MessageCircleOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useApi from '../hooks/useApi';
import { fetchMessages, sendMessage } from '../services/api';

// ------- Helpers -------
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try { return format(parseISO(dateStr), 'HH:mm', { locale: ptBR }); }
  catch { return ''; }
};

// Agrupa mensagens por telefone para montar a lista de conversas
const groupByPhone = (messages) => {
  const map = new Map();
  messages.forEach((m) => {
    const key = m.telefone || 'desconhecido';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m);
  });
  return Array.from(map.entries()).map(([phone, msgs]) => ({
    phone,
    // nome do cliente (não disponível diretamente — usar telefone como fallback)
    label: phone,
    lastMsg: msgs[msgs.length - 1],
    messages: msgs,
  }));
};

// ------- Loading Skeleton (mensagem) -------
const MsgSkeleton = ({ right = false }) => (
  <div className={`flex ${right ? 'justify-end' : 'justify-start'} animate-pulse`}>
    <div className={`h-10 rounded-2xl bg-dark-200 dark:bg-dark-700 ${right ? 'w-48' : 'w-56'}`} />
  </div>
);

// ------- WhatsApp Page -------
const WhatsApp = () => {
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Polling a cada 10 segundos (conversas em tempo real)
  const { data: messages, loading, error, refetch } = useApi(fetchMessages, { interval: 10_000 });

  // Agrupa por telefone
  const conversations = useMemo(() => {
    if (!messages) return [];
    return groupByPhone(messages);
  }, [messages]);

  // Seleciona a primeira conversa automaticamente
  useEffect(() => {
    if (!selectedPhone && conversations.length > 0) {
      setSelectedPhone(conversations[0].phone);
    }
  }, [conversations, selectedPhone]);

  // Mensagens da conversa selecionada
  const activeConversation = useMemo(
    () => conversations.find((c) => c.phone === selectedPhone),
    [conversations, selectedPhone]
  );

  // Filtro de busca nas conversas
  const filteredConversations = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return conversations.filter((c) => c.phone.includes(q));
  }, [conversations, searchTerm]);

  // Scroll ao fundo quando chegam mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Envia mensagem via webhook
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPhone) return;
    setSending(true);
    try {
      await sendMessage({
        telefone: selectedPhone,
        mensagem: inputText.trim(),
        origem: 'crm',
        tipo: 'ia',
      });
      setInputText('');
      // Atualiza imediatamente após enviar
      refetch();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in flex gap-6">
      {/* ---- Sidebar ---- */}
      <div className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white">WhatsApp</h2>
            <button
              onClick={refetch}
              title="Atualizar"
              className="p-1.5 rounded-lg text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all"
            >
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-dark-50 dark:bg-dark-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 text-dark-900 dark:text-dark-100 placeholder-dark-400"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-3 mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3 border-b border-dark-100 dark:border-dark-800">
                <div className="w-10 h-10 rounded-full bg-dark-200 dark:bg-dark-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-dark-200 dark:bg-dark-700" />
                  <div className="h-3 w-40 rounded bg-dark-200 dark:bg-dark-700" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-dark-400">
              <MessageCircleOff size={24} />
              <span className="text-sm">Nenhuma conversa</span>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.phone === selectedPhone;
              const lastMsg = conv.lastMsg;
              return (
                <div
                  key={conv.phone}
                  onClick={() => setSelectedPhone(conv.phone)}
                  className={`p-4 border-l-4 cursor-pointer transition-colors ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'border-transparent hover:bg-dark-50 dark:hover:bg-dark-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-dark-900 dark:text-white text-sm truncate max-w-[140px]">
                      {conv.label}
                    </h3>
                    <span className="text-[10px] text-dark-400 shrink-0 ml-1">
                      {lastMsg ? formatTime(lastMsg.criado_em) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                    {lastMsg?.mensagem || '—'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ---- Chat Area ---- */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-dark-200 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50 px-6 flex items-center justify-between shrink-0">
          {activeConversation ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                {(activeConversation.phone || '?').charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-dark-900 dark:text-white text-sm">{activeConversation.phone}</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {activeConversation.messages.length} mensagens
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-dark-400">Selecione uma conversa</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <>
              <MsgSkeleton />
              <MsgSkeleton right />
              <MsgSkeleton />
              <MsgSkeleton right />
            </>
          ) : !activeConversation ? (
            <div className="h-full flex items-center justify-center text-dark-400">
              <div className="text-center">
                <MessageCircleOff size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Selecione uma conversa para visualizar as mensagens</p>
              </div>
            </div>
          ) : (
            activeConversation.messages.map((msg) => {
              // tipo 'ia' ou origem 'crm' = mensagem enviada pela barbearia
              const isOut = msg.tipo === 'ia' || msg.origem === 'crm';
              return (
                <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    isOut
                      ? 'bg-emerald-500 text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white rounded-tl-none border border-dark-100 dark:border-dark-700'
                  }`}>
                    <p className="text-sm leading-relaxed break-words">{msg.mensagem}</p>
                    <div className={`text-[10px] flex items-center justify-end mt-1 gap-1 ${isOut ? 'text-emerald-100' : 'text-dark-400'}`}>
                      {formatTime(msg.criado_em)}
                      {isOut && <CheckCheck size={14} className="text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-t border-dark-200 dark:border-dark-800 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedPhone ? 'Digite uma mensagem...' : 'Selecione uma conversa primeiro'}
              disabled={!selectedPhone || sending}
              className="flex-1 bg-dark-50 dark:bg-dark-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500 text-dark-900 dark:text-dark-100 placeholder-dark-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !selectedPhone || sending}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/30"
            >
              {sending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
