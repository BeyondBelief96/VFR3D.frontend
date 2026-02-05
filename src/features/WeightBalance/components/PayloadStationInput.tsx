import React from 'react';
import {
  Group,
  TextInput,
  NumberInput,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { FiTrash2, FiMove } from 'react-icons/fi';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { LoadingStationDto, LoadingGraphPointDto, ArmUnits, WeightUnits, LoadingGraphFormat } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import { STATION_INPUT_STYLES, SURFACE_INNER, THEME_COLORS } from '@/constants/surfaces';

export interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
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
        borderLeft: `3px solid ${THEME_COLORS.BLUE_6}`,
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
          styles={STATION_INPUT_STYLES}
          size="xs"
          style={{ flex: 1.5, minWidth: 80 }}
        />
        <NumberInput
          label={`Max (${weightLabel})`}
          placeholder="0"
          value={station.maxWeight ?? ''}
          onChange={(value) => handleChange('maxWeight', value)}
          min={0}
          styles={STATION_INPUT_STYLES}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt1 Wt (${weightLabel})`}
          placeholder="0"
          value={station.point1?.weight ?? ''}
          onChange={(value) => handlePointChange('point1', 'weight', value === '' ? '' : Number(value))}
          min={0}
          styles={STATION_INPUT_STYLES}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt1 ${valueLabel}`}
          placeholder="0"
          value={station.point1?.value ?? ''}
          onChange={(value) => handlePointChange('point1', 'value', value === '' ? '' : Number(value))}
          decimalScale={2}
          styles={STATION_INPUT_STYLES}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt2 Wt (${weightLabel})`}
          placeholder="0"
          value={station.point2?.weight ?? ''}
          onChange={(value) => handlePointChange('point2', 'weight', value === '' ? '' : Number(value))}
          min={0}
          styles={STATION_INPUT_STYLES}
          size="xs"
          style={{ flex: 1, minWidth: 60 }}
        />
        <NumberInput
          label={`Pt2 ${valueLabel}`}
          placeholder="0"
          value={station.point2?.value ?? ''}
          onChange={(value) => handlePointChange('point2', 'value', value === '' ? '' : Number(value))}
          decimalScale={2}
          styles={STATION_INPUT_STYLES}
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
