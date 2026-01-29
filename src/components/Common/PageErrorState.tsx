import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, Stack, Text, Button, Group, Box, ThemeIcon } from '@mantine/core';
import { FiAlertCircle, FiRefreshCw, FiArrowLeft, FiHome } from 'react-icons/fi';

export interface PageErrorStateProps {
  /** The main title shown in the error state */
  title?: string;
  /** A descriptive message explaining what went wrong */
  message?: string;
  /** Callback function to retry the failed operation */
  onRetry?: () => void;
  /** Text for the retry button */
  retryLabel?: string;
  /** Whether the retry operation is in progress (shows loading spinner) */
  isRetrying?: boolean;
  /** Show a "Go Back" button that navigates to the previous page */
  showGoBack?: boolean;
  /** Show a "Go Home" button that navigates to the home page */
  showGoHome?: boolean;
  /** Custom icon to display (defaults to FiAlertCircle) */
  icon?: React.ReactNode;
  /** Whether to render as a full container or just the card */
  fullPage?: boolean;
}

/**
 * A standardized error state component for pages when data fails to load.
 * Provides retry functionality and navigation options.
 */
export const PageErrorState: React.FC<PageErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this page. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  showGoBack = false,
  showGoHome = false,
  icon,
  fullPage = true,
}) => {
  const content = (
    <Card
      padding="xl"
      radius="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}
    >
      <Stack align="center" gap="lg" py="md">
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon || (
            <ThemeIcon size={32} color="red" variant="transparent">
              <FiAlertCircle size={32} />
            </ThemeIcon>
          )}
        </Box>

        <Stack align="center" gap="xs">
          <Text c="white" size="xl" fw={600} ta="center">
            {title}
          </Text>
          <Text c="dimmed" ta="center" maw={400}>
            {message}
          </Text>
        </Stack>

        <Group gap="sm">
          {onRetry && (
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              leftSection={!isRetrying ? <FiRefreshCw size={16} /> : undefined}
              onClick={onRetry}
              loading={isRetrying}
            >
              {retryLabel}
            </Button>
          )}
          {showGoBack && (
            <Button
              variant="light"
              color="gray"
              leftSection={<FiArrowLeft size={16} />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          )}
          {showGoHome && (
            <Button
              variant="light"
              color="gray"
              leftSection={<FiHome size={16} />}
              component={Link}
              to="/"
            >
              Go Home
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <Box
      py="xl"
      px="md"
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--vfr3d-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box maw={500} w="100%">
        {content}
      </Box>
    </Box>
  );
};

export default PageErrorState;
