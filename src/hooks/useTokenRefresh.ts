import { useCallback, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch } from './reduxHooks';
import { setAccessToken, clearAccessToken } from '@/redux/slices/authSlice';

interface UseTokenRefreshOptions {
  /** Refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number;
  /** Time before expiry to trigger refresh in milliseconds (default: 5 minutes) */
  refreshThreshold?: number;
}

/**
 * Hook that manages Auth0 access token refresh.
 * Automatically refreshes the token before it expires and stores it in Redux.
 */
export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const { refreshInterval = 5 * 60 * 1000, refreshThreshold = 5 * 60 * 1000 } = options;

  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout, loginWithRedirect } =
    useAuth0();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const checkAndRefreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current || !isAuthenticated) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      const tokenResponse = await getAccessTokenSilently({
        detailedResponse: true,
      });

      // Calculate the expiration time based on expires_in
      const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiresAt - currentTime;

      if (timeUntilExpiry <= refreshThreshold) {
        // Token is about to expire, force refresh
        console.log('[Auth] Token expiring soon, refreshing...');
        const newToken = await getAccessTokenSilently({ cacheMode: 'off' });
        dispatch(setAccessToken(newToken));
        console.log('[Auth] Token refreshed successfully');
      } else {
        // Token is still valid
        dispatch(setAccessToken(tokenResponse.access_token));
      }
    } catch (error) {
      console.error('[Auth] Error refreshing token:', error);
      // Clear the stored token
      dispatch(clearAccessToken());
      // If token refresh fails, redirect to login
      await logout({ logoutParams: { returnTo: window.location.origin } });
      await loginWithRedirect();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    dispatch,
    logout,
    loginWithRedirect,
    refreshThreshold,
  ]);

  // Initialize auth and set up periodic refresh
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Initial token fetch
      checkAndRefreshToken();

      // Set up periodic refresh
      intervalRef.current = setInterval(checkAndRefreshToken, refreshInterval);
    } else {
      // Clear token if not authenticated
      dispatch(clearAccessToken());
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading, isAuthenticated, checkAndRefreshToken, refreshInterval, dispatch]);

  return {
    refreshToken: checkAndRefreshToken,
    isRefreshing: isRefreshingRef.current,
  };
}

export default useTokenRefresh;
