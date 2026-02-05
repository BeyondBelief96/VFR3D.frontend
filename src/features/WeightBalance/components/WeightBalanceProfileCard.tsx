import React from 'react';
import {
  Paper,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Box,
} from '@mantine/core';
import { FiEdit2, FiTrash2, FiActivity } from 'react-icons/fi';
import { WeightBalanceProfileDto } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';
import { useIsPhone } from '@/hooks';
import { ACTION_ICON_COLORS } from '@/constants/colors';

interface WeightBalanceProfileCardProps {
  profile: WeightBalanceProfileDto;
  onEdit: (profile: WeightBalanceProfileDto) => void;
  onDelete: (profileId: string) => void;
  onCalculate: (profile: WeightBalanceProfileDto) => void;
  isDeleting?: boolean;
}

export const WeightBalanceProfileCard: React.FC<WeightBalanceProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
  onCalculate,
  isDeleting = false,
}) => {
  const isPhone = useIsPhone();
  const weightLabel = profile.weightUnits ? WEIGHT_UNIT_LABELS[profile.weightUnits] : 'lbs';
  const armLabel = profile.armUnits ? ARM_UNIT_LABELS[profile.armUnits] : 'in';

  const stationCount = profile.loadingStations?.length || 0;
  const envelopeCount = profile.cgEnvelopes?.length || 0;

  return (
    <Paper
      p={isPhone ? 'xs' : 'sm'}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap" gap={isPhone ? 'xs' : 'sm'}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white" lineClamp={1}>
              {profile.profileName || 'Unnamed Profile'}
            </Text>
            {profile.datumDescription && !isPhone && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                Datum: {profile.datumDescription}
              </Text>
            )}
          </Box>
          <Group gap={isPhone ? 'xs' : 4} wrap="nowrap">
            <ActionIcon
              size={isPhone ? 'lg' : 'sm'}
              variant="subtle"
              color={ACTION_ICON_COLORS.ADD}
              onClick={() => onCalculate(profile)}
              title="Calculate W&B"
            >
              <FiActivity size={isPhone ? 18 : 14} />
            </ActionIcon>
            <ActionIcon
              size={isPhone ? 'lg' : 'sm'}
              variant="subtle"
              color={ACTION_ICON_COLORS.EDIT}
              onClick={() => onEdit(profile)}
            >
              <FiEdit2 size={isPhone ? 18 : 14} />
            </ActionIcon>
            <ActionIcon
              size={isPhone ? 'lg' : 'sm'}
              variant="subtle"
              color={ACTION_ICON_COLORS.DELETE}
              onClick={() => profile.id && onDelete(profile.id)}
              loading={isDeleting}
            >
              <FiTrash2 size={isPhone ? 18 : 14} />
            </ActionIcon>
          </Group>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Badge size="xs" variant="light" color="blue">
            {profile.emptyWeight?.toLocaleString()} {weightLabel} empty
          </Badge>
          <Badge size="xs" variant="light" color="cyan">
            {profile.maxTakeoffWeight?.toLocaleString()} {weightLabel} MTOW
          </Badge>
        </Group>

        <Group gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">
            {stationCount} station{stationCount !== 1 ? 's' : ''}
          </Text>
          <Text size="xs" c="dimmed">
            {envelopeCount} envelope{envelopeCount !== 1 ? 's' : ''}
          </Text>
          {!isPhone && (
            <Text size="xs" c="dimmed">
              CG: {profile.emptyWeightArm?.toFixed(1)} {armLabel}
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};

export default WeightBalanceProfileCard;
