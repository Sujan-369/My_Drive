import { Home, FolderOpen, Users, Clock, Star, Trash2, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useStorageUsage } from '@/features/organization/useOrganization';
import { formatBytes } from '@/lib/formatBytes';

export type View = 'home' | 'my-drive' | 'recent' | 'search' | 'trash' | 'starred' | 'shared';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'my-drive', label: 'My Drive', icon: FolderOpen },
  { view: 'shared', label: 'Shared with me', icon: Users },
  { view: 'recent', label: 'Recent', icon: Clock },
  { view: 'starred', label: 'Starred', icon: Star },
  { view: 'trash', label: 'Trash', icon: Trash2 },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ activeView, onNavigate, isMobileOpen, onMobileClose }: SidebarProps) {
  const { data: usage } = useStorageUsage();
  const used = usage?.totalBytes ?? 0;
  const limit = usage?.limitBytes ?? 0;
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const nearLimit = percent >= 90;
  const handleNavigate = (view: View) => {
    onNavigate(view);
    onMobileClose();
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onMobileClose} aria-hidden="true" />
      )}

      <nav
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 shadow-2xl transition-[transform,visibility] duration-200 md:static md:visible md:z-auto md:w-60 md:translate-x-0 md:bg-transparent md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="mb-5 flex items-center justify-between px-1 md:hidden">
          <div className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-semibold tracking-tight">My Drive</span>
          </div>
          <button
            onClick={onMobileClose}
            aria-label="Close navigation menu"
            className="-mr-1 flex size-10 items-center justify-center rounded-md hover:bg-white/5"
          >
            <X className="size-5" />
          </button>
        </div>

        {navItems.map((item) => {
          const isActive = item.view === activeView;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.view)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors md:py-2 ${
                isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />}
              <item.icon className="size-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        <div className="mt-auto px-1 pt-4">
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <div className="mb-2 text-xs text-muted-foreground">Storage</div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
              aria-label="Storage used"
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${nearLimit ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${used > 0 ? Math.max(percent, 2) : 0}%` }}
              />
            </div>
            <p className={`mt-2 text-xs ${nearLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {usage ? `${formatBytes(used)} of ${formatBytes(limit)} used` : 'Calculating…'}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}