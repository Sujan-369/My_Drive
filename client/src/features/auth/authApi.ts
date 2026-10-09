import { apiClient, API_BASE_URL } from '@/lib/apiClient';


export interface AuthResponse {
  token: string;
  userId: string;
  organizationId: string;
  email: string;
  displayName: string;
  pictureUrl: string | null;
}

export interface CurrentUserResponse {
  userId: string;
  organizationId: string;
  email: string;
  displayName: string;
  pictureUrl: string | null;
}

export const authApi = {
  signInWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(`Sign-in failed: ${response.status}`);
    }

    return response.json();
  },

  clearRecentHistory: () => apiClient.post<void>('/api/auth/me/clear-recent'),

  getMe: () => apiClient.get<CurrentUserResponse>('/api/auth/me'),
};