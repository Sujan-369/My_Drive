import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { AuthResponse } from './authApi';
import { HardDrive } from 'lucide-react';

interface SignInScreenProps {
  onSignedIn: (auth: AuthResponse) => void;
}

export function SignInScreen({ onSignedIn }: SignInScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <HardDrive className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">My Drive</CardTitle>
          <CardDescription>Your files, organized and secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton onSignedIn={onSignedIn} />
        </CardContent>
      </Card>
    </div>
  );
}