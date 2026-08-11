import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { getToken } from '@/lib/auth';

import './index.css';

// Attach the stored JWT (if any) as a Bearer header on every API call.
setAuthTokenGetter(() => getToken());

// Route API calls to a remote server when VITE_API_URL is set (production).
// When unset (local dev), relative /api paths fall through to the Vite proxy.
setBaseUrl(import.meta.env.VITE_API_URL ?? null);

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>,
);
