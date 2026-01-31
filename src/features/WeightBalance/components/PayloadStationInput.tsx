import React from 'react';
import {
  Group,
  TextInput,
  NumberInput,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { FiTrash2, FiMove } from 'react-icons/fi';
import { LoadingStationDto, LoadingGraphPointDto, ArmUnits, WeightUnits, LoadingGraphFormat } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';

export interface DragHandleProps {
  attributes: any;
  listeners: any;
}

interface PayloadStationInputProps {
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
      borderColor: 'var(--mantine-color-vfr3dBlue-5)',
    },
  },
  label: {
    color: 'var(--mantine-color-gray-4)',
    marginBottom: 4,
    fontSize: '12px',
  },
};

export const PayloadStationInput: React.FC<PayloadStationInputProps> = ({
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
        borderLeft: '3px solid var(--mantine-color-blue-6)',
      }}
    >
      <Group gap="xs" align="flex-start" wrap="nowrap">
        {dragHandleProps && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            style={{ cursor: 'grab' }}
            mt={24}
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <FiMove size={14} />
          </ActionIcon>
        )}
        <TextInput
          label="Name"
          placeholder="e.g., Pilot"
          value={station.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1.5, minWidth: 80 }}
        />
        <NumberInput
          label={`Max (${weightLabel})`}
          placeholder="0"
          value={station.maxWeight ?? ''}
          onChange={(value) => handleChange('maxWeight', value)}
          min={0}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt1 Wt (${weightLabel})`}
          placeholder="0"
          value={station.point1?.weight ?? ''}
          onChange={(value) => handlePointChange('point1', 'weight', value === '' ? '' : Number(value))}
          min={0}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt1 ${valueLabel}`}
          placeholder="0"
          value={station.point1?.value ?? ''}
          onChange={(value) => handlePointChange('point1', 'value', value === '' ? '' : Number(value))}
          decimalScale={2}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt2 Wt (${weightLabel})`}
          placeholder="0"
          value={station.point2?.weight ?? ''}
          onChange={(value) => handlePointChange('point2', 'weight', value === '' ? '' : Number(value))}
          min={0}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt2 ${valueLabel}`}
          placeholder="0"
          value={station.point2?.value ?? ''}
          onChange={(value) => handlePointChange('point2', 'value', value === '' ? '' : Number(value))}
          decimalScale={2}
          styles={inputStyles}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <ActionIcon
          size="lg"
          variant="subtle"
          color="red"
          onClick={() => onRemove(index)}
          mt={24}
        >
          <FiTrash2 size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};

export default PayloadStationInput;
