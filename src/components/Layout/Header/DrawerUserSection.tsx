import { Avatar, Box, Group, Text } from '@mantine/core';
import classes from './Header.module.css';

interface DrawerUserSectionProps {
  name?: string;
  email?: string;
  picture?: string;
}

export function DrawerUserSection({ name, email, picture }: DrawerUserSectionProps) {
  return (
    <Box className={classes.userSection}>
      <Group gap="md">
        <Avatar src={picture} alt={name} size="lg" radius="xl" />
        <Box>
          <Text fw={600} c="white" size="sm">
            {name}
          </Text>
          <Text size="xs" c="dimmed">
            {email}
          </Text>
        </Box>
      </Group>
    </Box>
  );
}
