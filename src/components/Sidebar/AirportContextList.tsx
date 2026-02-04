import { Stack, Text, Box } from '@mantine/core';
import { FiMapPin } from 'react-icons/fi';
import { AirportContextChip } from './AirportContextChip';

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
          backgroundColor: 'rgba(30, 41, 59, 0.3)',
          borderRadius: 'var(--mantine-radius-sm)',
          border: '1px dashed rgba(148, 163, 184, 0.2)',
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
