import React from 'react';
import { Table, Text, Box, Badge } from '@mantine/core';
import { StationBreakdownDto, WeightUnits, ArmUnits } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import classes from '../WeightBalance.module.css';

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
        className={classes.breakdownTable}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Station</Table.Th>
            <Table.Th className={classes.textRight}>Weight ({weightLabel})</Table.Th>
            <Table.Th className={classes.textRight}>Arm ({armLabel})</Table.Th>
            <Table.Th className={classes.textRight}>Moment</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {breakdown.map((station, index) => (
            <Table.Tr key={station.stationId || index}>
              <Table.Td>{station.name || 'Unknown'}</Table.Td>
              <Table.Td className={classes.textRight}>
                {station.weight?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Table.Td>
              <Table.Td className={classes.textRight}>
                {station.arm?.toFixed(2)}
              </Table.Td>
              <Table.Td className={classes.textRight}>
                {station.moment?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Table.Td>
            </Table.Tr>
          ))}
          {/* Totals row */}
          <Table.Tr className={classes.totalRow}>
            <Table.Td>
              <Text fw={600} c="white" size="sm">Total</Text>
            </Table.Td>
            <Table.Td className={classes.textRight}>
              <Text fw={600} c="white" size="sm">
                {totalWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Text>
            </Table.Td>
            <Table.Td className={classes.textRight}>
              <Badge
                color={isWithinEnvelope === undefined ? 'gray' : isWithinEnvelope ? 'green' : 'red'}
                variant="light"
                size="sm"
              >
                {cgArm.toFixed(2)}
              </Badge>
            </Table.Td>
            <Table.Td className={classes.textRight}>
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
