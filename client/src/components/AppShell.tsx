import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HardDrive, LogOut, Search } from 'lucide-react';

interface AppShellProps {
  userName: string;
  userEmail: string;
  onSignOut: () => void;
  onSearch: (query: string) => void;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, onSignOut, onSearch, children }: AppShellProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
              <HardDrive className="size-4 text-primary" />
            </div>
            <span className="font-semibold">My Drive</span>
          </div>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files and folders..."
              className="pl-9"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
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