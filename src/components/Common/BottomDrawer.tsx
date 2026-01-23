import React, { ReactNode, useEffect, useState } from 'react';
import { Box, ActionIcon, Text, Group, Paper } from '@mantine/core';
import { FiX } from 'react-icons/fi';

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
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAnimationClass('translateY(0)');
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      setAnimationClass('translateY(calc(100% - 48px))');
      // Restore body scrolling when drawer is closed
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Overlay background - only visible when drawer is open */}
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s',
            pointerEvents: 'auto',
          }}
          onClick={toggleOpen}
        />
      )}

      {/* Drawer container */}
      <Box
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Paper
          radius="md"
          shadow="xl"
          style={{
            width: '100%',
            maxWidth: '1024px',
            transform: animationClass,
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: 'rgba(26, 27, 30, 0.98)',
            backdropFilter: 'blur(12px)',
            borderTopLeftRadius: 'var(--mantine-radius-lg)',
            borderTopRightRadius: 'var(--mantine-radius-lg)',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: 'none',
            pointerEvents: 'auto',
          }}
        >
          {/* Drawer handle and header */}
          <Box
            onClick={toggleOpen}
            style={{ cursor: 'pointer' }}
          >
            {/* Pull handle */}
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 4,
              }}
            >
              <Box
                style={{
                  width: 48,
                  height: 4,
                  borderRadius: 9999,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'background-color 0.2s',
                }}
              />
              <Text size="xs" c="dimmed" mt={4}>
                {title}
              </Text>
            </Box>

            {/* Header */}
            <Group
              justify="space-between"
              px="md"
              py="sm"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Text fw={600} size="lg">
                {title}
              </Text>
              {isOpen && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
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
          <Box
            style={{
              height: isOpen ? '75vh' : 0,
              opacity: isOpen ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}
          >
            <Box h="100%">{children}</Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default BottomDrawer;
