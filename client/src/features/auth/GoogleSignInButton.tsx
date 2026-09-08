import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle, type AuthResponse } from './authApi';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSignedIn: (auth: AuthResponse) => void;
}

export function GoogleSignInButton({ onSignedIn }: GoogleSignInButtonProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('Google did not return a credential.');
      return;
    }
    setIsSigningIn(true);
    try {
      const auth = await signInWithGoogle(credentialResponse.credential);
      onSignedIn(auth);
    } catch (err) {
      console.error('Sign-in failed:', err);
      setIsSigningIn(false);
    }
  };

  if (isSigningIn) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Signing you in...
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('Google sign-in was unsuccessful.')}
    />
  );
}