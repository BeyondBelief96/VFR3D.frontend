import { Stack, Text, Box } from '@mantine/core';
import { FiMapPin } from 'react-icons/fi';
import { AirportContextChip } from './AirportContextChip';
import { SURFACE, BORDER } from '@/constants/surfaces';

interface AirportEntry {
  icaoOrIdent: string;
  displayName: string;
}

interface AirportContextListProps {
  airports: AirportEntry[];
  onRemove: (icaoOrIdent: string) => void;
  emptyMessage?: string;
  color?: string;
}

export function AirportContextList({
  airports,
  onRemove,
  emptyMessage = 'No airports added. Search above to add airports.',
  color = 'blue',
}: AirportContextListProps) {
  if (airports.length === 0) {
    return (
      <Box
        p="md"
        style={{
          backgroundColor: SURFACE.CARD_SUBTLE,
          borderRadius: 'var(--mantine-radius-sm)',
          border: `1px dashed ${BORDER.DEFAULT}`,
        }}
      >
        <Stack align="center" gap="xs">
          <FiMapPin size={20} style={{ opacity: 0.5 }} />
          <Text size="xs" c="dimmed" ta="center">
            {emptyMessage}
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack gap="xs">
      {airports.map((airport) => (
        <AirportContextChip
          key={airport.icaoOrIdent}
          icaoOrIdent={airport.icaoOrIdent}
          displayName={airport.displayName}
          onRemove={onRemove}
          color={color}
        />
      ))}
    </Stack>
  );
}

export default AirportContextList;
