import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Center, Loader, Text, Stack } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setAccessToken } from '@/redux/slices/authSlice';

export const Route = createFileRoute('/redirect')({
  component: RedirectPage,
});

function RedirectPage() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleRedirect = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        navigate({ to: '/' });
        return;
      }

      try {
        // Get and store the access token
        const token = await getAccessTokenSilently();
        dispatch(setAccessToken(token));

        // Redirect to viewer
        navigate({ to: '/viewer' });
      } catch (error) {
        console.error('Error getting access token:', error);
        navigate({ to: '/' });
      }
    };

    handleRedirect();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, navigate, dispatch]);

  return (
    <Center h="100vh" bg="var(--vfr3d-background)">
      <Stack align="center" gap="md">
        <Loader size="xl" color="blue" />
        <Text c="white" size="lg">
          Completing login...
        </Text>
      </Stack>
    </Center>
  );
}
