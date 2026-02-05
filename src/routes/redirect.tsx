import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Center, Stack, Text, Button, Paper, Image, Loader, Box } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import logo from '@/assets/images/logo_2.png';

export const Route = createFileRoute('/redirect')({
  component: RedirectPage,
});

function RedirectPage() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
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

    // Authenticated - redirect to intended destination
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo') || '/map';

    console.log('[Redirect] Authenticated, redirecting to:', returnTo);
    navigate({ to: returnTo });
  }, [isAuthenticated, isLoading, error, navigate]);

  // Show error state
  if (authError) {
    return (
      <Center
        h="100vh"
        style={{
          backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
          background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%), var(--mantine-color-vfr3dSurface-9)',
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
                <FiAlertCircle size={32} color="var(--mantine-color-ifrRed-5)" />
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
        backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
        background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 50%), var(--mantine-color-vfr3dSurface-9)',
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
