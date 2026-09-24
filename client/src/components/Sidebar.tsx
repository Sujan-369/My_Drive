import { Home, FolderOpen, Users, Clock, Star, Trash2 } from 'lucide-react';

export type View = 'home' | 'my-drive' | 'recent' | 'search' | 'trash' | 'starred' | 'shared';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Home;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home, enabled: true },
  { view: 'my-drive', label: 'My Drive', icon: FolderOpen, enabled: true },
  { view: 'shared', label: 'Shared with me', icon: Users, enabled: true },
  { view: 'recent', label: 'Recent', icon: Clock, enabled: true },
  { view: 'starred', label: 'Starred', icon: Star, enabled: true },
  { view: 'trash', label: 'Trash', icon: Trash2, enabled: true },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav className="w-60 shrink-0 border-r border-border bg-sidebar px-3 py-4">
      {navItems.map((item) => {
        const isActive = item.view === activeView;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.view)}
            className={`relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            {isActive && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />}
            <item.icon className="size-4" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}