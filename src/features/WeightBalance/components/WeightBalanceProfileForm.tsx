import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Select,
  Button,
  Accordion,
  Divider,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiAlertTriangle } from 'react-icons/fi';
import {
  WeightBalanceProfileDto,
  CreateWeightBalanceProfileRequestDto,
  UpdateWeightBalanceProfileRequestDto,
  AircraftDto,
  WeightUnits,
  ArmUnits,
  LoadingGraphFormat,
  LoadingStationDto,
  CgEnvelopeDto,
} from '@/redux/api/vfr3d/dtos';
import { useAuth } from '@/components/Auth';
import {
  useCreateWeightBalanceProfileMutation,
  useUpdateWeightBalanceProfileMutation,
} from '@/redux/api/vfr3d/weightBalance.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { LoadingStationList } from './LoadingStationList';
import { CgEnvelopeEditor } from './CgEnvelopeEditor';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS, getDefaultStationsForCategory } from '../constants/defaults';

interface WeightBalanceProfileFormProps {
  mode: 'create' | 'edit';
  existingProfile?: WeightBalanceProfileDto | null;
  aircraftId?: string;
  onCancel: () => void;
  onSuccess: () => void;
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
  },
  description: {
    color: 'var(--mantine-color-gray-6)',
  },
};

const selectStyles = {
  ...inputStyles,
  dropdown: {
    backgroundColor: 'var(--vfr3d-surface)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  option: {
    color: 'white',
    '&[data-selected]': {
      backgroundColor: 'var(--vfr3d-primary)',
    },
    '&[data-hovered]': {
      backgroundColor: 'rgba(148, 163, 184, 0.1)',
    },
  },
};

const weightUnitOptions = [
  { value: WeightUnits.Pounds, label: 'Pounds (lbs)' },
  { value: WeightUnits.Kilograms, label: 'Kilograms (kg)' },
];

const armUnitOptions = [
  { value: ArmUnits.Inches, label: 'Inches (in)' },
  { value: ArmUnits.Centimeters, label: 'Centimeters (cm)' },
];

const loadingGraphFormatOptions = [
  { value: LoadingGraphFormat.Arm, label: 'Arm (direct arm values)' },
  { value: LoadingGraphFormat.MomentDividedBy1000, label: 'Moment / 1000' },
];

