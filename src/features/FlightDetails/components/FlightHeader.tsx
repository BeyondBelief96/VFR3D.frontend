import { Link } from '@tanstack/react-router';
import { Group, ActionIcon, Box, Title, Text, Badge, Button, Loader } from '@mantine/core';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { FlightLogPdf } from '@/features/Flights';
import { FlightPdfData } from '@/features/Flights/hooks/useFlightPdfData';

interface FlightHeaderProps {
  flight: FlightDto;
  pdfData: FlightPdfData;
}

export function FlightHeader({ flight, pdfData }: FlightHeaderProps) {
  return (
    <Group justify="space-between" align="center">
      <Group gap="sm">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          component={Link}
          to="/flights"
        >
          <FiArrowLeft size={20} />
        </ActionIcon>
        <Box>
          <Title order={2} c="white">
            {flight.name || 'Unnamed Flight'}
          </Title>
          <Text size="sm" c="dimmed">
            {flight.departureTime
              ? new Date(flight.departureTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'No date set'}
          </Text>
        </Box>
      </Group>
      <Group gap="sm">
        <Badge variant="filled" color="blue" size="lg">
          {flight.waypoints?.length || 0} waypoints
        </Badge>
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
              color="blue"
              leftSection={loading || pdfData.isLoading ? <Loader size="xs" /> : <FiDownload size={16} />}
              disabled={loading || pdfData.isLoading}
            >
              {loading || pdfData.isLoading ? 'Preparing...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </Group>
    </Group>
  );
}
