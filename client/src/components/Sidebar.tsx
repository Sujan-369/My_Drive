import { Home, FolderOpen, Users, Clock, Star, Trash2, X } from 'lucide-react';

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
  const handleNavigate = (view: View) => {
    onNavigate(view);
    onMobileClose();
  };

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onMobileClose} />}

      <nav
        className={`fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r border-border bg-sidebar px-3 py-4 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button onClick={onMobileClose} className="mb-4 flex size-8 items-center justify-center rounded-md hover:bg-white/5 md:hidden">
          <X className="size-4" />
        </button>
        {navItems.map((item) => {
          const isActive = item.view === activeView;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.view)}
              className={`relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />}
              <item.icon className="size-4" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}