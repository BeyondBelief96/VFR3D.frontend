import { Button, Loader } from '@mantine/core';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FiDownload } from 'react-icons/fi';
import { BUTTON_COLORS } from '@/constants/colors';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { FlightLogPdf } from '@/features/Flights';
import { FlightPdfData } from '@/features/Flights/hooks/useFlightPdfData';
import { useIsPhone } from '@/hooks';

interface PdfDownloadButtonProps {
  flight: FlightDto;
  pdfData: FlightPdfData;
}

export function PdfDownloadButton({ flight, pdfData }: PdfDownloadButtonProps) {
  const isPhone = useIsPhone();

  if (pdfData.isLoading) {
    return (
      <Button
        variant="light"
        color={BUTTON_COLORS.CONFIRM}
        size={isPhone ? 'sm' : 'md'}
        leftSection={<Loader size="xs" />}
        disabled
      >
        {isPhone ? 'PDF' : 'Preparing PDF...'}
      </Button>
    );
  }

  return (
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
      {({ loading }: { loading: boolean }) => (
        <Button
          variant="light"
          color={BUTTON_COLORS.CONFIRM}
          size={isPhone ? 'sm' : 'md'}
          leftSection={loading ? <Loader size="xs" /> : <FiDownload size={16} />}
          disabled={loading}
        >
          {loading ? 'Preparing...' : isPhone ? 'PDF' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default PdfDownloadButton;
