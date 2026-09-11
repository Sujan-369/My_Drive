import { Home, FolderOpen, Users, Clock, Star, Trash2 } from 'lucide-react';

export type View = 'home' | 'my-drive' | 'recent' |'trash' | 'starred';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Home;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home, enabled: true },
  { view: 'my-drive', label: 'My Drive', icon: FolderOpen, enabled: true },
  { view: 'my-drive' as View, label: 'Shared with me', icon: Users, enabled: false },
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
    <nav className="w-56 shrink-0 border-r border-border bg-sidebar px-3 py-4">
      {navItems.map((item) => {
        const isActive = item.enabled && item.view === activeView;
        return (
          <button
            key={item.label}
            disabled={!item.enabled}
            onClick={() => item.enabled && onNavigate(item.view)}
            className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : item.enabled
                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  : 'cursor-not-allowed text-muted-foreground/40'
            }`}
          >
            <item.icon className="size-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {!item.enabled && <span className="text-[10px] uppercase tracking-wide">Soon</span>}
          </button>
        );
      })}
    </nav>
  );
}