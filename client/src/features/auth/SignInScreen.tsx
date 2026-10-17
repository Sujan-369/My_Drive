import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AmbientBackground } from '@/components/AmbientBackground';
import { Logo } from '@/components/Logo';
import { GoogleSignInButton } from './GoogleSignInButton';
import type { AuthResponse } from './authApi';
import { ShieldCheck, FolderSearch, Users } from 'lucide-react';

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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-10">
      <AmbientBackground />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <Card className="border-border bg-card">
          {/* CardHeader is a grid, so centering needs justify-items, not just items. */}
          <CardHeader className="items-center justify-items-center text-center">
            <Logo className="mb-3 size-14 drop-shadow-[0_8px_24px_rgba(244,63,94,0.35)]" />
            <CardTitle className="text-2xl">My Drive</CardTitle>
            <CardDescription>Store, organize, and access anywhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleSignInButton onSignedIn={onSignedIn} />
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3 sm:block sm:text-center">
              <feature.icon className="size-5 shrink-0 text-primary sm:mx-auto sm:mb-2" />
              <div>
                <div className="text-xs font-medium">{feature.title}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}