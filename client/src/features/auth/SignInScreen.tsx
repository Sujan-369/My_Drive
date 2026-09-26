import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { AuthResponse } from './authApi';
import { HardDrive, ShieldCheck, FolderSearch, Users } from 'lucide-react';

interface SignInScreenProps {
  onSignedIn: (auth: AuthResponse) => void;
}

const features = [
  { icon: ShieldCheck, title: 'Secure by design', description: 'Google sign-in and per-organization data isolation.' },
  { icon: FolderSearch, title: 'Organized, your way', description: 'Nested folders keep everything where you expect it.' },
  { icon: Users, title: 'Built for teams', description: 'Every account starts as its own organization.' },
];

export function SignInScreen({ onSignedIn }: SignInScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm">
        <Card className="border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <HardDrive className="size-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">My Drive</CardTitle>
            <CardDescription>Store, organize, and access anywhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleSignInButton onSignedIn={onSignedIn} />
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <feature.icon className="mx-auto mb-2 size-5 text-primary" />
              <div className="text-xs font-medium">{feature.title}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}