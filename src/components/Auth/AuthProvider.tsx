import { ReactNode, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { registerAuth0TokenGetter, unregisterAuth0TokenGetter } from '@/utility/auth';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Registers Auth0's getAccessTokenSilently for use by RTK Query.
 * This is the bridge between Auth0 (React) and RTK Query (non-React).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { getAccessTokenSilently, isLoading } = useAuth0();

  // Register the token getter once Auth0 is ready
  useEffect(() => {
    if (!isLoading) {
      registerAuth0TokenGetter(getAccessTokenSilently);
    }

    return () => {
      unregisterAuth0TokenGetter();
    };
  }, [getAccessTokenSilently, isLoading]);

  return <>{children}</>;
}

export default AuthProvider;
