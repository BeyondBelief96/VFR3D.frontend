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
import { FaGasPump } from 'react-icons/fa';
import { LoadingStationDto, LoadingGraphPointDto, ArmUnits, WeightUnits, LoadingGraphFormat } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import type { DragHandleProps } from './PayloadStationInput';

interface FuelStationInputProps {
  station: LoadingStationDto;
  index: number;
  armUnits: ArmUnits;
  weightUnits: WeightUnits;
  loadingGraphFormat: LoadingGraphFormat;
  onChange: (index: number, station: LoadingStationDto) => void;
  onRemove: (index: number) => void;
  dragHandleProps?: DragHandleProps;
}

const inputStyles = {
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: 'white',
    '&:focus': {
      borderColor: 'var(--vfr3d-primary)',
    },
  },
  label: {
    color: 'var(--mantine-color-gray-4)',
    marginBottom: 4,
    fontSize: '12px',
  },
};

export const FuelStationInput: React.FC<FuelStationInputProps> = ({
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

  const handleChange = (field: keyof LoadingStationDto, value: any) => {
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
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 'var(--mantine-radius-md)',
        borderLeft: '3px solid var(--mantine-color-cyan-6)',
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
            <FaGasPump size={14} color="var(--mantine-color-cyan-6)" />
            <Text size="xs" c="cyan" fw={500}>Fuel Tank</Text>
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
            label="Tank Name"
            placeholder="e.g., Left Main"
            value={station.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            styles={inputStyles}
            size="xs"
          />
          <NumberInput
            label="Capacity (gal)"
            placeholder="0"
            value={station.fuelCapacityGallons ?? ''}
            onChange={(value) => handleChange('fuelCapacityGallons', value)}
            min={0}
            decimalScale={1}
            styles={inputStyles}
            size="xs"
          />
          <NumberInput
            label={`Weight/Gal (${weightLabel})`}
            placeholder="6.0"
            value={station.fuelWeightPerGallon ?? ''}
            onChange={(value) => handleChange('fuelWeightPerGallon', value)}
            min={0}
            decimalScale={2}
            step={0.1}
            styles={inputStyles}
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
            styles={inputStyles}
            size="xs"
          />
          <NumberInput
            label={`Pt1 ${valueLabel}`}
            placeholder="0"
            value={station.point1?.value ?? ''}
            onChange={(value) => handlePointChange('point1', 'value', value === '' ? '' : Number(value))}
            decimalScale={2}
            styles={inputStyles}
            size="xs"
          />
          <NumberInput
            label={`Pt2 Wt (${weightLabel})`}
            placeholder="0"
            value={station.point2?.weight ?? ''}
            onChange={(value) => handlePointChange('point2', 'weight', value === '' ? '' : Number(value))}
            min={0}
            styles={inputStyles}
            size="xs"
          />
          <NumberInput
            label={`Pt2 ${valueLabel}`}
            placeholder="0"
            value={station.point2?.value ?? ''}
            onChange={(value) => handlePointChange('point2', 'value', value === '' ? '' : Number(value))}
            decimalScale={2}
            styles={inputStyles}
            size="xs"
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};

export default FuelStationInput;
