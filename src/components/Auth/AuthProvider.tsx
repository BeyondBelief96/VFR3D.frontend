import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setAccessToken, clearAccessToken, selectAccessToken } from '@/redux/slices/authSlice';

interface AuthContextValue {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is being loaded */
  isLoading: boolean;
  /** The current access token (from Redux) */
  accessToken: string | null;
  /** The authenticated user object */
  user: ReturnType<typeof useAuth0>['user'];
  /** Login function */
  login: () => Promise<void>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Get a fresh access token */
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication context to the application.
 * Wraps Auth0 functionality and syncs tokens to Redux.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const storedToken = useAppSelector(selectAccessToken);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Initialize token on mount when authenticated
  useEffect(() => {
    const initializeToken = async () => {
      if (!auth0IsLoading && auth0IsAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          dispatch(setAccessToken(token));
        } catch (error) {
          console.error('[AuthProvider] Error getting initial token:', error);
          dispatch(clearAccessToken());
        }
      } else if (!auth0IsLoading && !auth0IsAuthenticated) {
        dispatch(clearAccessToken());
      }
      setIsInitialized(true);
    };

    initializeToken();
  }, [auth0IsLoading, auth0IsAuthenticated, getAccessTokenSilently, dispatch]);

  const login = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  const logout = async () => {
    dispatch(clearAccessToken());
    await auth0Logout({
      logoutParams: {
        returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URI,
      },
    });
  };

  const getToken = async (): Promise<string> => {
    try {
      const token = await getAccessTokenSilently();
      dispatch(setAccessToken(token));
      return token;
    } catch (error) {
      console.error('[AuthProvider] Error getting token:', error);
      dispatch(clearAccessToken());
      throw error;
    }
  };

  const value: AuthContextValue = {
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading || !isInitialized,
    accessToken: storedToken,
    user,
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
