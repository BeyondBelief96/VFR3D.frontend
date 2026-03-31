import { useEffect, useMemo, useRef } from 'react';
import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useRouterState } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../Sidebar/Sidebar';
import { SidebarProvider } from './SidebarContext';
import { EntityInfoAside } from '../Popup';
import { useAppSelector, useAppDispatch, useIsPhone, useIsTablet } from '@/hooks';
import { clearSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { SURFACE, BORDER } from '@/constants/surfaces';
import classes from './AppLayout.module.css';

const SIDEBAR_WIDTH = 320;
const ASIDE_WIDTH = 380;

export function AppLayout() {
  const [sidebarOpened, { toggle: toggleSidebar, open: openSidebar, close: closeSidebar }] =
    useDisclosure(true);
  const dispatch = useAppDispatch();
  const router = useRouterState();
  const isMapPage = router.location.pathname === '/map';
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();
  const isSmallScreen = isPhone || isTablet;

  // Get selected entity for aside state
  const selectedEntity = useAppSelector((state) => state.selectedEntity);
  const hasSelectedEntity = isMapPage && selectedEntity.entity !== null;

  // Track previous states to detect what changed (only on small screens)
  const prevSidebarOpened = useRef<boolean | null>(null);
  const prevHasSelectedEntity = useRef<boolean | null>(null);

  // Handle mutual exclusivity on small screens - only react to the state that changed
  useEffect(() => {
    if (isSmallScreen) {
      // Only act if we have previous state to compare against
      if (prevSidebarOpened.current !== null && prevHasSelectedEntity.current !== null) {
        // Sidebar was just opened while aside was already open -> close aside
        if (sidebarOpened && !prevSidebarOpened.current && hasSelectedEntity) {
          dispatch(clearSelectedEntity());
        }
        // Aside was just opened while sidebar was already open -> close sidebar
        else if (hasSelectedEntity && !prevHasSelectedEntity.current && sidebarOpened) {
          closeSidebar();
        }
      }

      // Update refs only when on small screen
      prevSidebarOpened.current = sidebarOpened;
      prevHasSelectedEntity.current = hasSelectedEntity;
    } else {
      // Reset refs when not on small screen so we start fresh when transitioning
      prevSidebarOpened.current = null;
      prevHasSelectedEntity.current = null;
    }
  }, [isSmallScreen, sidebarOpened, hasSelectedEntity, dispatch, closeSidebar]);

  // Set CSS variable for sidebar offset - used by BottomDrawer to avoid overlap
  useEffect(() => {
    const offset = isMapPage && sidebarOpened ? SIDEBAR_WIDTH : 0;
    document.documentElement.style.setProperty('--app-sidebar-offset', `${offset}px`);

    return () => {
      document.documentElement.style.setProperty('--app-sidebar-offset', '0px');
    };
  }, [isMapPage, sidebarOpened]);

  // Set CSS variable for aside offset - used by BottomDrawer to avoid overlap
  useEffect(() => {
    const offset = hasSelectedEntity ? ASIDE_WIDTH : 0;
    document.documentElement.style.setProperty('--app-aside-offset', `${offset}px`);

    return () => {
      document.documentElement.style.setProperty('--app-aside-offset', '0px');
    };
  }, [hasSelectedEntity]);

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
        aside={
          isMapPage
            ? {
                width: ASIDE_WIDTH,
                breakpoint: 0,
                collapsed: { desktop: !hasSelectedEntity, mobile: !hasSelectedEntity },
              }
            : undefined
        }
        padding={0}
        classNames={{
          main: classes.main,
          navbar: classes.navbar,
          aside: classes.aside,
        }}
        styles={{
          header: {
            backgroundColor: SURFACE.GLASS,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${BORDER.SUBTLE}`,
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

        {isMapPage && (
          <AppShell.Aside>
            <EntityInfoAside />
          </AppShell.Aside>
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
