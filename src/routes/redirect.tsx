import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import { Center, Stack, Text, Button, Paper, Image, Loader, Box } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import logo from '@/assets/images/logo_2.png';

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
      <Center
        h="100vh"
        style={{
          backgroundColor: 'var(--vfr3d-background)',
          background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%), var(--vfr3d-background)',
        }}
      >
        <Paper
          p="xl"
          radius="lg"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Stack align="center" gap="lg">
            <Image src={logo} alt="VFR3D" h={48} w="auto" />

            <Box
              p="md"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                width: '100%',
              }}
            >
              <Stack align="center" gap="xs">
                <FiAlertCircle size={32} color="#ef4444" />
                <Text c="white" size="md" fw={600} ta="center">
                  Authentication Error
                </Text>
                <Text c="dimmed" size="sm" ta="center">
                  {authError}
                </Text>
              </Stack>
            </Box>

            <Button
              fullWidth
              size="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              onClick={() => navigate({ to: '/' })}
            >
              Return to Home
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  // Show loading state
  return (
    <Center
      h="100vh"
      style={{
        backgroundColor: 'var(--vfr3d-background)',
        background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 50%), var(--vfr3d-background)',
      }}
    >
      <Paper
        p="xl"
        radius="lg"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Stack align="center" gap="xl">
          <Image src={logo} alt="VFR3D" h={56} w="auto" />

          <Stack align="center" gap="md">
            <Loader size="lg" color="blue" type="dots" />
            <Box ta="center">
              <Text c="white" size="lg" fw={600}>
                Completing Login
              </Text>
              <Text c="dimmed" size="sm" mt={4}>
                Setting up your flight planning session...
              </Text>
            </Box>
          </Stack>

          <Text c="dimmed" size="xs" ta="center">
            You'll be redirected automatically
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
