import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { HardDrive, Search } from 'lucide-react';

interface AppShellProps {
  userName: string;
  userEmail: string;
  userPictureUrl: string | null;
  searchValue: string;
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  children: ReactNode;
}

export function AppShell({ userName, userEmail, userPictureUrl, searchValue, onSearch, onOpenSettings, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-8 py-3">
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
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search files and folders..."
              className="pl-9"
            />
          </div>
          <button
            onClick={onOpenSettings}
            aria-label="Account settings"
            className="flex shrink-0 items-center gap-3 rounded-full p-0.5 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="text-right text-sm leading-tight">
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            </div>
            {userPictureUrl ? (
              <img src={userPictureUrl} alt={userName} className="size-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-8 py-8">{children}</main>
    </div>
  );
}