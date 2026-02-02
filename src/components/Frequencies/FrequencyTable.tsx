import { useMemo } from 'react';
import { Stack, Paper, Group, ThemeIcon, Text, Badge, Table, ScrollArea, Box } from '@mantine/core';
import { FiRadio } from 'react-icons/fi';
import { CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';
import { sortFrequencyGroups, groupFrequenciesByUse } from '@/utility/frequencyUtils';

type DisplayVariant = 'full' | 'compact' | 'minimal';

interface FrequencyTableProps {
  /** Array of frequency DTOs to display */
  frequencies: CommunicationFrequencyDto[] | undefined;
  /** Display variant: 'full' (all columns), 'compact' (fewer columns), 'minimal' (essential only) */
  variant?: DisplayVariant;
  /** Whether to show the group header with icon */
  showGroupHeader?: boolean;
  /** Whether to wrap each group in a Paper component */
  showGroupPaper?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

/**
 * Standardized frequency table component used across all airport views.
 * Groups frequencies by type and displays them in a consistent format.
 */
export function FrequencyTable({
  frequencies,
  variant = 'full',
  showGroupHeader = true,
  showGroupPaper = true,
  emptyMessage = 'No frequency information available',
}: FrequencyTableProps) {
  // Group frequencies by use type
  const groupedFrequencies = useMemo(() => {
    if (!frequencies) return {};
    return groupFrequenciesByUse(frequencies);
  }, [frequencies]);

  // Sort frequency groups by priority
  const sortedGroups = useMemo(() => {
    return sortFrequencyGroups(Object.keys(groupedFrequencies));
  }, [groupedFrequencies]);

  if (!frequencies || frequencies.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md">
        {emptyMessage}
      </Text>
    );
  }

  // Determine which columns to show based on variant
  const showSector = variant === 'full';
  const showHours = variant === 'full' || variant === 'compact';
  const showRemarks = variant !== 'minimal';

  return (
    <Stack gap={variant === 'minimal' ? 'xs' : 'md'}>
      {sortedGroups.map((group) => {
        const freqs = groupedFrequencies[group];
        const hasSectorInfo = freqs.some((f) => f.sectorization);

        const tableContent = (
          <ScrollArea>
            <Table
              striped
              highlightOnHover
              styles={{
                table: { minWidth: variant === 'minimal' ? 280 : 400 },
                th: {
                  color: 'var(--mantine-color-gray-4)',
                  fontSize: variant === 'minimal' ? '0.7rem' : '0.75rem',
                  padding: variant === 'minimal' ? '6px' : '8px',
                },
                td: {
                  fontSize: variant === 'minimal' ? '0.75rem' : '0.8rem',
                  padding: variant === 'minimal' ? '4px 6px' : '6px 8px',
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Th>Name/Call</Table.Th>
                  {showSector && hasSectorInfo && <Table.Th>Sector</Table.Th>}
                  {showHours && <Table.Th>Hours</Table.Th>}
                  {showRemarks && <Table.Th>Remarks</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {freqs.map((freq, idx) => (
                  <Table.Tr key={`${freq.id}-${idx}`}>
                    <Table.Td>
                      <Text fw={600} c="cyan" style={{ fontFamily: 'monospace' }}>
                        {freq.frequency || '--'}
                      </Text>
                    </Table.Td>
                    <Table.Td>{freq.towerOrCommCall || freq.facilityName || '--'}</Table.Td>
                    {showSector && hasSectorInfo && (
                      <Table.Td>
                        <Text size="xs">{freq.sectorization || '--'}</Text>
                      </Table.Td>
                    )}
                    {showHours && <Table.Td>{freq.towerHours || '--'}</Table.Td>}
                    {showRemarks && (
                      <Table.Td>
                        <Text size="xs" lineClamp={2}>
                          {freq.remark || '--'}
                        </Text>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        );

        if (showGroupPaper) {
          return (
            <Paper key={group} p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
              {showGroupHeader && (
                <Group gap="sm" mb="md">
                  <ThemeIcon size="sm" variant="light" color="cyan">
                    <FiRadio size={12} />
                  </ThemeIcon>
                  <Text fw={600} c="white">
                    {group}
                  </Text>
                  <Badge size="sm" variant="light" color="gray">
                    {freqs.length}
                  </Badge>
                </Group>
              )}
              {tableContent}
            </Paper>
          );
        }

        return (
          <Box key={group}>
            {showGroupHeader && (
              <Group gap="sm" mb="xs">
                <Text fw={600} size="sm">
                  {group}
                </Text>
                <Badge size="xs" variant="light" color="gray">
                  {freqs.length}
                </Badge>
              </Group>
            )}
            {tableContent}
          </Box>
        );
      })}
    </Stack>
  );
}
