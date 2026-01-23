import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppShell, Box } from '@mantine/core';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <AppShell>
        <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </AppShell>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
