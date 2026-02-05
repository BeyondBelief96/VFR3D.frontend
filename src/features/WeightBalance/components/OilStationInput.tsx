import React from 'react';
import {
  Group,
  TextInput,
  NumberInput,
  ActionIcon,
  Paper,
  Stack,
  Text,
  SimpleGrid,
} from '@mantine/core';
import { FiTrash2, FiMove } from 'react-icons/fi';
import { FaOilCan } from 'react-icons/fa';
import { LoadingStationDto, LoadingGraphPointDto, ArmUnits, WeightUnits, LoadingGraphFormat } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import type { DragHandleProps } from './PayloadStationInput';
import { STATION_INPUT_STYLES, SURFACE_INNER, THEME_COLORS } from '@/constants/surfaces';

interface OilStationInputProps {
  station: LoadingStationDto;
  index: number;
  armUnits: ArmUnits;
  weightUnits: WeightUnits;
  loadingGraphFormat: LoadingGraphFormat;
  onChange: (index: number, station: LoadingStationDto) => void;
  onRemove: (index: number) => void;
  dragHandleProps?: DragHandleProps;
}


export const OilStationInput: React.FC<OilStationInputProps> = ({
  station,
  index,
  armUnits,
  weightUnits,
  loadingGraphFormat,
  onChange,
  onRemove,
  dragHandleProps,
}) => {
  const armLabel = ARM_UNIT_LABELS[armUnits] || 'in';
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';
  const valueLabel = loadingGraphFormat === LoadingGraphFormat.MomentDividedBy1000
    ? 'Mom/1000'
    : `Arm (${armLabel})`;

  const handleChange = (field: keyof LoadingStationDto, value: LoadingStationDto[keyof LoadingStationDto]) => {
    onChange(index, { ...station, [field]: value });
  };

  const handlePointChange = (pointKey: 'point1' | 'point2', field: keyof LoadingGraphPointDto, value: number | '') => {
    const currentPoint = station[pointKey] || { weight: 0, value: 0 };
    const updatedPoint = { ...currentPoint, [field]: value === '' ? 0 : value };
    onChange(index, { ...station, [pointKey]: updatedPoint });
  };

  return (
    <Paper
      p="sm"
      style={{
        backgroundColor: SURFACE_INNER.DEFAULT,
        borderRadius: 'var(--mantine-radius-md)',
        borderLeft: `3px solid ${THEME_COLORS.YELLOW_6}`,
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            {dragHandleProps && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ cursor: 'grab' }}
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
              >
                <FiMove size={12} />
              </ActionIcon>
            )}
            <FaOilCan size={14} color={THEME_COLORS.YELLOW_6} />
            <Text size="xs" c="yellow" fw={500}>Oil</Text>
          </Group>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => onRemove(index)}
          >
            <FiTrash2 size={14} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={2} spacing="xs">
          <TextInput
            label="Name"
            placeholder="e.g., Engine Oil"
            value={station.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <NumberInput
            label="Capacity (qt)"
            placeholder="8"
            value={station.oilCapacityQuarts ?? ''}
            onChange={(value) => handleChange('oilCapacityQuarts', value)}
            min={0}
            decimalScale={1}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <NumberInput
            label={`Weight/Qt (${weightLabel})`}
            placeholder="1.9"
            value={station.oilWeightPerQuart ?? ''}
            onChange={(value) => handleChange('oilWeightPerQuart', value)}
            min={0}
            decimalScale={2}
            step={0.1}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <div /> {/* Spacer for grid alignment */}
        </SimpleGrid>

        <Text size="xs" c="dimmed" mt={4}>Loading Graph Points (from POH)</Text>
        <SimpleGrid cols={4} spacing="xs">
          <NumberInput
            label={`Pt1 Wt (${weightLabel})`}
            placeholder="0"
            value={station.point1?.weight ?? ''}
            onChange={(value) => handlePointChange('point1', 'weight', value === '' ? '' : Number(value))}
            min={0}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <NumberInput
            label={`Pt1 ${valueLabel}`}
            placeholder="0"
            value={station.point1?.value ?? ''}
            onChange={(value) => handlePointChange('point1', 'value', value === '' ? '' : Number(value))}
            decimalScale={2}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <NumberInput
            label={`Pt2 Wt (${weightLabel})`}
            placeholder="0"
            value={station.point2?.weight ?? ''}
            onChange={(value) => handlePointChange('point2', 'weight', value === '' ? '' : Number(value))}
            min={0}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
          <NumberInput
            label={`Pt2 ${valueLabel}`}
            placeholder="0"
            value={station.point2?.value ?? ''}
            onChange={(value) => handlePointChange('point2', 'value', value === '' ? '' : Number(value))}
            decimalScale={2}
            styles={STATION_INPUT_STYLES}
            size="xs"
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};

export default OilStationInput;
