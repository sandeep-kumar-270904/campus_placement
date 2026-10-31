import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';
import { I18nProvider } from './context/I18nContext';
import { ToastProvider } from './context/ToastContext';
import { registerServiceWorker } from './services/pwaService';

// Initialize PWA service worker and offline shell
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <NetworkProvider>
          <I18nProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </I18nProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
