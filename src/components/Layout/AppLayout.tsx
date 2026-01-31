import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useRouterState } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../Sidebar/Sidebar';

export function AppLayout() {
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(false);
  const router = useRouterState();
  const isViewerPage = router.location.pathname === '/viewer';

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        padding={0}
        styles={{
          main: {
            backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
            minHeight: '100vh',
          },
        }}
      >
        <AppShell.Header
          style={{
            backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Header
            isViewerPage={isViewerPage}
            sidebarOpened={sidebarOpened}
            toggleSidebar={toggleSidebar}
          />
        </AppShell.Header>

        <AppShell.Main>
          <Box style={{ minHeight: isViewerPage ? '100%' : 'calc(100vh - 60px)' }}>
            <Outlet />
          </Box>
          {!isViewerPage && <Footer />}
        </AppShell.Main>
      </AppShell>

      {/* Overlay Sidebar - rendered outside AppShell to prevent layout shifts */}
      {isViewerPage && (
        <Sidebar isOpen={sidebarOpened} toggleOpen={toggleSidebar} />
      )}
    </>
  );
}

export default AppLayout;
