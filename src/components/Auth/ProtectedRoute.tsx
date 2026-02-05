import { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useAuth } from './AuthProvider';
import classes from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, will redirect to login. If false, will show nothing. */
  redirectToLogin?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom fallback when not authenticated */
  fallback?: ReactNode;
}

/**
 * A wrapper component that protects routes requiring authentication.
 * Automatically handles token refresh and redirects unauthenticated users.
 */
export function ProtectedRoute({
  children,
  redirectToLogin = true,
  loadingComponent,
  fallback,
}: ProtectedRouteProps) {
  // Use our custom AuthProvider context which waits for token initialization
  const { isAuthenticated, isLoading } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const location = useLocation();

  // Initialize token refresh for authenticated users
  useTokenRefresh();

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return (
      loadingComponent || (
        <Center h="100vh" className={classes.loadingContainer}>
          <Stack align="center" gap="md">
            <Loader size="xl" color="blue" />
            <Text c="white" size="lg">
              Loading VFR3D...
            </Text>
          </Stack>
        </Center>
      )
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirectToLogin) {
      // Store the intended destination for post-login redirect
      const returnTo = location.pathname + location.search;
      loginWithRedirect({
        appState: { returnTo },
      });

      return (
        <Center h="100vh" className={classes.loadingContainer}>
          <Stack align="center" gap="md">
            <Loader size="xl" color="blue" />
            <Text c="white" size="lg">
              Redirecting to login...
            </Text>
          </Stack>
        </Center>
      );
    }

    // Redirect to home if not using login redirect
    return <Navigate to="/" />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default ProtectedRoute;
