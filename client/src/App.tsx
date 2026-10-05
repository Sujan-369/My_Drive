import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SignInScreen } from './features/auth/SignInScreen';
import { AppShell } from './components/AppShell';
import { Sidebar, type View } from './components/Sidebar';
import type { AuthResponse } from './features/auth/authApi';
import { authApi } from './features/auth/authApi';
import { FileBrowser } from './features/files/FileBrowser';
import { TrashScreen } from './features/trash/TrashScreen';
import { StarredScreen } from './features/starred/StarredScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { RecentScreen } from './features/recent/RecentScreen';
import { SearchScreen } from './features/search/SearchScreen';
import { SharedWithMeScreen } from './features/sharing/SharedWithMeScreen';
import { PreviewScreen } from './features/preview/PreviewScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';

type AuthState = 'loading' | AuthResponse | null;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function App() {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [view, setView] = useState<View>(() => (sessionStorage.getItem('view') as View) || 'home');
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('searchQuery') || '');
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || isTokenExpired(token)) {
      if (token) localStorage.removeItem('auth_token');
      setAuth(null);
      return;
    }

    authApi.getMe()
      .then((user) => setAuth({ token, userId: user.userId, organizationId: user.organizationId, email: user.email, displayName: user.displayName, pictureUrl: user.pictureUrl }))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setAuth(null);
      });
  }, []);

  useEffect(() => { sessionStorage.setItem('view', view); }, [view]);
  useEffect(() => { sessionStorage.setItem('searchQuery', searchQuery); }, [searchQuery]);

  const handleSignedIn = (result: AuthResponse) => {
    setAuth(result);
    localStorage.setItem('auth_token', result.token);
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    setAuth(null);
  };

  const handleNavigate = (next: View) => {
    setPreviewFileId(null);
    setShowSettings(false);
    setView(next);
  };

  const handleSearch = (query: string) => {
    setPreviewFileId(null);
    setShowSettings(false);
    setSearchQuery(query);
    setView('search');
  };

  const handleOpenSettings = () => {
    setPreviewFileId(null);
    setShowSettings(true);
  };

  const handleOpenPreview = (fileId: string) => {
    setShowSettings(false);
    setPreviewFileId(fileId);
  };

  const renderView = (auth: AuthResponse) => {
    if (view === 'search') return <SearchScreen query={searchQuery} onOpenPreview={handleOpenPreview} />;
    if (view === 'home') return <HomeScreen auth={auth} onOpenPreview={handleOpenPreview} />;
    if (view === 'trash') return <TrashScreen />;
    if (view === 'starred') return <StarredScreen />;
    if (view === 'recent') return <RecentScreen onOpenPreview={handleOpenPreview} />;
    if (view === 'shared') return <SharedWithMeScreen />;
    return <FileBrowser onOpenPreview={handleOpenPreview} />;
  };

  if (auth === 'loading') {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AnimatePresence mode="wait">
      {!auth ? (
        <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <SignInScreen onSignedIn={handleSignedIn} />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <AppShell
              userName={auth.displayName}
              userEmail={auth.email}
              userPictureUrl={auth.pictureUrl}
              searchValue={searchQuery}
              onSearch={handleSearch}
              onOpenSettings={handleOpenSettings}
              onToggleMobileMenu={() => setIsMobileMenuOpen((o) => !o)}
            >
              <div className="flex flex-1 gap-6 overflow-hidden">
                <Sidebar activeView={view} onNavigate={handleNavigate} isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
                <div className="min-w-0 flex-1 overflow-y-auto py-6 md:py-8">
                  {showSettings ? (
                    <SettingsScreen auth={auth} onBack={() => setShowSettings(false)} onSignOut={handleSignOut} />
                  ) : previewFileId ? (
                    <PreviewScreen fileId={previewFileId} onBack={() => setPreviewFileId(null)} />
                  ) : (
                    renderView(auth)
                  )}
                </div>
              </div>
            </AppShell>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;