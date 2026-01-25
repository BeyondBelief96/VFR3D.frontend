import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  NumberInput,
  Paper,
  Box,
  Alert,
  Loader,
} from '@mantine/core';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { FaPlane, FaArrowUp, FaArrowDown, FaGasPump } from 'react-icons/fa';
import {
  AircraftPerformanceProfileDto,
  SaveAircraftPerformanceProfileRequestDto,
  UpdateAircraftPerformanceProfileRequestDto,
} from '@/redux/api/vfr3d/dtos';
import {
  useSaveAircraftPerformanceProfileMutation,
  useUpdateAircraftPerformanceProfileMutation,
} from '@/redux/api/vfr3d/performanceProfiles.api';
import { useAuth } from '@/components/Auth';

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
  },
};

interface PerformanceProfileDrawerFormProps {
  mode: 'create' | 'edit';
  existingProfile?: AircraftPerformanceProfileDto | null;
  onCancel: () => void;
  onSuccess: () => void;
  isModal?: boolean; // When true, hides the back button header (modal has its own)
}

interface FormData {
  profileName: string;
  cruiseTrueAirspeed: number | '';
  cruiseFuelBurn: number | '';
  climbTrueAirspeed: number | '';
  climbFuelBurn: number | '';
  climbFpm: number | '';
  descentTrueAirspeed: number | '';
  descentFuelBurn: number | '';
  descentFpm: number | '';
  sttFuelGals: number | '';
  fuelOnBoardGals: number | '';
}

const defaultFormData: FormData = {
  profileName: '',
  cruiseTrueAirspeed: '',
  cruiseFuelBurn: '',
  climbTrueAirspeed: '',
  climbFuelBurn: '',
  climbFpm: '',
  descentTrueAirspeed: '',
  descentFuelBurn: '',
  descentFpm: '',
  sttFuelGals: '',
  fuelOnBoardGals: '',
};

