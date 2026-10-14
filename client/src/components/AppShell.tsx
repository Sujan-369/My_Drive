import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';
import { Search, Menu, X } from 'lucide-react';

interface AppShellProps {
  userName: string;
  userEmail: string;
  userPictureUrl: string | null;
  searchValue: string;
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  onToggleMobileMenu: () => void;
  children: ReactNode;
}

export function AppShell({
  userName,
  userEmail,
  userPictureUrl,
  searchValue,
  onSearch,
  onOpenSettings,
  onToggleMobileMenu,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-5 py-2.5 sm:px-6 md:gap-4 md:px-8 md:py-3">
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              onClick={onToggleMobileMenu}
              aria-label="Open navigation menu"
              className="-ml-2 flex size-10 items-center justify-center rounded-md hover:bg-white/5 md:hidden"
            >
              <Menu className="size-5" />
            </button>
            <Logo className="size-8" />
            <span className="hidden font-semibold tracking-tight sm:inline">My Drive</span>
          </div>

          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && onSearch('')}
              placeholder="Search files and folders..."
              aria-label="Search files and folders"
              className="pl-9 pr-9"
            />
            {searchValue && (
              <button
                onClick={() => onSearch('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            aria-label="Account settings"
            className="-mr-1 flex shrink-0 items-center gap-3 rounded-full p-0.5 pr-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:pr-3"
          >
            <div className="hidden text-right text-sm leading-tight sm:block">
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            </div>
            {userPictureUrl ? (
              <img src={userPictureUrl} alt="" className="size-9 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 overflow-hidden px-5 sm:px-6 md:px-8">{children}</div>
    </div>
  );
}