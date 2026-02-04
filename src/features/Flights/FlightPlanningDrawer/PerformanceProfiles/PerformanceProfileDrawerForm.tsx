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
  AirspeedUnits,
  SaveAircraftPerformanceProfileRequestDto,
  UpdateAircraftPerformanceProfileRequestDto,
} from '@/redux/api/vfr3d/dtos';
import {
  useSaveAircraftPerformanceProfileMutation,
  useUpdateAircraftPerformanceProfileMutation,
} from '@/redux/api/vfr3d/performanceProfiles.api';
import { useAuth } from '@/components/Auth';
import { getAirspeedUnitLabel } from '@/utility/unitConversionUtils';
import { notifyError } from '@/utility/notifications';
import classes from './PerformanceProfileDrawerForm.module.css';

interface PerformanceProfileDrawerFormProps {
  mode: 'create' | 'edit';
  existingProfile?: AircraftPerformanceProfileDto | null;
  aircraftId?: string; // Optional aircraft ID to associate profile with
  airspeedUnits?: AirspeedUnits; // Aircraft's preferred airspeed units
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
  aircraftId,
  airspeedUnits,
  onCancel,
  onSuccess,
  isModal = false,
}) => {
  const { user } = useAuth();
  const userId = user?.sub || '';

  // Get the unit label for airspeed fields
  const speedUnitLabel = getAirspeedUnitLabel(airspeedUnits);

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [saveProfile, { isLoading: isSaving, isError: isSaveError, reset: resetSave }] =
    useSaveAircraftPerformanceProfileMutation();
  const [updateProfile, { isLoading: isUpdating, isError: isUpdateError, reset: resetUpdate }] =
    useUpdateAircraftPerformanceProfileMutation();

  const isLoading = isSaving || isUpdating;
  const hasError = isSaveError || isUpdateError;

  // Initialize form with existing profile data when editing
  // Values are stored in user's preferred units on the backend, so no conversion needed
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

    // Values are stored in user's preferred units on the backend, so no conversion needed
    try {
      if (mode === 'create') {
        const request: SaveAircraftPerformanceProfileRequestDto = {
          userId,
          aircraftId: aircraftId || undefined,
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
          aircraftId: aircraftId || existingProfile.aircraftId || undefined,
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
    } catch (error) {
      notifyError({ error, operation: mode === 'create' ? 'create profile' : 'update profile' });
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
        />

        {/* Cruise Performance */}
        <Paper p="md" className={classes.sectionPaper}>
          <Group gap="xs" mb="sm">
            <Box className={classes.iconCircleBlue}>
              <FaPlane size={12} color="var(--mantine-color-vfr3dBlue-5)" />
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
              suffix={` ${speedUnitLabel}`}
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
            />
          </Group>
        </Paper>

        {/* Climb Performance */}
        <Paper p="md" className={classes.sectionPaper}>
          <Group gap="xs" mb="sm">
            <Box className={classes.iconCircleGreen}>
              <FaPlane size={12} color="var(--mantine-color-vfrGreen-5)" />
              <FaArrowUp
                size={8}
                color="var(--mantine-color-vfrGreen-5)"
                className={classes.arrowIconUp}
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
                suffix={` ${speedUnitLabel}`}
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
            />
          </Stack>
        </Paper>

        {/* Descent Performance */}
        <Paper p="md" className={classes.sectionPaper}>
          <Group gap="xs" mb="sm">
            <Box className={classes.iconCircleOrange}>
              <FaPlane size={12} color="var(--mantine-color-orange-5)" />
              <FaArrowDown
                size={8}
                color="var(--mantine-color-orange-5)"
                className={classes.arrowIconDown}
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
                suffix={` ${speedUnitLabel}`}
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
            />
          </Stack>
        </Paper>

        {/* Fuel Planning */}
        <Paper p="md" className={classes.sectionPaper}>
          <Group gap="xs" mb="sm">
            <Box className={classes.iconCirclePurple}>
              <FaGasPump size={12} color="var(--mantine-color-lifrPurple-5)" />
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
