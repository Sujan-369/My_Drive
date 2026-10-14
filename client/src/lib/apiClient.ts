export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5271';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | null = null;

/** Registered by the app shell so any 401 on an authenticated request signs the user out. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function fallbackMessage(status: number): string {
  switch (status) {
    case 400: return "That request wasn't valid. Please check it and try again.";
    case 401: return 'Your session has expired. Please sign in again.';
    case 403: return "You don't have permission to do that.";
    case 404: return "We couldn't find that. It may have been moved or deleted.";
    case 413: return 'That file is too large to upload.';
    case 415: return "That file type isn't supported.";
    case 429: return 'Too many requests. Please wait a moment and try again.';
    default: return status >= 500 ? 'Something went wrong on our side. Please try again.' : `Request failed (${status}).`;
  }
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await send(path, { ...options, headers });

  if (response.status === 401 && token) onUnauthorized?.();

  if (!response.ok) {
    let message = fallbackMessage(response.status);
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Response wasn't JSON — keep the fallback message.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function requestBlob(path: string): Promise<Blob> {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await send(path, { headers });
  if (response.status === 401 && token) onUnauthorized?.();
  if (!response.ok) {
    throw new ApiError(response.status, fallbackMessage(response.status));
  }
  return response.blob();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  getBlob: (path: string) => requestBlob(path),
};