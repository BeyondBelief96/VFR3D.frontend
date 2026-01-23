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
    <AppShell
      header={{ height: 60 }}
      navbar={
        isViewerPage
          ? {
              width: 320,
              breakpoint: 'sm',
              collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened },
            }
          : undefined
      }
      padding={0}
      styles={{
        main: {
          backgroundColor: 'var(--vfr3d-background)',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Header
        style={{
          backgroundColor: 'var(--vfr3d-surface)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Header
          isViewerPage={isViewerPage}
          sidebarOpened={sidebarOpened}
          toggleSidebar={toggleSidebar}
        />
      </AppShell.Header>

      {isViewerPage && (
        <AppShell.Navbar
          p="md"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Sidebar />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Box style={{ minHeight: isViewerPage ? '100%' : 'calc(100vh - 60px)' }}>
          <Outlet />
        </Box>
        {!isViewerPage && <Footer />}
      </AppShell.Main>
    </AppShell>
  );
}

export default AppLayout;
