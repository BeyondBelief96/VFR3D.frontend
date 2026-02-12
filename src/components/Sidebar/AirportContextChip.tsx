import { ActionIcon, Group, Paper, Text, Tooltip } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { SURFACE } from '@/constants/surfaces';

interface AirportContextChipProps {
  icaoOrIdent: string;
  displayName: string;
  onRemove: (icaoOrIdent: string) => void;
  color?: string;
}

export function AirportContextChip({
  icaoOrIdent,
  displayName,
  onRemove,
  color = 'blue',
}: AirportContextChipProps) {
  return (
    <Paper
      p="xs"
      radius="sm"
      style={{
        backgroundColor: SURFACE.CARD_HOVER,
        border: `1px solid var(--mantine-color-${color}-6)`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text size="sm" fw={500} c="white" lineClamp={1} style={{ flex: 1 }}>
          {displayName}
        </Text>
        <Tooltip label="Remove">
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => onRemove(icaoOrIdent)}
          >
            <FiX size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}

export default AirportContextChip;
