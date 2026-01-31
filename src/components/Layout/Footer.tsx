import { Box, Container, Group, Text, Anchor, Stack, Divider } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { FaGithub, FaTwitter } from 'react-icons/fa';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            {/* Brand */}
            <Stack gap="xs">
              <Text
                size="lg"
                fw={700}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              >
                VFR3D
              </Text>
              <Text size="sm" c="dimmed" maw={300}>
                Plan, Fly, Repeat. 3D VFR flight planning to visualize your route, check weather,
                and fly with confidence.
              </Text>
            </Stack>

            {/* Links */}
            <Group gap={50} align="flex-start">
              <Stack gap="xs">
                <Text size="sm" fw={600} c="white">
                  Product
                </Text>
                <Anchor component={Link} to="/features" size="sm" c="dimmed">
                  Features
                </Anchor>
                <Anchor component={Link} to="/viewer" size="sm" c="dimmed">
                  Map Viewer
                </Anchor>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={600} c="white">
                  Support
                </Text>
                <Anchor component={Link} to="/contact" size="sm" c="dimmed">
                  Contact
                </Anchor>
                <Anchor href="#" size="sm" c="dimmed">
                  FAQ
                </Anchor>
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={600} c="white">
                  Legal
                </Text>
                <Anchor href="#" size="sm" c="dimmed">
                  Privacy
                </Anchor>
                <Anchor href="#" size="sm" c="dimmed">
                  Terms
                </Anchor>
              </Stack>
            </Group>
          </Group>

          <Divider color="dark.4" />

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              &copy; {currentYear} VFR3D.com. All rights reserved.
            </Text>
            <Group gap="md">
              <Anchor href="#" c="dimmed">
                <FaGithub size={20} />
              </Anchor>
              <Anchor href="#" c="dimmed">
                <FaTwitter size={20} />
              </Anchor>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
