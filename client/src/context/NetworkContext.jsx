import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [isLowBandwidth, setIsLowBandwidth] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_low_bandwidth');
      if (saved !== null) return saved === 'true';

      // Auto-detect slow connection or Save-Data header
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = navigator.connection;
        if (conn.saveData) return true;
        if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network connection changes
    let connListener = null;
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = navigator.connection;
      connListener = () => {
        if (localStorage.getItem('placeearly_low_bandwidth') === null) {
          if (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
            setIsLowBandwidth(true);
          }
        }
      };
      conn.addEventListener('change', connListener);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connListener && navigator.connection) {
        navigator.connection.removeEventListener('change', connListener);
      }
    };
  }, []);

  const toggleLowBandwidth = () => {
    setIsLowBandwidth((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('placeearly_low_bandwidth', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <NetworkContext.Provider
      value={{
        isLowBandwidth,
        setIsLowBandwidth,
        toggleLowBandwidth,
        isOnline,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
