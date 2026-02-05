import React, { ReactNode } from 'react';
import { Box, ActionIcon, Text, Group, Paper } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import classes from './BottomDrawer.module.css';
import { ACTION_ICON_COLORS } from '@/constants/colors';

interface BottomDrawerProps {
  isOpen: boolean;
  toggleOpen: () => void;
  children: ReactNode;
  title: string;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  title,
  toggleOpen,
  children,
}) => {
  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Box className={classes.container}>
      {/* Overlay background - only visible when drawer is open */}
      {isOpen && (
        <Box className={classes.overlay} onClick={toggleOpen} />
      )}

      {/* Drawer container */}
      <Box className={classes.drawerWrapper}>
        <Paper
          radius="md"
          shadow="xl"
          className={`${classes.drawer} ${isOpen ? classes.drawerOpen : classes.drawerClosed}`}
        >
          {/* Drawer handle and header */}
          <Box onClick={toggleOpen} className={classes.handle}>
            {/* Pull handle */}
            <Box className={classes.handleBar}>
              <Box className={classes.handleIndicator} />
              <Text size="xs" c="dimmed" mt={4}>
                {title}
              </Text>
            </Box>

            {/* Header */}
            <Group justify="space-between" px="md" py="sm" className={classes.headerBorder}>
              <Text fw={600} size="lg">
                {title}
              </Text>
              {isOpen && (
                <ActionIcon
                  variant="subtle"
                  color={ACTION_ICON_COLORS.CLOSE}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOpen();
                  }}
                >
                  <FiX size={20} />
                </ActionIcon>
              )}
            </Group>
          </Box>

          {/* Drawer content */}
          <Box className={`${classes.content} ${isOpen ? classes.contentOpen : classes.contentClosed}`}>
            <Box h="100%">{children}</Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BottomDrawer;
