import { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { Center, Loader, Stack, Text } from '@mantine/core';
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
 * Protects routes that require authentication.
 * Shows loading while Auth0 initializes, redirects to login if not authenticated.
 */
export function ProtectedRoute({
  children,
  redirectToLogin = true,
  loadingComponent,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  // Show loading while Auth0 initializes
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

    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
