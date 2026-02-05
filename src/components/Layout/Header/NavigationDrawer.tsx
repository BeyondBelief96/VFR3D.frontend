import { Box, Burger, Button, Divider, Drawer, Group, Stack, Text } from '@mantine/core';
import {
  FiHome,
  FiMap,
  FiLogOut,
  FiCloud,
  FiMail,
} from 'react-icons/fi';
import { FaPlane, FaPlaneDeparture, FaBalanceScale } from 'react-icons/fa';
import { TbMapPin } from 'react-icons/tb';
import { NavLinkItem } from './NavLinkItem';
import { DrawerUserSection } from './DrawerUserSection';
import classes from './Header.module.css';
import { BORDER, THEME_COLORS } from '@/constants/surfaces';
import { BUTTON_GRADIENTS, BUTTON_COLORS } from '@/constants/colors';

interface NavigationDrawerProps {
  opened: boolean;
  onClose: () => void;
  isPhone: boolean;
  isAuthenticated: boolean;
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  };
  onLogin: () => void;
  onLogout: () => void;
}

export function NavigationDrawer({
  opened,
  onClose,
  isPhone,
  isAuthenticated,
  user,
  onLogin,
  onLogout,
}: NavigationDrawerProps) {
  const handleNavigate = () => {
    onClose();
  };

  const handleLogin = () => {
    onClose();
    onLogin();
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isPhone ? '100%' : 320}
      padding={0}
      withCloseButton={false}
      styles={{
        body: {
          backgroundColor: THEME_COLORS.SURFACE_9,
          height: '100%',
          padding: 0,
        },
        content: {
          backgroundColor: THEME_COLORS.SURFACE_9,
          borderLeft: isPhone ? 'none' : `1px solid ${BORDER.LIGHT}`,
        },
      }}
    >
      <Stack gap={0} h="100%">
        {/* Header with close button */}
        <Group
          justify="space-between"
          p="md"
          style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
        >
          <Text size="lg" fw={600} c="white">
            Menu
          </Text>
          <Burger
            opened={true}
            onClick={onClose}
            size="sm"
            color="white"
            aria-label="Close menu"
          />
        </Group>

        {/* User Section (when authenticated) */}
        {isAuthenticated && user && (
          <DrawerUserSection
            name={user.name}
            email={user.email}
            picture={user.picture}
          />
        )}

        {/* Public Links */}
        <Box className={classes.navSection}>
          <Stack gap={4}>
            <NavLinkItem to="/" icon={<FiHome size={16} />} label="Home" onNavigate={handleNavigate} />
            <NavLinkItem to="/contact" icon={<FiMail size={16} />} label="Contact" onNavigate={handleNavigate} />
          </Stack>
        </Box>

        {/* Authenticated Links Section */}
        {isAuthenticated && (
          <>
            <Divider color="dark.5" />
            <Box className={classes.navSection}>
              <Text size="xs" tt="uppercase" c="dimmed" className={classes.navSectionLabel}>
                Flight Planning
              </Text>
              <Stack gap={4}>
                <NavLinkItem to="/airports" icon={<TbMapPin size={16} />} label="Airports" onNavigate={handleNavigate} />
                <NavLinkItem to="/flights" icon={<FaPlane size={16} />} label="Flights" onNavigate={handleNavigate} />
                <NavLinkItem to="/aircraft" icon={<FaPlaneDeparture size={16} />} label="Aircraft" onNavigate={handleNavigate} />
                <NavLinkItem to="/weight-balance" icon={<FaBalanceScale size={16} />} label="Weight & Balance" onNavigate={handleNavigate} />
                <NavLinkItem to="/weather-imagery" icon={<FiCloud size={16} />} label="Weather" onNavigate={handleNavigate} />
                <NavLinkItem to="/map" icon={<FiMap size={16} />} label="Map" onNavigate={handleNavigate} />
              </Stack>
            </Box>
          </>
        )}

        {/* Spacer */}
        <Box style={{ flex: 1 }} />

        {/* Auth Actions */}
        <Divider color="dark.5" />
        <Box className={classes.navSection}>
          {!isAuthenticated ? (
            <Button
              variant="gradient"
              gradient={BUTTON_GRADIENTS.PRIMARY}
              fullWidth
              onClick={handleLogin}
            >
              Sign In
            </Button>
          ) : (
            <Button
              variant="subtle"
              color={BUTTON_COLORS.DESTRUCTIVE}
              fullWidth
              leftSection={<FiLogOut size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}
