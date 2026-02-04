/**
 * Auth utility module for accessing Auth0 token refresh outside of React components.
 * This is necessary for RTK Query's baseQuery to handle 401 errors.
 */

type TokenGetter = () => Promise<string>;

let tokenGetter: TokenGetter | null = null;

/**
 * Register the token getter function from AuthProvider.
 * This should be called once when AuthProvider mounts.
 */
export function registerTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

/**
 * Unregister the token getter (called on AuthProvider unmount).
 */
export function unregisterTokenGetter(): void {
  tokenGetter = null;
}

/**
 * Get a fresh access token from Auth0.
 * Returns null if no token getter is registered or if token fetch fails.
 */
export async function getFreshToken(): Promise<string | null> {
  if (!tokenGetter) {
    console.warn('[Auth] Token getter not registered');
    return null;
  }

  try {
    return await tokenGetter();
  } catch (error) {
    console.error('[Auth] Failed to get fresh token:', error);
    return null;
  }
}

/**
 * Check if the auth system is ready (token getter is registered).
 */
export function isAuthReady(): boolean {
  return tokenGetter !== null;
}