export const WeightBalanceProfileForm: React.FC<WeightBalanceProfileFormProps> = ({
  mode,
  existingProfile,
  aircraftId: initialAircraftId,
  onCancel,
  onSuccess,
}) => {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const { data: aircraft = [] } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  const [createProfile, { isLoading: isCreating }] = useCreateWeightBalanceProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateWeightBalanceProfileMutation();

  // Form state
  const [profileName, setProfileName] = useState('');
  const [datumDescription, setDatumDescription] = useState('');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [emptyWeight, setEmptyWeight] = useState<number | ''>('');
  const [emptyWeightArm, setEmptyWeightArm] = useState<number | ''>('');
  const [maxRampWeight, setMaxRampWeight] = useState<number | ''>('');
  const [maxTakeoffWeight, setMaxTakeoffWeight] = useState<number | ''>('');
  const [maxLandingWeight, setMaxLandingWeight] = useState<number | ''>('');
  const [maxZeroFuelWeight, setMaxZeroFuelWeight] = useState<number | ''>('');
  const [weightUnits, setWeightUnits] = useState<WeightUnits>(WeightUnits.Pounds);
  const [armUnits, setArmUnits] = useState<ArmUnits>(ArmUnits.Inches);
  const [loadingGraphFormat, setLoadingGraphFormat] = useState<LoadingGraphFormat>(LoadingGraphFormat.Arm);
  const [loadingStations, setLoadingStations] = useState<LoadingStationDto[]>([]);
  const [cgEnvelopes, setCgEnvelopes] = useState<CgEnvelopeDto[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize form with existing profile or defaults
  useEffect(() => {
    if (mode === 'edit' && existingProfile) {
      setProfileName(existingProfile.profileName || '');
      setDatumDescription(existingProfile.datumDescription || '');
      setSelectedAircraftId(existingProfile.aircraftId || null);
      setEmptyWeight(existingProfile.emptyWeight ?? '');
      setEmptyWeightArm(existingProfile.emptyWeightArm ?? '');
      setMaxRampWeight(existingProfile.maxRampWeight ?? '');
      setMaxTakeoffWeight(existingProfile.maxTakeoffWeight ?? '');
      setMaxLandingWeight(existingProfile.maxLandingWeight ?? '');
      setMaxZeroFuelWeight(existingProfile.maxZeroFuelWeight ?? '');
      setWeightUnits(existingProfile.weightUnits || WeightUnits.Pounds);
      setArmUnits(existingProfile.armUnits || ArmUnits.Inches);
      setLoadingGraphFormat(existingProfile.loadingGraphFormat || LoadingGraphFormat.Arm);
      setLoadingStations(existingProfile.loadingStations || []);
      setCgEnvelopes(existingProfile.cgEnvelopes || []);
      setHasInitialized(true);
    } else if (mode === 'create' && !hasInitialized) {
      // For create mode, initialize with default stations based on initial aircraft
      if (initialAircraftId) {
        setSelectedAircraftId(initialAircraftId);
        const initialAircraft = aircraft.find((a: AircraftDto) => a.id === initialAircraftId);
        if (initialAircraft) {
          setLoadingStations(getDefaultStationsForCategory(initialAircraft.category));
        } else {
          setLoadingStations(getDefaultStationsForCategory());
        }
      } else {
        // Default to single engine stations if no aircraft specified
        setLoadingStations(getDefaultStationsForCategory());
      }
      setHasInitialized(true);
    }
  }, [mode, existingProfile, initialAircraftId, aircraft, hasInitialized]);

  // Update stations when aircraft selection changes (only in create mode and after initial load)
  const handleAircraftChange = (newAircraftId: string | null) => {
    setSelectedAircraftId(newAircraftId);

    // Only auto-populate stations if creating a new profile
    if (mode === 'create') {
      const newAircraft = aircraft.find((a: AircraftDto) => a.id === newAircraftId);
      const newStations = getDefaultStationsForCategory(newAircraft?.category);
      setLoadingStations(newStations);
    }
  };

  const aircraftOptions = aircraft.map((a: AircraftDto) => ({
    value: a.id || '',
    label: `${a.aircraftType} ${a.tailNumber ? `(${a.tailNumber})` : ''}`,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAircraftId) {
      newErrors.aircraft = 'Aircraft selection is required';
    }
    if (!profileName.trim()) {
      newErrors.profileName = 'Profile name is required';
    }
    if (emptyWeight === '' || emptyWeight < 0) {
      newErrors.emptyWeight = 'Empty weight is required';
    }
    if (emptyWeightArm === '') {
      newErrors.emptyWeightArm = 'Empty weight arm is required';
    }
    if (maxTakeoffWeight === '' || maxTakeoffWeight < 0) {
      newErrors.maxTakeoffWeight = 'Max takeoff weight is required';
    }
    if (cgEnvelopes.length === 0) {
      newErrors.envelopes = 'At least one CG envelope is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!userId) {
      notifications.show({
        title: 'Error',
        message: 'You must be logged in to save a profile.',
        color: 'red',
      });
      return;
    }

    const profileData: CreateWeightBalanceProfileRequestDto | UpdateWeightBalanceProfileRequestDto = {
      aircraftId: selectedAircraftId || undefined,
      profileName: profileName.trim(),
      datumDescription: datumDescription.trim() || undefined,
      emptyWeight: Number(emptyWeight),
      emptyWeightArm: Number(emptyWeightArm),
      maxRampWeight: maxRampWeight !== '' ? Number(maxRampWeight) : undefined,
      maxTakeoffWeight: Number(maxTakeoffWeight),
      maxLandingWeight: maxLandingWeight !== '' ? Number(maxLandingWeight) : undefined,
      maxZeroFuelWeight: maxZeroFuelWeight !== '' ? Number(maxZeroFuelWeight) : undefined,
      weightUnits,
      armUnits,
      loadingGraphFormat,
      loadingStations,
      cgEnvelopes,
    };

    try {
      if (mode === 'create') {
        await createProfile({ userId, request: profileData }).unwrap();
      } else if (existingProfile?.id) {
        await updateProfile({
          userId,
          profileId: existingProfile.id,
          request: profileData,
        }).unwrap();
      }
      onSuccess();
    } catch (error: any) {
      notifications.show({
        title: mode === 'create' ? 'Create Failed' : 'Update Failed',
        message: error?.data?.message || 'Unable to save the profile. Please try again.',
        color: 'red',
      });
    }
  };

  const armLabel = ARM_UNIT_LABELS[armUnits] || 'in';
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';

  return (
    <Stack gap="md">
      <Accordion
        defaultValue={['basic', 'weights', 'stations']}
        multiple
        variant="separated"
        styles={{
          item: {
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            '&[data-active]': {
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
            },
          },
          control: {
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
          },
          label: {
            color: 'white',
            fontWeight: 500,
          },
          panel: {
            backgroundColor: 'transparent',
          },
        }}
      >
        {/* Basic Info */}
        <Accordion.Item value="basic">
          <Accordion.Control>Basic Information</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <TextInput
                label="Profile Name"
                placeholder="e.g., Standard Loading"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                error={errors.profileName}
                required
                styles={inputStyles}
              />
              <TextInput
                label="Datum Description"
                placeholder="e.g., Firewall"
                description="Reference point for all arm measurements"
                value={datumDescription}
                onChange={(e) => setDatumDescription(e.target.value)}
                styles={inputStyles}
              />
              <Select
                label="Aircraft"
                placeholder="Select aircraft"
                description={mode === 'create' ? 'Selecting an aircraft will populate default stations for that aircraft type' : undefined}
                data={aircraftOptions}
                value={selectedAircraftId}
                onChange={handleAircraftChange}
                searchable
                required
                error={errors.aircraft}
                styles={selectStyles}
              />
              <Group grow>
                <Select
                  label="Weight Units"
                  data={weightUnitOptions}
                  value={weightUnits}
                  onChange={(value) => setWeightUnits(value as WeightUnits)}
                  styles={selectStyles}
                />
                <Select
                  label="Arm Units"
                  data={armUnitOptions}
                  value={armUnits}
                  onChange={(value) => setArmUnits(value as ArmUnits)}
                  styles={selectStyles}
                />
              </Group>
              <Select
                label="Loading Graph Format"
                description="How your POH presents loading data - either as arm values or moment/1000"
                data={loadingGraphFormatOptions}
                value={loadingGraphFormat}
                onChange={(value) => setLoadingGraphFormat(value as LoadingGraphFormat)}
                styles={selectStyles}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Weight Limits */}
        <Accordion.Item value="weights">
          <Accordion.Control>Weight Limits</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Group grow>
                <NumberInput
                  label={`Empty Weight (${weightLabel})`}
                  placeholder="0"
                  value={emptyWeight}
                  onChange={(value) => setEmptyWeight(value === '' ? '' : Number(value))}
                  min={0}
                  error={errors.emptyWeight}
                  required
                  styles={inputStyles}
                />
                <NumberInput
                  label={`Empty Weight Arm (${armLabel})`}
                  placeholder="0.0"
                  value={emptyWeightArm}
                  onChange={(value) => setEmptyWeightArm(value === '' ? '' : Number(value))}
                  decimalScale={2}
                  error={errors.emptyWeightArm}
                  required
                  styles={inputStyles}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label={`Max Takeoff Weight (${weightLabel})`}
                  placeholder="0"
                  value={maxTakeoffWeight}
                  onChange={(value) => setMaxTakeoffWeight(value === '' ? '' : Number(value))}
                  min={0}
                  error={errors.maxTakeoffWeight}
                  required
                  styles={inputStyles}
                />
                <NumberInput
                  label={`Max Landing Weight (${weightLabel})`}
                  placeholder="Optional"
                  value={maxLandingWeight}
                  onChange={(value) => setMaxLandingWeight(value === '' ? '' : Number(value))}
                  min={0}
                  styles={inputStyles}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label={`Max Ramp Weight (${weightLabel})`}
                  placeholder="Optional"
                  value={maxRampWeight}
                  onChange={(value) => setMaxRampWeight(value === '' ? '' : Number(value))}
                  min={0}
                  styles={inputStyles}
                />
                <NumberInput
                  label={`Max Zero Fuel Weight (${weightLabel})`}
                  placeholder="Optional"
                  value={maxZeroFuelWeight}
                  onChange={(value) => setMaxZeroFuelWeight(value === '' ? '' : Number(value))}
                  min={0}
                  styles={inputStyles}
                />
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Loading Stations */}
        <Accordion.Item value="stations">
          <Accordion.Control>Loading Stations</Accordion.Control>
          <Accordion.Panel>
            <LoadingStationList
              stations={loadingStations}
              armUnits={armUnits}
              weightUnits={weightUnits}
              loadingGraphFormat={loadingGraphFormat}
              onChange={setLoadingStations}
            />
          </Accordion.Panel>
        </Accordion.Item>

        {/* CG Envelopes */}
        <Accordion.Item value="envelopes">
          <Accordion.Control>CG Envelopes</Accordion.Control>
          <Accordion.Panel>
            {errors.envelopes && (
              <Alert color="orange" variant="light" icon={<FiAlertTriangle size={16} />} mb="sm">
                {errors.envelopes}
              </Alert>
            )}
            <CgEnvelopeEditor
              envelopes={cgEnvelopes}
              armUnits={armUnits}
              weightUnits={weightUnits}
              onChange={setCgEnvelopes}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Divider color="dark.4" />

      <Group justify="space-between" gap="sm">
        <Button variant="subtle" color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          onClick={handleSubmit}
          loading={isCreating || isUpdating}
          size="md"
        >
          {mode === 'create' ? 'Create Profile' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
};

export default WeightBalanceProfileForm;
