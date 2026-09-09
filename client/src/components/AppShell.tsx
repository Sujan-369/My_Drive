import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { HardDrive, LogOut } from 'lucide-react';

interface AppShellProps {
  userName: string;
  userEmail: string;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, onSignOut, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
              <HardDrive className="size-4 text-primary" />
            </div>
            <span className="font-semibold">My Drive</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}