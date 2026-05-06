import { useState, useEffect } from 'react';

/**
 * Hook para detectar breakpoints de tela via window.matchMedia.
 * Atualiza reativamente ao redimensionar a janela.
 *
 * @returns {{ isMobile: boolean, isTablet: boolean }}
 */
const useMediaQuery = () => {
  const getValues = () => ({
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    isTablet: window.matchMedia('(max-width: 1023px)').matches,
  });

  const [state, setState] = useState(getValues);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(max-width: 1023px)');

    const handler = () => setState(getValues());

    mobileQuery.addEventListener('change', handler);
    tabletQuery.addEventListener('change', handler);

    return () => {
      mobileQuery.removeEventListener('change', handler);
      tabletQuery.removeEventListener('change', handler);
    };
  }, []);

  return state;
};

export default useMediaQuery;
