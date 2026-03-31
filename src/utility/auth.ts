/**
 * Simple auth utility for accessing Auth0's getAccessTokenSilently outside of React.
 * This is the bridge between Auth0 (React hooks) and RTK Query (non-React).
 */

type GetTokenFn = () => Promise<string>;

let getTokenSilently: GetTokenFn | null = null;

/**
 * Register the getAccessTokenSilently function from Auth0.
 * Called once when the Auth0 hook is available.
 */
export function registerAuth0TokenGetter(getter: GetTokenFn): void {
  getTokenSilently = getter;
}

/**
 * Unregister the token getter (called on unmount).
 */
export function unregisterAuth0TokenGetter(): void {
  getTokenSilently = null;
}

/**
 * Get an access token for API calls.
 * Auth0 handles caching and refresh automatically.
 * Returns null if Auth0 isn't initialized yet.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!getTokenSilently) {
    console.warn('[Auth] Token getter not registered yet');
    return null;
  }

  try {
    return await getTokenSilently();
  } catch (error) {
    console.error('[Auth] Failed to get access token:', error);
    return null;
  }
}

/**
 * Check if auth is ready (token getter is registered).
 */
export function isAuthReady(): boolean {
  return getTokenSilently !== null;
}
