import type { AuthResponse } from '../auth/authApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, LogOut } from 'lucide-react';

interface SettingsScreenProps {
  auth: AuthResponse;
  onBack: () => void;
  onSignOut: () => void;
}

export function SettingsScreen({ auth, onBack, onSignOut }: SettingsScreenProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <span className="font-medium">Settings</span>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Profile</h3>
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

        <div className="rounded-lg border p-6">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Account security</h3>
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

        <div className="rounded-lg border p-6">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Sign out</h3>
          <p className="mb-3 text-sm text-muted-foreground">Sign out of My Drive on this device.</p>
          <Button variant="outline" onClick={onSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}