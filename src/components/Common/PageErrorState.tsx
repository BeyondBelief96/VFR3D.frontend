import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, Stack, Text, Button, Group, Box, ThemeIcon } from '@mantine/core';
import { FiAlertCircle, FiRefreshCw, FiArrowLeft, FiHome } from 'react-icons/fi';
import classes from './PageErrorState.module.css';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';

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
    <Card padding="xl" radius="md" className={classes.card}>
      <Stack align="center" gap="lg" py="md">
        <Box className={classes.iconBox}>
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
              gradient={BUTTON_GRADIENTS.PRIMARY}
              leftSection={!isRetrying ? <FiRefreshCw size={16} /> : undefined}
              onClick={onRetry}
              loading={isRetrying}
            >
              {retryLabel}
            </Button>
          )}
          {showGoBack && (
            <Button
              variant="subtle"
              color={BUTTON_COLORS.BACK}
              leftSection={<FiArrowLeft size={16} />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          )}
          {showGoHome && (
            <Button
              variant="subtle"
              color={BUTTON_COLORS.SECONDARY}
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
    <Box py="xl" px="md" className={classes.fullPageContainer}>
      <Box maw={500} w="100%">
        {content}
      </Box>
    </Box>
  );
};

export default PageErrorState;
