import { useEffect, useMemo } from 'react';
import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useRouterState } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from './SidebarContext';
import classes from './AppLayout.module.css';

const SIDEBAR_WIDTH = 320;

export function AppLayout() {
  const [sidebarOpened, { toggle: toggleSidebar, open: openSidebar, close: closeSidebar }] =
    useDisclosure(true);
  const router = useRouterState();
  const isMapPage = router.location.pathname === '/map';

  // Set CSS variable for sidebar offset - used by BottomDrawer to avoid overlap
  useEffect(() => {
    const offset = isMapPage && sidebarOpened ? SIDEBAR_WIDTH : 0;
    document.documentElement.style.setProperty('--app-sidebar-offset', `${offset}px`);

    return () => {
      document.documentElement.style.setProperty('--app-sidebar-offset', '0px');
    };
  }, [isMapPage, sidebarOpened]);

  // Memoize sidebar context value to prevent unnecessary re-renders
  const sidebarContextValue = useMemo(
    () => ({
      isOpen: sidebarOpened,
      close: closeSidebar,
      open: openSidebar,
      toggle: toggleSidebar,
    }),
    [sidebarOpened, closeSidebar, openSidebar, toggleSidebar]
  );

  return (
    <SidebarProvider value={sidebarContextValue}>
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
    </SidebarProvider>
  );
}

export default AppLayout;
