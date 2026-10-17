import { useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleOAuth } from '@react-oauth/google';
import { authApi, type AuthResponse } from './authApi';
import {
  initializeGoogleIdentity,
  renderGoogleButton,
  setCredentialHandler,
  type GoogleCredentialResponse,
} from './googleIdentity';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSignedIn: (auth: AuthResponse) => void;
}

// Google's button accepts 200 to 400 px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export function GoogleSignInButton({ onSignedIn }: GoogleSignInButtonProps) {
  // The provider in main.tsx loads Google's script; we only read its state here.
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google didn't return a credential. Please try again.");
        return;
      }
      setError(null);
      setIsSigningIn(true);
      try {
        onSignedIn(await authApi.signInWithGoogle(response.credential));
      } catch (err) {
        console.error('Sign-in failed:', err);
        setError(
          err instanceof TypeError
            ? "Can't reach the server. Check your connection and try again."
            : "Couldn't sign you in. Please try again."
        );
        setIsSigningIn(false);
      }
    },
    [onSignedIn]
  );

  useEffect(() => {
    setCredentialHandler(handleCredential);
    return () => setCredentialHandler(null);
  }, [handleCredential]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || !scriptLoadedSuccessfully || !initializeGoogleIdentity(clientId)) return;

    let lastWidth = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const render = () => {
      const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(el.getBoundingClientRect().width)));
      if (width === lastWidth) return;
      lastWidth = width;
      renderGoogleButton(el, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width,
      });
      setIsReady(true);
    };

    render();
    // Re-render only when the width really changes (rotation, window resize), and only once it settles.
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [clientId, scriptLoadedSuccessfully]);

  return (
    <div className="w-full">
      <div className="relative h-10">
        {!isReady && <div className="absolute inset-0 animate-pulse rounded bg-white/5" aria-hidden="true" />}
        <div
          ref={buttonRef}
          className={`h-10 w-full overflow-hidden rounded ${
            isReady ? 'shadow-[0_10px_28px_-12px_rgba(244,63,94,0.5)] ring-1 ring-white/15' : ''
          } ${isSigningIn ? 'invisible' : ''}`}
        />
        {isSigningIn && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center gap-2 rounded border border-primary/30 bg-primary/10 text-sm"
          >
            <Loader2 className="size-4 animate-spin text-primary" />
            Signing you in...
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}