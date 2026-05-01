import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook genérico para buscar dados de uma função assíncrona,
 * com suporte a polling, loading state, erro e refetch manual.
 *
 * @param {Function} fetchFn  - Função async que retorna os dados
 * @param {Object}   options
 * @param {number}   options.interval - Intervalo de polling em ms (0 = sem polling)
 * @param {Array}    options.deps     - Dependências extras para re-disparar o fetch
 */
const useApi = (fetchFn, { interval = 0, deps = [] } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const run = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current)
        setError(err.response?.data?.error || err.message || 'Erro desconhecido');
    } finally {
      if (mountedRef.current && !isBackground) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, ...deps]);

  useEffect(() => {
    mountedRef.current = true;
    run();

    if (interval > 0) {
      timerRef.current = setInterval(() => run(true), interval);
    }

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
    };
  }, [run, interval]);

  return { data, loading, error, refetch: () => run() };
};

export default useApi;
