import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { API_BASE_URL } from './lib/apiClient'

// Warm the API container while the user is still on the sign-in screen.
fetch(`${API_BASE_URL}/api/ping`).catch(() => {});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)