import React from 'react';
import { Table, Text, Box, Badge } from '@mantine/core';
import { StationBreakdownDto, WeightUnits, ArmUnits } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';

interface WeightBreakdownTableProps {
  breakdown: StationBreakdownDto[];
  totalWeight: number;
  totalMoment: number;
  cgArm: number;
  isWithinEnvelope?: boolean;
  weightUnits?: WeightUnits;
  armUnits?: ArmUnits;
  title?: string;
}

export const WeightBreakdownTable: React.FC<WeightBreakdownTableProps> = ({
  breakdown,
  totalWeight,
  totalMoment,
  cgArm,
  isWithinEnvelope,
  weightUnits = WeightUnits.Pounds,
  armUnits = ArmUnits.Inches,
  title,
}) => {
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';
  const armLabel = ARM_UNIT_LABELS[armUnits] || 'in';

  return (
    <Box>
      {title && (
        <Text size="sm" c="white" fw={500} mb="xs">
          {title}
        </Text>
      )}
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        styles={{
          table: {
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderColor: 'rgba(148, 163, 184, 0.2)',
          },
          thead: {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
          },
          th: {
            color: 'var(--mantine-color-gray-4)',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 12px',
          },
          td: {
            color: 'white',
            borderColor: 'rgba(148, 163, 184, 0.1)',
            fontSize: '13px',
            padding: '8px 12px',
          },
          tr: {
            '&[data-striped]': {
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
            },
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.05)',
            },
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Station</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Weight ({weightLabel})</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Arm ({armLabel})</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Moment</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {breakdown.map((station, index) => (
            <Table.Tr key={station.stationId || index}>
              <Table.Td>{station.name || 'Unknown'}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                {station.weight?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                {station.arm?.toFixed(2)}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                {station.moment?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Table.Td>
            </Table.Tr>
          ))}
          {/* Totals row */}
          <Table.Tr
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fontWeight: 600,
            }}
          >
            <Table.Td>
              <Text fw={600} c="white" size="sm">Total</Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
              <Text fw={600} c="white" size="sm">
                {totalWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
              <Badge
                color={isWithinEnvelope === undefined ? 'gray' : isWithinEnvelope ? 'green' : 'red'}
                variant="light"
                size="sm"
              >
                {cgArm.toFixed(2)}
              </Badge>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
              <Text fw={600} c="white" size="sm">
                {totalMoment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Box>
  );
};

export default WeightBreakdownTable;
