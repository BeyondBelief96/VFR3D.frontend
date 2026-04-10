import React, { Suspense } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Group,
  ActionIcon,
  Box,
  Title,
  Text,
  Badge,
  Button,
  Loader,
  Tooltip,
  Stack,
} from '@mantine/core';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { BUTTON_COLORS, ACTION_ICON_COLORS } from '@/constants/colors';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { FlightPdfData } from '@/features/Flights/hooks/useFlightPdfData';
import { useIsPhone } from '@/hooks';

const PdfDownloadButton = React.lazy(() => import('./PdfDownloadButton'));

interface FlightHeaderProps {
  flight: FlightDto;
  pdfData: FlightPdfData;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
}

export function FlightHeader({ flight, pdfData, onRefreshAll, isRefreshing }: FlightHeaderProps) {
  const isPhone = useIsPhone();

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ActionIcon variant="subtle" color={ACTION_ICON_COLORS.NAVIGATE} size="lg" component={Link} to="/flights">
            <FiArrowLeft size={20} />
          </ActionIcon>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Title order={isPhone ? 3 : 2} c="white" lineClamp={1}>
              {flight.name || 'Unnamed Flight'}
            </Title>
            <Text size="sm" c="dimmed">
              {flight.departureTime
                ? new Date(flight.departureTime).toLocaleDateString('en-US', {
                    weekday: isPhone ? 'short' : 'long',
                    year: 'numeric',
                    month: isPhone ? 'short' : 'long',
                    day: 'numeric',
                  })
                : 'No date set'}
            </Text>
          </Box>
        </Group>
        {!isPhone && (
          <Badge variant="filled" color="blue" size="lg">
            {flight.waypoints?.length || 0} waypoints
          </Badge>
        )}
      </Group>
      <Group gap="sm" wrap="wrap">
        {isPhone && (
          <Badge variant="filled" color="blue" size="md">
            {flight.waypoints?.length || 0} waypoints
          </Badge>
        )}
        {onRefreshAll && (
          <Tooltip label="Refresh all flight data (weather, NOTAMs, navlog, etc.)">
            <Button
              variant="light"
              color={BUTTON_COLORS.REFRESH}
              size={isPhone ? 'sm' : 'md'}
              leftSection={isRefreshing ? <Loader size="xs" /> : <FiRefreshCw size={16} />}
              onClick={onRefreshAll}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : isPhone ? 'Refresh' : 'Refresh All'}
            </Button>
          </Tooltip>
        )}
        <Suspense fallback={<Button variant="light" color={BUTTON_COLORS.CONFIRM} size={isPhone ? 'sm' : 'md'} disabled leftSection={<Loader size="xs" />}>{isPhone ? 'PDF' : 'Loading...'}</Button>}>
          <PdfDownloadButton flight={flight} pdfData={pdfData} />
        </Suspense>
      </Group>
    </Stack>
  );
}
