const TOKEN_KEY = "axiom.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures (e.g. private mode) — auth just won't persist.
  }
}

export function apiErrorText(err: unknown, fallback: string): string {
  const data = (err as { data?: { error?: string } | string }).data;
  if (typeof data === 'string') return data || fallback;
  if (data && typeof data.error === 'string' && data.error) return data.error;
  return fallback;
}
