import React from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  SimpleGrid,
  Box,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { AircraftPerformanceProfileDto, AirspeedUnits } from '@/redux/api/vfr3d/dtos';
import { getAirspeedUnitLabel } from '@/utility/unitConversionUtils';
import { ACTION_ICON_COLORS } from '@/constants/colors';

interface AircraftPerformanceProfileSelectionProps {
  profiles: AircraftPerformanceProfileDto[];
  selectedProfileId: string | null;
  onSelect: (profileId: string) => void;
  onCreate: () => void;
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  disabled?: boolean;
  airspeedUnits?: AirspeedUnits;
}

export const AircraftPerformanceProfileSelection: React.FC<
  AircraftPerformanceProfileSelectionProps
> = ({ profiles, selectedProfileId, onSelect, onCreate, onEdit, onDelete, disabled, airspeedUnits }) => {
  const speedUnitLabel = getAirspeedUnitLabel(airspeedUnits);
  if (!profiles || profiles.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Box
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FaPlane size={32} style={{ opacity: 0.5, color: 'var(--mantine-color-vfr3dBlue-5)' }} />
        </Box>
        <Text size="lg" fw={500} c="white">
          No Aircraft Profiles
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={300}>
          Create an aircraft performance profile to calculate accurate navigation logs for your
          flights.
        </Text>
        <Button leftSection={<FiPlus size={16} />} onClick={onCreate} disabled={disabled}>
          Create First Profile
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <Text fw={600} c="white">
          Select Aircraft Profile
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<FiPlus size={14} />}
          onClick={onCreate}
          disabled={disabled}
        >
          New Profile
        </Button>
      </Group>

      {/* Profile Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {profiles.map((profile) => {
          const isSelected = profile.id === selectedProfileId;
          return (
            <Box
              key={profile.id}
              onClick={() => !disabled && profile.id && onSelect(profile.id)}
              style={{
                backgroundColor: isSelected
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(30, 41, 59, 0.8)',
                border: isSelected
                  ? '2px solid var(--mantine-color-vfr3dBlue-5)'
                  : '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 'var(--mantine-radius-md)',
                padding: 'var(--mantine-spacing-md)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <Group justify="space-between" mb="xs" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isSelected
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(148, 163, 184, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaPlane
                      size={14}
                      color={isSelected ? 'var(--mantine-color-vfr3dBlue-5)' : 'var(--mantine-color-gray-5)'}
                    />
                  </Box>
                  <Text size="sm" fw={600} c="white" lineClamp={1}>
                    {profile.profileName}
                  </Text>
                </Group>

                {isSelected && (
                  <Group gap={4}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color={ACTION_ICON_COLORS.EDIT}
                      onClick={(e) => {
                        e.stopPropagation();
                        profile.id && onEdit(profile.id);
                      }}
                      disabled={disabled}
                    >
                      <FiEdit2 size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color={ACTION_ICON_COLORS.DELETE}
                      onClick={(e) => {
                        e.stopPropagation();
                        profile.id && onDelete(profile.id);
                      }}
                      disabled={disabled}
                    >
                      <FiTrash2 size={14} />
                    </ActionIcon>
                  </Group>
                )}
              </Group>

              {/* Quick Stats */}
              <Group gap="xs" mt="sm">
                <Badge size="sm" variant="light" color="blue">
                  {profile.cruiseTrueAirspeed} {speedUnitLabel}
                </Badge>
                <Badge size="sm" variant="light" color="cyan">
                  {profile.cruiseFuelBurn} gph
                </Badge>
                <Badge size="sm" variant="light" color="grape">
                  {profile.climbFpm} fpm
                </Badge>
                <Badge size="sm" variant="light" color="teal">
                  {profile.fuelOnBoardGals} gal
                </Badge>
              </Group>
            </Box>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};

export default AircraftPerformanceProfileSelection;
