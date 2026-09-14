import { useState } from 'react';
import type { AuthResponse } from '../auth/authApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface SettingsScreenProps {
  auth: AuthResponse;
  onBack: () => void;
}

type Tab = 'profile' | 'security';

export function SettingsScreen({ auth, onBack }: SettingsScreenProps) {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <span className="font-medium">Settings</span>
      </div>

      <div className="mb-4 flex gap-1 border-b">
        <button
          onClick={() => setTab('profile')}
          className={`px-3 py-2 text-sm ${tab === 'profile' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab('security')}
          className={`px-3 py-2 text-sm ${tab === 'security' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground'}`}
        >
          Security
        </button>
      </div>

      {tab === 'profile' && (
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-3">
            {auth.pictureUrl ? (
              <img src={auth.pictureUrl} alt={auth.displayName} className="size-16 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-medium text-primary">
                {auth.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{auth.displayName}</div>
              <div className="text-sm text-muted-foreground">{auth.email}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your name, email, and photo are synced from your Google account and can't be edited here.
          </p>
        </div>
      )}

      {tab === 'security' && (
        <div className="rounded-lg border p-6">
          <h3 className="mb-1 text-sm font-medium">Account security</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            This app uses Google Sign-In — there's no separate password to manage here. Change your password, review devices, or enable two-factor authentication directly through your Google Account.
          </p>
          <Button
            variant="outline"
            render={
              <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">
                Manage your Google Account
                <ExternalLink className="size-4" />
              </a>
            }
          />
        </div>
      )}
    </div>
  );
}