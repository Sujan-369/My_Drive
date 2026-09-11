import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SignInScreen } from './features/auth/SignInScreen';
import { AppShell } from './components/AppShell';
import { Sidebar, type View } from './components/Sidebar';
import type { AuthResponse } from './features/auth/authApi';
import { FileBrowser } from './features/files/FileBrowser';
import { TrashScreen } from './features/trash/TrashScreen';
import { StarredScreen } from './features/starred/StarredScreen';
import { HomeScreen } from  './features/home/HomeScreen';
import { RecentScreen} from './features/recent/RecentScreen';

function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [view, setView] = useState<View>('home');

  const handleSignedIn = (result: AuthResponse) => {
    setAuth(result);
    localStorage.setItem('auth_token', result.token);
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    setAuth(null);
  };

  const renderView = () => {
  if (view === 'home') return <HomeScreen />;
  if (view === 'trash') return <TrashScreen />;
  if (view === 'starred') return <StarredScreen />;
  if (view === 'recent') return <RecentScreen />;
  return <FileBrowser />;
  };

  return (
    <AnimatePresence mode="wait">
      {!auth ? (
        <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <SignInScreen onSignedIn={handleSignedIn} />
        </motion.div>
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <AppShell userName={auth.displayName} userEmail={auth.email} onSignOut={handleSignOut}>
            <div className="flex gap-6">
              <Sidebar activeView={view} onNavigate={setView} />
              <div className="flex-1">{renderView()}</div>
            </div>
          </AppShell>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;