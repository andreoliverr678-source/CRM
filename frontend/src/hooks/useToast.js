import { useState, useEffect, useCallback } from 'react';

// ── Fila global de toasts (singleton) ────────────────────────────────────────
let _listeners = [];
let _nextId = 1;

export function toast(message, type = 'success', duration = 3500) {
  const id = _nextId++;
  const entry = { id, message, type, duration };
  _listeners.forEach((fn) => fn(entry));
  return id;
}

toast.success = (msg, dur) => toast(msg, 'success', dur);
toast.error   = (msg, dur) => toast(msg, 'error',   dur);
toast.info    = (msg, dur) => toast(msg, 'info',     dur);

// ── Hook interno usado pelo ToastContainer ────────────────────────────────────
export function useToastQueue() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (entry) => {
      setToasts((prev) => [...prev, entry]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== entry.id));
      }, entry.duration);
    };
    _listeners.push(handler);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== handler);
    };
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
