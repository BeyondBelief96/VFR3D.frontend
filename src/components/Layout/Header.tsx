import {
  Group,
  Burger,
  Button,
  Menu,
  Avatar,
  Text,
  UnstyledButton,
  Drawer,
  Stack,
  Divider,
  Image,
  Box,
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
import AirportSearch from '../Search/AirportSearch';
import logo from '@/assets/images/logo_2.png';

interface HeaderProps {
  isViewerPage: boolean;
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export function Header({ isViewerPage, sidebarOpened, toggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();
  const [mobileMenuOpened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
    useDisclosure(false);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URI } });
  };

  const NavLinks = ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) => (
    <>
      <Button
        component={Link}
        to="/"
        variant="subtle"
        color="gray"
        size={mobile ? 'md' : 'sm'}
        leftSection={<FiHome size={16} />}
        onClick={onNavigate}
        fullWidth={mobile}
        justify={mobile ? 'flex-start' : 'center'}
      >
        Home
      </Button>
      <Button
        component={Link}
        to="/weather-imagery"
        variant="subtle"
        color="gray"
        size={mobile ? 'md' : 'sm'}
        leftSection={<FiCloud size={16} />}
        onClick={onNavigate}
        fullWidth={mobile}
        justify={mobile ? 'flex-start' : 'center'}
      >
        Weather
      </Button>
      <Button
        component={Link}
        to="/contact"
        variant="subtle"
        color="gray"
        size={mobile ? 'md' : 'sm'}
        leftSection={<FiMail size={14} />}
        onClick={onNavigate}
        fullWidth={mobile}
        justify={mobile ? 'flex-start' : 'center'}
      >
        Contact
      </Button>
      {isAuthenticated && (
        <>
          <Button
            component={Link}
            to="/flights"
            variant="subtle"
            color="gray"
            size={mobile ? 'md' : 'sm'}
            leftSection={<FaPlane size={14} />}
            onClick={onNavigate}
            fullWidth={mobile}
            justify={mobile ? 'flex-start' : 'center'}
          >
            Flights
          </Button>
          <Button
            component={Link}
            to="/aircraft"
            variant="subtle"
            color="gray"
            size={mobile ? 'md' : 'sm'}
            leftSection={<FaPlaneDeparture size={14} />}
            onClick={onNavigate}
            fullWidth={mobile}
            justify={mobile ? 'flex-start' : 'center'}
          >
            Aircraft
          </Button>
          <Button
            component={Link}
            to="/weight-balance"
            variant="subtle"
            color="gray"
            size={mobile ? 'md' : 'sm'}
            leftSection={<FaBalanceScale size={14} />}
            onClick={onNavigate}
            fullWidth={mobile}
            justify={mobile ? 'flex-start' : 'center'}
          >
            W&B
          </Button>
          <Button
            component={Link}
            to="/viewer"
            variant="subtle"
            color="gray"
            size={mobile ? 'md' : 'sm'}
            leftSection={<FiMap size={16} />}
            onClick={onNavigate}
            fullWidth={mobile}
            justify={mobile ? 'flex-start' : 'center'}
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
          onClick={() => loginWithRedirect()}
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

  // Viewer page header - compact with search
  if (isViewerPage) {
    return (
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Burger
            opened={sidebarOpened}
            onClick={toggleSidebar}
            size="sm"
            color="white"
            aria-label="Toggle sidebar"
          />
          <Box w={{ base: 200, sm: 300 }}>
            <AirportSearch />
          </Box>
        </Group>

        <Group gap="xs" visibleFrom="md">
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
        </Group>

        <UserMenu />
      </Group>
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

        {/* Desktop Navigation */}
        <Group gap="xs" visibleFrom="md">
          <NavLinks />
        </Group>

        {/* Right side - User menu / Login */}
        <Group gap="sm">
          <UserMenu />
          <Burger
            opened={mobileMenuOpened}
            onClick={toggleMobileMenu}
            hiddenFrom="md"
            size="sm"
            color="white"
            aria-label="Toggle navigation"
          />
        </Group>
      </Group>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        size="100%"
        padding="md"
        title={
          <Text size="lg" fw={600} c="white">
            Menu
          </Text>
        }
        styles={{
          header: { backgroundColor: 'var(--mantine-color-vfr3dSurface-8)' },
          body: { backgroundColor: 'var(--mantine-color-vfr3dSurface-9)' },
          close: { color: 'white' },
        }}
        hiddenFrom="md"
      >
        <Stack gap="xs">
          <NavLinks mobile onNavigate={closeMobileMenu} />
          <Divider my="sm" color="dark.4" />
          {!isAuthenticated && (
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              fullWidth
              onClick={() => {
                closeMobileMenu();
                loginWithRedirect();
              }}
            >
              Sign In
            </Button>
          )}
          {isAuthenticated && (
            <Button
              variant="subtle"
              color="red"
              fullWidth
              leftSection={<FiLogOut size={16} />}
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
            >
              Logout
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  );
}

export default Header;
