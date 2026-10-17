export interface GoogleCredentialResponse {
  credential?: string;
}

type CredentialHandler = (response: GoogleCredentialResponse) => void;

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: CredentialHandler;
    auto_select?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
}

interface GoogleWindow {
  google?: { accounts?: { id?: GoogleIdApi } };
  __myDriveGsiClientId?: string;
}

const win = () => window as unknown as GoogleWindow;

let activeHandler: CredentialHandler | null = null;

export function setCredentialHandler(handler: CredentialHandler | null) {
  activeHandler = handler;
}

/**
 * Google warns if initialize() runs more than once per page load, so it only ever runs once per
 * client id. The marker lives on window so it also survives hot reloads and React StrictMode.
 */
export function initializeGoogleIdentity(clientId: string): boolean {
  const api = win().google?.accounts?.id;
  if (!api) return false;

  if (win().__myDriveGsiClientId !== clientId) {
    api.initialize({
      client_id: clientId,
      callback: (response) => activeHandler?.(response),
      auto_select: false,
    });
    win().__myDriveGsiClientId = clientId;
  }
  return true;
}

export function renderGoogleButton(parent: HTMLElement, options: Record<string, string | number>) {
  win().google?.accounts?.id?.renderButton(parent, options);
}