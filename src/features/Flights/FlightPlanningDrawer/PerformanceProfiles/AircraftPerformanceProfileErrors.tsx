import React from 'react';
import { Alert, Stack, Text, Button } from '@mantine/core';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface AircraftPerformanceProfileErrorsProps {
  onRetry: () => void;
}

export const AircraftPerformanceProfileErrors: React.FC<AircraftPerformanceProfileErrorsProps> = ({
  onRetry,
}) => {
  return (
    <Alert
      color="red"
      title="Unable to Load Profiles"
      icon={<FiAlertCircle size={20} />}
      styles={{
        root: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
      }}
    >
      <Stack gap="sm">
        <Text size="sm">
          We couldn't load your aircraft performance profiles. This might be a temporary issue.
        </Text>
        <Button
          variant="light"
          color="red"
          size="sm"
          leftSection={<FiRefreshCw size={14} />}
          onClick={onRetry}
          style={{ alignSelf: 'flex-start' }}
        >
          Retry Loading
        </Button>
      </Stack>
    </Alert>
  );
};

export default AircraftPerformanceProfileErrors;