export const PerformanceProfileDrawerForm: React.FC<PerformanceProfileDrawerFormProps> = ({
  mode,
  existingProfile,
  onCancel,
  onSuccess,
  isModal = false,
}) => {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [saveProfile, { isLoading: isSaving, isError: isSaveError, reset: resetSave }] =
    useSaveAircraftPerformanceProfileMutation();
  const [updateProfile, { isLoading: isUpdating, isError: isUpdateError, reset: resetUpdate }] =
    useUpdateAircraftPerformanceProfileMutation();

  const isLoading = isSaving || isUpdating;
  const hasError = isSaveError || isUpdateError;

  // Initialize form with existing profile data when editing
  useEffect(() => {
    if (mode === 'edit' && existingProfile) {
      setFormData({
        profileName: existingProfile.profileName || '',
        cruiseTrueAirspeed: existingProfile.cruiseTrueAirspeed ?? '',
        cruiseFuelBurn: existingProfile.cruiseFuelBurn ?? '',
        climbTrueAirspeed: existingProfile.climbTrueAirspeed ?? '',
        climbFuelBurn: existingProfile.climbFuelBurn ?? '',
        climbFpm: existingProfile.climbFpm ?? '',
        descentTrueAirspeed: existingProfile.descentTrueAirspeed ?? '',
        descentFuelBurn: existingProfile.descentFuelBurn ?? '',
        descentFpm: existingProfile.descentFpm ?? '',
        sttFuelGals: existingProfile.sttFuelGals ?? '',
        fuelOnBoardGals: existingProfile.fuelOnBoardGals ?? '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [mode, existingProfile]);

  const handleInputChange = (field: keyof FormData, value: string | number | '') => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error state when user starts typing
    if (hasError) {
      resetSave();
      resetUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.profileName.trim()) return;

    try {
      if (mode === 'create') {
        const request: SaveAircraftPerformanceProfileRequestDto = {
          userId,
          profileName: formData.profileName,
          cruiseTrueAirspeed: formData.cruiseTrueAirspeed || undefined,
          cruiseFuelBurn: formData.cruiseFuelBurn || undefined,
          climbTrueAirspeed: formData.climbTrueAirspeed || undefined,
          climbFuelBurn: formData.climbFuelBurn || undefined,
          climbFpm: formData.climbFpm || undefined,
          descentTrueAirspeed: formData.descentTrueAirspeed || undefined,
          descentFuelBurn: formData.descentFuelBurn || undefined,
          descentFpm: formData.descentFpm || undefined,
          sttFuelGals: formData.sttFuelGals || undefined,
          fuelOnBoardGals: formData.fuelOnBoardGals || undefined,
        };
        await saveProfile(request).unwrap();
      } else if (mode === 'edit' && existingProfile?.id) {
        const request: UpdateAircraftPerformanceProfileRequestDto = {
          userId,
          profileName: formData.profileName,
          cruiseTrueAirspeed: formData.cruiseTrueAirspeed || undefined,
          cruiseFuelBurn: formData.cruiseFuelBurn || undefined,
          climbTrueAirspeed: formData.climbTrueAirspeed || undefined,
          climbFuelBurn: formData.climbFuelBurn || undefined,
          climbFpm: formData.climbFpm || undefined,
          descentTrueAirspeed: formData.descentTrueAirspeed || undefined,
          descentFuelBurn: formData.descentFuelBurn || undefined,
          descentFpm: formData.descentFpm || undefined,
          sttFuelGals: formData.sttFuelGals || undefined,
          fuelOnBoardGals: formData.fuelOnBoardGals || undefined,
        };
        await updateProfile({ id: existingProfile.id, request }).unwrap();
      }
      onSuccess();
    } catch {
      // Error is handled by RTK Query isError state
    }
  };

  const isValid = formData.profileName.trim().length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Header - only shown in drawer context, not modal */}
        {!isModal && (
          <Group gap="xs">
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<FiArrowLeft size={14} />}
              onClick={onCancel}
              disabled={isLoading}
            >
              Back
            </Button>
            <Text fw={600} c="white">
              {mode === 'create' ? 'New Aircraft Profile' : 'Edit Profile'}
            </Text>
          </Group>
        )}

        {/* Error Alert */}
        {hasError && (
          <Alert color="red" icon={<FiAlertCircle size={16} />}>
            {mode === 'create'
              ? 'Failed to create profile. Please try again.'
              : 'Failed to update profile. Please try again.'}
          </Alert>
        )}

        {/* Profile Name */}
        <TextInput
          label="Profile Name"
          placeholder="e.g., Cessna 172S"
          value={formData.profileName}
          onChange={(e) => handleInputChange('profileName', e.target.value)}
          required
          styles={inputStyles}
        />

        {/* Cruise Performance */}
        <Paper
          p="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Group gap="xs" mb="sm">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaPlane size={12} color="var(--vfr3d-primary)" />
            </Box>
            <Text size="sm" fw={500} c="white">
              Cruise Performance
            </Text>
          </Group>
          <Group grow>
            <NumberInput
              label="True Airspeed"
              placeholder="120"
              value={formData.cruiseTrueAirspeed}
              onChange={(val) => handleInputChange('cruiseTrueAirspeed', val)}
              min={0}
              max={500}
              suffix=" kts"
              styles={inputStyles}
            />
            <NumberInput
              label="Fuel Burn"
              placeholder="8.5"
              value={formData.cruiseFuelBurn}
              onChange={(val) => handleInputChange('cruiseFuelBurn', val)}
              min={0}
              max={100}
              decimalScale={1}
              suffix=" gph"
              styles={inputStyles}
            />
          </Group>
        </Paper>

        {/* Climb Performance */}
        <Paper
          p="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Group gap="xs" mb="sm">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <FaPlane size={12} color="#22c55e" />
              <FaArrowUp
                size={8}
                color="#22c55e"
                style={{ position: 'absolute', top: 2, right: 2 }}
              />
            </Box>
            <Text size="sm" fw={500} c="white">
              Climb Performance
            </Text>
          </Group>
          <Stack gap="xs">
            <Group grow>
              <NumberInput
                label="True Airspeed"
                placeholder="80"
                value={formData.climbTrueAirspeed}
                onChange={(val) => handleInputChange('climbTrueAirspeed', val)}
                min={0}
                max={500}
                suffix=" kts"
                styles={inputStyles}
              />
              <NumberInput
                label="Fuel Burn"
                placeholder="12"
                value={formData.climbFuelBurn}
                onChange={(val) => handleInputChange('climbFuelBurn', val)}
                min={0}
                max={100}
                decimalScale={1}
                suffix=" gph"
                styles={inputStyles}
              />
            </Group>
            <NumberInput
              label="Climb Rate"
              placeholder="700"
              value={formData.climbFpm}
              onChange={(val) => handleInputChange('climbFpm', val)}
              min={0}
              max={5000}
              suffix=" fpm"
              styles={inputStyles}
            />
          </Stack>
        </Paper>

        {/* Descent Performance */}
        <Paper
          p="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Group gap="xs" mb="sm">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <FaPlane size={12} color="#f97316" />
              <FaArrowDown
                size={8}
                color="#f97316"
                style={{ position: 'absolute', bottom: 2, right: 2 }}
              />
            </Box>
            <Text size="sm" fw={500} c="white">
              Descent Performance
            </Text>
          </Group>
          <Stack gap="xs">
            <Group grow>
              <NumberInput
                label="True Airspeed"
                placeholder="100"
                value={formData.descentTrueAirspeed}
                onChange={(val) => handleInputChange('descentTrueAirspeed', val)}
                min={0}
                max={500}
                suffix=" kts"
                styles={inputStyles}
              />
              <NumberInput
                label="Fuel Burn"
                placeholder="6"
                value={formData.descentFuelBurn}
                onChange={(val) => handleInputChange('descentFuelBurn', val)}
                min={0}
                max={100}
                decimalScale={1}
                suffix=" gph"
                styles={inputStyles}
              />
            </Group>
            <NumberInput
              label="Descent Rate"
              placeholder="500"
              value={formData.descentFpm}
              onChange={(val) => handleInputChange('descentFpm', val)}
              min={0}
              max={5000}
              suffix=" fpm"
              styles={inputStyles}
            />
          </Stack>
        </Paper>

        {/* Fuel Planning */}
        <Paper
          p="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Group gap="xs" mb="sm">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaGasPump size={12} color="#a855f7" />
            </Box>
            <Text size="sm" fw={500} c="white">
              Fuel Planning
            </Text>
          </Group>
          <Group grow>
            <NumberInput
              label="Start/Taxi/Takeoff"
              placeholder="1.5"
              value={formData.sttFuelGals}
              onChange={(val) => handleInputChange('sttFuelGals', val)}
              min={0}
              max={50}
              decimalScale={1}
              suffix=" gal"
              styles={inputStyles}
            />
            <NumberInput
              label="Usable Fuel Capacity"
              placeholder="53"
              value={formData.fuelOnBoardGals}
              onChange={(val) => handleInputChange('fuelOnBoardGals', val)}
              min={0}
              max={500}
              decimalScale={1}
              suffix=" gal"
              styles={inputStyles}
            />
          </Group>
        </Paper>

        {/* Action Buttons */}
        {isModal ? (
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            >
              {isLoading ? (
                <Loader size="xs" color="white" />
              ) : mode === 'create' ? (
                'Create Profile'
              ) : (
                'Save Changes'
              )}
            </Button>
          </Group>
        ) : (
          <Button type="submit" disabled={!isValid || isLoading} fullWidth>
            {isLoading ? (
              <Loader size="xs" color="white" />
            ) : mode === 'create' ? (
              'Create Profile'
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </Stack>
    </form>
  );
};

export default PerformanceProfileDrawerForm;
