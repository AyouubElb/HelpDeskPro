import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        duration={5000}
        toastOptions={{ unstyled: true, classNames: { toast: 'toast', error: 'toast-error' } }}
        icons={{
          success: <span className="stamp text-green">Fait</span>,
          error: <span className="stamp text-red">Erreur</span>,
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
