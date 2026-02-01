import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useRouterState } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../Sidebar/Sidebar';
import classes from './AppLayout.module.css';

const SIDEBAR_WIDTH = 320;

export function AppLayout() {
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(true);
  const router = useRouterState();
  const isMapPage = router.location.pathname === '/map';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={
        isMapPage
          ? {
              width: SIDEBAR_WIDTH,
              breakpoint: 0,
              collapsed: { desktop: !sidebarOpened, mobile: !sidebarOpened },
            }
          : undefined
      }
      padding={0}
      classNames={{
        main: classes.main,
        navbar: classes.navbar,
      }}
      styles={{
        header: {
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        },
      }}
    >
      <AppShell.Header>
        <Header
          isMapPage={isMapPage}
          sidebarOpened={sidebarOpened}
          toggleSidebar={toggleSidebar}
        />
      </AppShell.Header>

      {isMapPage && (
        <AppShell.Navbar>
          <Sidebar onClose={toggleSidebar} />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Box className={isMapPage ? classes.contentBoxMap : classes.contentBox}>
          <Outlet />
        </Box>
        {!isMapPage && <Footer />}
      </AppShell.Main>
    </AppShell>
  );
}

export default AppLayout;
