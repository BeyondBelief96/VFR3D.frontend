import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { LoadingScreen } from '@/components/Common';
import { Center, Stack, Text, Button } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';

export const Route = createFileRoute('/redirect')({
  component: RedirectPage,
});

function RedirectPage() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, error } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for Auth0 to finish loading
      if (isLoading) return;

      // Handle authentication errors
      if (error) {
        console.error('[Redirect] Auth0 error:', error);
        setAuthError(error.message);
        return;
      }

      // If not authenticated, redirect to home
      if (!isAuthenticated) {
        console.log('[Redirect] Not authenticated, redirecting to home');
        navigate({ to: '/' });
        return;
      }

      // Already processing
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        // Get and store the access token
        console.log('[Redirect] Getting access token...');
        const token = await getAccessTokenSilently();
        dispatch(setAccessToken(token));
        console.log('[Redirect] Token stored successfully');

        // Check if there's a return URL in the app state
        // This would be set by loginWithRedirect({ appState: { returnTo: ... } })
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo') || '/viewer';

        console.log('[Redirect] Redirecting to:', returnTo);
        navigate({ to: returnTo });
      } catch (err) {
        console.error('[Redirect] Error getting access token:', err);
        setAuthError(
          err instanceof Error ? err.message : 'Failed to complete authentication'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    handleRedirect();
  }, [isAuthenticated, isLoading, error, getAccessTokenSilently, navigate, dispatch, isProcessing]);

  // Show error state
  if (authError) {
    return (
      <Center h="100vh" style={{ backgroundColor: 'var(--vfr3d-background)' }}>
        <Stack align="center" gap="lg" maw={400}>
          <FiAlertCircle size={48} color="#ef4444" />
          <Text c="white" size="lg" fw={600} ta="center">
            Authentication Error
          </Text>
          <Text c="dimmed" ta="center">
            {authError}
          </Text>
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            onClick={() => navigate({ to: '/' })}
          >
            Return to Home
          </Button>
        </Stack>
      </Center>
    );
  }

  // Show loading state
  return (
    <LoadingScreen
      title="Completing Login"
      message="Setting up your flight planning session..."
    />
  );
}
