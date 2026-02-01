import { Link } from '@tanstack/react-router';
import { Group, ActionIcon, Box, Title, Text, Badge, Button, Loader, Tooltip, Stack } from '@mantine/core';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FiArrowLeft, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { FlightLogPdf } from '@/features/Flights';
import { FlightPdfData } from '@/features/Flights/hooks/useFlightPdfData';
import { useIsPhone } from '@/hooks';

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
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            component={Link}
            to="/flights"
          >
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
              color="orange"
              size={isPhone ? 'sm' : 'md'}
              leftSection={isRefreshing ? <Loader size="xs" /> : <FiRefreshCw size={16} />}
              onClick={onRefreshAll}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : isPhone ? 'Refresh' : 'Refresh All'}
            </Button>
          </Tooltip>
        )}
        <PDFDownloadLink
          document={
            <FlightLogPdf
              flightData={flight}
              airports={pdfData.airports}
              metars={pdfData.metars}
              tafs={pdfData.tafs}
              runways={pdfData.runways}
              frequencies={pdfData.frequencies}
              crosswindData={pdfData.crosswindData}
              weightBalance={pdfData.weightBalance}
            />
          }
          fileName={`${flight.name || 'flight'}-navlog.pdf`}
          style={{ textDecoration: 'none' }}
        >
          {/* @ts-expect-error Known TypeScript issue with react-pdf children render prop */}
          {({ loading }: { loading: boolean }) => (
            <Button
              variant="light"
              color="green"
              size={isPhone ? 'sm' : 'md'}
              leftSection={loading || pdfData.isLoading ? <Loader size="xs" /> : <FiDownload size={16} />}
              disabled={loading || pdfData.isLoading}
            >
              {loading || pdfData.isLoading ? 'Preparing...' : isPhone ? 'PDF' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </Group>
    </Stack>
  );
}
