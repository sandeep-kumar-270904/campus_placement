import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_theme');
      return saved || 'dark'; // Dark theme default as requested
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme) => {
      const isDark =
        targetTheme === 'dark' || (targetTheme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', '#020617');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', '#10b981');
      }
    };

    applyTheme(theme);
    try {
      localStorage.setItem('placeearly_theme', theme);
    } catch {}

    const handleSystemChange = () => {
      if (theme === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
