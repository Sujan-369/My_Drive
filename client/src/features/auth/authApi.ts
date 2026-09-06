const API_BASE_URL = 'http://localhost:5271';

export interface AuthResponse {
  token: string;
  userId: string;
  organizationId: string;
  email: string;
  displayName: string;
}

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(`Sign-in failed: ${response.status}`);
  }

  return response.json();
}