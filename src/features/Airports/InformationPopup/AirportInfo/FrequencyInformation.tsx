import React from 'react';
import { Box, Table, Text, Title, Stack } from '@mantine/core';
import { CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';

const translateFreqUse = (freqUse: string | null): string => {
  const translations: { [key: string]: string } = {
    'APCH/P': 'APCH',
    'DEP/P': 'DEP',
    'LCL/P': 'TWR',
    'GND/P': 'GND',
  };
  return translations[freqUse || ''] || freqUse || 'Unknown';
};

const sortFrequencies = (freqs: CommunicationFrequencyDto[]) => {
  const order = [
    'APCH/P',
    'DEP/P',
    'LCL/P',
    'GND/P',
    'EMERG',
    'UNICOM',
    'CD PRE TAXI CLNC',
    'D-ATIS',
    'ALCP',
  ];
  return [...freqs].sort((a, b) => {
    const indexA = order.indexOf(a.frequencyUse ?? '');
    const indexB = order.indexOf(b.frequencyUse ?? '');
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

interface FrequencyInformationProps {
  frequencies: CommunicationFrequencyDto[] | undefined;
}

export const FrequencyInformation: React.FC<FrequencyInformationProps> = ({ frequencies }) => {
  if (!frequencies || frequencies.length === 0) {
    return (
      <Text c="dimmed" ta="center">
        No frequency information available
      </Text>
    );
  }

  // Group frequencies by sector
  const groupedFrequencies = frequencies.reduce(
    (acc, freq) => {
      const sector = freq.sectorization || 'No Sector';
      if (!acc[sector]) {
        acc[sector] = [];
      }
      acc[sector].push(freq);
      return acc;
    },
    {} as Record<string, CommunicationFrequencyDto[]>
  );

  const sortedSectors = Object.keys(groupedFrequencies).sort();

  return (
    <Stack gap="md">
      {sortedSectors.map((sector) => (
        <Box key={sector}>
          <Title order={6} mb="xs">
            {sector}
          </Title>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            styles={{
              th: { fontSize: '0.75rem', padding: '8px' },
              td: { fontSize: '0.8rem', padding: '6px 8px' },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Use</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Hours</Table.Th>
                <Table.Th>Remarks</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortFrequencies(groupedFrequencies[sector]).map((freq, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{translateFreqUse(freq.frequencyUse ?? '')}</Table.Td>
                  <Table.Td fw={500}>{freq.frequency}</Table.Td>
                  <Table.Td>{freq.towerHours || 'N/A'}</Table.Td>
                  <Table.Td>
                    {freq.remark ? (
                      <Text size="xs" lineClamp={2} style={{ textTransform: 'lowercase' }}>
                        {freq.remark}
                      </Text>
                    ) : (
                      'N/A'
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      ))}
    </Stack>
  );
};

export default FrequencyInformation;
