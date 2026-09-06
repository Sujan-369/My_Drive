import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle, type AuthResponse } from './authApi';

interface GoogleSignInButtonProps {
  onSignedIn: (auth: AuthResponse) => void;
}

export function GoogleSignInButton({ onSignedIn }: GoogleSignInButtonProps) {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('Google did not return a credential.');
      return;
    }
    try {
      const auth = await signInWithGoogle(credentialResponse.credential);
      onSignedIn(auth);
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('Google sign-in was unsuccessful.')}
    />
  );
}