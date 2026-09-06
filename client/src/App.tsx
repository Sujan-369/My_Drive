import { useState } from 'react';
import { GoogleSignInButton } from './features/auth/GoogleSignInButton';
import type { AuthResponse } from './features/auth/authApi';
import { Button } from '@/components/ui/button';

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  const handleSignedIn = (result: AuthResponse) => {
    setAuth(result);
    localStorage.setItem('auth_token', result.token);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My_Drive</h1>
      {auth ? (
        <p>Signed in as {auth.displayName} ({auth.email})</p>
      ) : (
        <GoogleSignInButton onSignedIn={handleSignedIn} />
      )}
    </div>
  );
}

export default App;