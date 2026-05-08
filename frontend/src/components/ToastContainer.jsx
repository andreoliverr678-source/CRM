import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastQueue } from '../hooks/useToast';

const ICONS = {
  success: <CheckCircle size={18} className="shrink-0 text-white" />,
  error:   <XCircle    size={18} className="shrink-0 text-white" />,
  info:    <Info       size={18} className="shrink-0 text-white" />,
};

const BG = {
  success: 'bg-emerald-600 shadow-emerald-500/30',
  error:   'bg-red-600    shadow-red-500/30',
  info:    'bg-blue-600   shadow-blue-500/30',
};

/**
 * Renderiza a fila de toasts globais no final do <body>.
 * Basta montar este componente UMA VEZ no App.jsx.
 *
 * Para disparar toasts de qualquer lugar:
 *   import { toast } from '../hooks/useToast';
 *   toast.success('Salvo!');
 *   toast.error('Erro ao salvar.');
 */
const ToastContainer = () => {
  const { toasts, dismiss } = useToastQueue();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[99999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl
            text-white animate-fade-in min-w-[220px] max-w-[340px] ${BG[t.type] || BG.info}
          `}
        >
          {ICONS[t.type] || ICONS.info}
          <span className="text-sm font-semibold flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-70 hover:opacity-100 transition-opacity ml-1 shrink-0"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
