import {
  Group,
  Burger,
  Button,
  Menu,
  Avatar,
  Text,
  UnstyledButton,
  Image,
  Box,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FiHome,
  FiMap,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiCloud,
  FiMail,
} from 'react-icons/fi';
import { FaPlane, FaPlaneDeparture, FaBalanceScale } from 'react-icons/fa';
import { TbMapPin, TbLayoutSidebar } from 'react-icons/tb';
import AirportSearch from '../../Search/AirportSearch';
import logo from '@/assets/images/logo_2.png';
import { useIsPhone, useCompactNav } from '@/hooks';
import { NavigationDrawer } from './NavigationDrawer';

interface HeaderProps {
  isMapPage: boolean;
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export function Header({ isMapPage, sidebarOpened, toggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
    useDisclosure(false);
  const isPhone = useIsPhone();
  const compactNav = useCompactNav();

  // On map page + phone, we show MapUnavailableMobile, so use regular header style
  const showMapHeader = isMapPage && !isPhone;

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URI } });
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const NavLinks = () => (
    <>
      {/* Public links */}
      <Button
        component={Link}
        to="/"
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<FiHome size={16} />}
      >
        Home
      </Button>
      <Button
        component={Link}
        to="/contact"
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<FiMail size={14} />}
      >
        Contact
      </Button>

      {/* Authenticated links */}
      {isAuthenticated && (
        <>
          <Button
            component={Link}
            to="/airports"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<TbMapPin size={16} />}
          >
            Airports
          </Button>
          <Button
            component={Link}
            to="/flights"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<FaPlane size={14} />}
          >
            Flights
          </Button>
          <Button
            component={Link}
            to="/aircraft"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<FaPlaneDeparture size={14} />}
          >
            Aircraft
          </Button>
          <Button
            component={Link}
            to="/weight-balance"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<FaBalanceScale size={14} />}
          >
            W&B
          </Button>
          <Button
            component={Link}
            to="/weather-imagery"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<FiCloud size={16} />}
          >
            Weather
          </Button>
          <Button
            component={Link}
            to="/map"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<FiMap size={16} />}
          >
            Map
          </Button>
        </>
      )}
    </>
  );

  const UserMenu = () => {
    if (!isAuthenticated) {
      return (
        <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          size="sm"
          loading={isLoading}
          onClick={handleLogin}
        >
          Sign In
        </Button>
      );
    }

    return (
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <UnstyledButton>
            <Group gap="xs">
              <Avatar src={user?.picture} alt={user?.name} radius="xl" size="sm" />
              <Text size="sm" c="white" visibleFrom="sm">
                {user?.name}
              </Text>
              <FiChevronDown size={14} color="white" />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item leftSection={<FiUser size={14} />}>Profile</Menu.Item>
          <Menu.Item leftSection={<FiSettings size={14} />}>Settings</Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<FiLogOut size={14} />} color="red" onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  };

  // Map page header - compact with search (only on tablet/desktop)
  if (showMapHeader) {
    return (
      <>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Tooltip label={sidebarOpened ? 'Hide map settings' : 'Show map settings'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={toggleSidebar}
                aria-label="Toggle map settings sidebar"
              >
                <TbLayoutSidebar size={22} />
              </ActionIcon>
            </Tooltip>
            <Box w={{ base: 200, sm: 300 }}>
              <AirportSearch />
            </Box>
          </Group>

          {/* Show inline nav when not compact */}
          {!compactNav && (
            <Group gap="xs">
              <Button
                component={Link}
                to="/"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<FiHome size={16} />}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/airports"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<TbMapPin size={16} />}
              >
                Airports
              </Button>
              <Button
                component={Link}
                to="/flights"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<FaPlane size={14} />}
              >
                Flights
              </Button>
              <Button
                component={Link}
                to="/aircraft"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<FaPlaneDeparture size={14} />}
              >
                Aircraft
              </Button>
              <Button
                component={Link}
                to="/weight-balance"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<FaBalanceScale size={14} />}
              >
                W&B
              </Button>
              <Button
                component={Link}
                to="/weather-imagery"
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<FiCloud size={16} />}
              >
                Weather
              </Button>
            </Group>
          )}

          <Group gap="sm">
            <UserMenu />
            {/* Show hamburger when compact */}
            {compactNav && (
              <Burger
                opened={mobileMenuOpened}
                onClick={toggleMobileMenu}
                size="sm"
                color="white"
                aria-label="Toggle navigation"
              />
            )}
          </Group>
        </Group>

        <NavigationDrawer
          opened={mobileMenuOpened}
          onClose={closeMobileMenu}
          isPhone={isPhone}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // Regular page header
  return (
    <>
      <Group h="100%" px="md" justify="space-between">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Image src={logo} alt="VFR3D" h={40} w="auto" />
        </Link>

        {/* Desktop Navigation - show when NOT compact */}
        {!compactNav && (
          <Group gap="xs">
            <NavLinks />
          </Group>
        )}

        {/* Right side - User menu / Hamburger */}
        <Group gap="sm">
          <UserMenu />
          {/* Show hamburger when compact */}
          {compactNav && (
            <Burger
              opened={mobileMenuOpened}
              onClick={toggleMobileMenu}
              size="sm"
              color="white"
              aria-label="Toggle navigation"
            />
          )}
        </Group>
      </Group>

      <NavigationDrawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        isPhone={isPhone}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </>
  );
}

export default Header;
