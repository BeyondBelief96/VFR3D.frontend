import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Stack,
  Group,
  Select,
  NumberInput,
  Button,
  Paper,
  Text,
  Box,
  Alert,
  Divider,
  SimpleGrid,
  Badge,
  Tabs,
  Title,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Progress,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiAlertTriangle, FiActivity, FiRefreshCw, FiUsers, FiInfo, FiDroplet, FiBox, FiClock, FiSave } from 'react-icons/fi';
import { FaGasPump, FaOilCan, FaPlane } from 'react-icons/fa';
import {
  WeightBalanceProfileDto,
  AircraftDto,
  LoadingStationType,
  CgEnvelopeFormat,
  StandaloneCalculationStateDto,
} from '@/redux/api/vfr3d/dtos';
import { useAuth } from '@/components/Auth';
import { useGetWeightBalanceProfilesQuery } from '@/redux/api/vfr3d/weightBalance.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { useWeightBalanceCalculation } from '../hooks/useWeightBalanceCalculation';
import { CgEnvelopeChart } from '../visualization/CgEnvelopeChart';
import { WeightBreakdownTable } from '../visualization/WeightBreakdownTable';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS, DEFAULT_FUEL_WEIGHT } from '../constants/defaults';

interface WeightBalanceCalculatorProps {
  preselectedProfileId?: string;
  preselectedAircraftId?: string;
  compact?: boolean;
  /** Standalone state to restore from previous session */
  standaloneState?: StandaloneCalculationStateDto | null;
  /** Whether to persist calculations to the backend */
  persistCalculations?: boolean;
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

export const WeightBalanceCalculator: React.FC<WeightBalanceCalculatorProps> = ({
  preselectedProfileId,
  preselectedAircraftId,
  compact = false,
  standaloneState,
  persistCalculations = false,
}) => {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const { data: profiles = [], isLoading: profilesLoading } = useGetWeightBalanceProfilesQuery(
    userId,
    { skip: !userId }
  );

  const { data: aircraft = [] } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  // Determine initial profile selection: from standalone state, preselected, or null
  const initialProfileId = standaloneState?.profileId || preselectedProfileId || null;
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(initialProfileId);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(preselectedAircraftId || null);

  // Auto-select aircraft from standalone state or preselected profile
  useEffect(() => {
    const profileIdToUse = standaloneState?.profileId || preselectedProfileId;
    if (profileIdToUse && !selectedAircraftId) {
      const profile = profiles.find((p: WeightBalanceProfileDto) => p.id === profileIdToUse);
      if (profile?.aircraftId) {
        setSelectedAircraftId(profile.aircraftId);
      }
    }
  }, [standaloneState, preselectedProfileId, selectedAircraftId, profiles]);

  // Update selected profile when standalone state changes
  useEffect(() => {
    if (standaloneState?.profileId && !selectedProfileId) {
      setSelectedProfileId(standaloneState.profileId);
    }
  }, [standaloneState, selectedProfileId]);

  const selectedProfile = profiles.find((p: WeightBalanceProfileDto) => p.id === selectedProfileId) || null;
  const selectedAircraft = aircraft.find((a: AircraftDto) => a.id === selectedAircraftId) || null;

  const {
    stationInputs,
    fuelBurnGallons,
    selectedEnvelopeId,
    result,
    error,
    isLoading: calculationLoading,
    availableEnvelopes,
    lastCalculatedAt,
    initializeFromProfile,
    updateStationInput,
    setFuelBurnGallons,
    setSelectedEnvelopeId,
    calculateWeightBalance,
    clearInputs,
  } = useWeightBalanceCalculation(userId, selectedProfile, {
    initialState: standaloneState,
    persistCalculations,
  });

  // Track what we've initialized from to prevent reinitialization after save
  const initializedFromRef = useRef<string | null>(null);

  // Initialize when profile changes, but not when standaloneState updates after a save
  useEffect(() => {
    const currentProfileId = selectedProfile?.id || null;

    // Skip if we've already initialized from this profile and we have a result
    // This prevents reinitialization when standaloneState updates after a save
    if (initializedFromRef.current === currentProfileId && result !== null) {
      return;
    }

    // Track what we're initializing from
    initializedFromRef.current = currentProfileId;

    if (selectedProfile && standaloneState && standaloneState.profileId === selectedProfile.id) {
      // Initialize with saved state
      initializeFromProfile(selectedProfile, standaloneState);
    } else if (selectedProfile) {
      // Initialize without saved state
      initializeFromProfile(selectedProfile);
    }
  }, [selectedProfile, standaloneState, initializeFromProfile, result]);

  // Filter profiles by selected aircraft (required)
  const filteredProfiles = selectedAircraftId
    ? profiles.filter((p: WeightBalanceProfileDto) => p.aircraftId === selectedAircraftId)
    : [];

  const profileOptions = filteredProfiles.map((p: WeightBalanceProfileDto) => ({
    value: p.id || '',
    label: p.profileName || 'Unnamed Profile',
  }));

  const aircraftOptions = aircraft.map((a: AircraftDto) => ({
    value: a.id || '',
    label: `${a.tailNumber || 'N/A'} - ${a.aircraftType || 'Unknown'}`,
  }));

  const weightLabel = selectedProfile?.weightUnits ? WEIGHT_UNIT_LABELS[selectedProfile.weightUnits] : 'lbs';
  const armLabel = selectedProfile?.armUnits ? ARM_UNIT_LABELS[selectedProfile.armUnits] : 'in';

  // Find selected envelope format
  const selectedEnvelope = selectedProfile?.cgEnvelopes?.find(e => e.id === selectedEnvelopeId);
  const envelopeFormat = selectedEnvelope?.format || CgEnvelopeFormat.Arm;

  // Categorize station inputs
  const { payloadStations, fuelStations, oilStations } = useMemo(() => {
    const payload = stationInputs.filter(s => s.stationType === LoadingStationType.Standard);
    const fuel = stationInputs.filter(s => s.stationType === LoadingStationType.Fuel);
    const oil = stationInputs.filter(s => s.stationType === LoadingStationType.Oil);
    return { payloadStations: payload, fuelStations: fuel, oilStations: oil };
  }, [stationInputs]);

  // Handle aircraft selection change
  const handleAircraftChange = (value: string | null) => {
    setSelectedAircraftId(value);
    // Clear profile selection when aircraft changes
    setSelectedProfileId(null);
    clearInputs();
  };

  // Handle profile selection change
  const handleProfileChange = (value: string | null) => {
    setSelectedProfileId(value);
  };

  // Fill fuel tank to full
  const handleFillTank = (stationId: string, capacity: number | undefined) => {
    if (capacity) {
      updateStationInput(stationId, 'fuelGallons', capacity);
    }
  };

  // Calculate fuel weight for display
  const calculateFuelWeight = (gallons: number | string, weightPerGallon: number | undefined) => {
    const gal = typeof gallons === 'string' ? parseFloat(gallons) || 0 : gallons;
    const wpg = weightPerGallon || DEFAULT_FUEL_WEIGHT.AVGAS_100LL;
    return gal * wpg;
  };

  // Check if there are any fuel stations with fuel burn configured
  const hasFuelStations = fuelStations.length > 0;
  const totalFuelGallons = fuelStations.reduce((sum, s) => {
    const gal = typeof s.fuelGallons === 'string' ? parseFloat(s.fuelGallons) || 0 : s.fuelGallons || 0;
    return sum + gal;
  }, 0);

  // Calculate button disabled state
  const canCalculate = selectedProfile && stationInputs.some((input) => {
    switch (input.stationType) {
      case LoadingStationType.Fuel:
        return input.fuelGallons !== '' && Number(input.fuelGallons) > 0;
      case LoadingStationType.Oil:
        return input.oilQuarts !== '' && Number(input.oilQuarts) > 0;
      default:
        return input.weight !== '' && Number(input.weight) > 0;
    }
  });

  // Handle calculate with optional persistence notification
  const handleCalculate = async () => {
    const calcResult = await calculateWeightBalance();
    if (persistCalculations && calcResult) {
      notifications.show({
        title: 'Calculation Saved',
        message: 'Your weight & balance calculation has been saved.',
        color: 'green',
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }}>
            <FiActivity size={18} />
          </ThemeIcon>
          <Box>
            <Title order={4} c="white">Weight & Balance Calculator</Title>
            <Text size="xs" c="dimmed">Calculate takeoff and landing CG for your flight</Text>
          </Box>
        </Group>
        {lastCalculatedAt && (
          <Badge
            leftSection={<FiClock size={12} />}
            color="blue"
            variant="light"
          >
            Last calculated: {lastCalculatedAt.toLocaleString()}
          </Badge>
        )}
      </Group>

      {/* Step 1: Aircraft Selection */}
      <Paper
        p="md"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: selectedAircraftId ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color={selectedAircraftId ? 'green' : 'blue'}>
              <FaPlane size={12} />
            </ThemeIcon>
            <Text size="sm" c="white" fw={500}>
              Step 1: Select Aircraft
            </Text>
            {selectedAircraftId && (
              <Badge size="xs" color="green" variant="light">Selected</Badge>
            )}
          </Group>

          <Select
            placeholder="Choose your aircraft..."
            data={aircraftOptions}
            value={selectedAircraftId}
            onChange={handleAircraftChange}
            searchable
            styles={selectStyles}
            size="md"
            leftSection={<FaPlane size={14} />}
          />
        </Stack>
      </Paper>

      {/* Step 2: Profile Selection (only shown after aircraft selected) */}
      {selectedAircraftId && (
        <Paper
          p="md"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: selectedProfileId ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        >
          <Stack gap="sm">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color={selectedProfileId ? 'green' : 'blue'}>
                <FiBox size={12} />
              </ThemeIcon>
              <Text size="sm" c="white" fw={500}>
                Step 2: Select W&B Profile
              </Text>
              {selectedProfileId && (
                <Badge size="xs" color="green" variant="light">Selected</Badge>
              )}
            </Group>

            {profileOptions.length === 0 ? (
              <Alert color="yellow" variant="light">
                No Weight & Balance profiles found for this aircraft. Create one first.
              </Alert>
            ) : (
              <Select
                placeholder="Choose a W&B profile..."
                data={profileOptions}
                value={selectedProfileId}
                onChange={handleProfileChange}
                searchable
                disabled={profilesLoading}
                styles={selectStyles}
                size="md"
                leftSection={<FiBox size={14} />}
              />
            )}
          </Stack>
        </Paper>
      )}

      {/* Show message if no aircraft selected */}
      {!selectedAircraftId && (
        <Alert color="blue" variant="light" icon={<FiInfo size={16} />}>
          Select an aircraft to begin your weight and balance calculation.
        </Alert>
      )}

      {/* Calculator Form (only shown after profile selected) */}
      {selectedProfile && (
        <>
          {/* Aircraft Info Banner */}
          <Paper
            p="sm"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Group justify="space-between" wrap="wrap">
              <Group gap="md">
                <Box>
                  <Text size="xs" c="dimmed">Aircraft</Text>
                  <Text size="sm" c="white" fw={500}>
                    {selectedAircraft?.tailNumber} - {selectedAircraft?.aircraftType}
                  </Text>
                </Box>
                <Divider orientation="vertical" color="dark.4" />
                <Box>
                  <Text size="xs" c="dimmed">Empty Weight</Text>
                  <Text size="sm" c="white" fw={500}>
                    {selectedProfile.emptyWeight?.toLocaleString()} {weightLabel}
                  </Text>
                </Box>
                <Divider orientation="vertical" color="dark.4" />
                <Box>
                  <Text size="xs" c="dimmed">Empty CG</Text>
                  <Text size="sm" c="white" fw={500}>
                    {selectedProfile.emptyWeightArm?.toFixed(2)} {armLabel}
                  </Text>
                </Box>
                <Divider orientation="vertical" color="dark.4" />
                <Box>
                  <Text size="xs" c="dimmed">Max Takeoff</Text>
                  <Text size="sm" c="white" fw={500}>
                    {selectedProfile.maxTakeoffWeight?.toLocaleString()} {weightLabel}
                  </Text>
                </Box>
              </Group>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<FiRefreshCw size={12} />}
                onClick={clearInputs}
              >
                Clear All
              </Button>
            </Group>
          </Paper>

          {/* Passengers & Cargo Section */}
          {payloadStations.length > 0 && (
            <Paper
              p="md"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Stack gap="md">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <FiUsers size={12} />
                  </ThemeIcon>
                  <Text size="sm" c="white" fw={500}>
                    Passengers & Cargo
                  </Text>
                  <Text size="xs" c="dimmed">
                    ({payloadStations.length} station{payloadStations.length !== 1 ? 's' : ''})
                  </Text>
                </Group>

                <SimpleGrid cols={compact ? 1 : { base: 1, sm: 2 }} spacing="sm">
                  {payloadStations.map((input) => (
                    <Paper
                      key={input.stationId}
                      p="sm"
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.3)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        borderLeft: '3px solid var(--mantine-color-blue-6)',
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="white" fw={500}>{input.name}</Text>
                          {input.maxWeight > 0 && <Text size="xs" c="dimmed">Max: {input.maxWeight} {weightLabel}</Text>}
                        </Group>
                        <Group gap="xs" align="flex-end">
                          <NumberInput
                            placeholder="Enter weight"
                            value={input.weight}
                            onChange={(value) =>
                              updateStationInput(input.stationId, 'weight', value === '' ? '' : Number(value))
                            }
                            min={0}
                            max={input.maxWeight > 0 ? input.maxWeight : undefined}
                            styles={inputStyles}
                            size="sm"
                            style={{ flex: 1 }}
                            rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
                          />
                          {input.maxWeight > 0 && (
                            <Tooltip label={`Max: ${input.maxWeight} ${weightLabel}`}>
                              <Text size="xs" c="dimmed" pb={8}>
                                / {input.maxWeight}
                              </Text>
                            </Tooltip>
                          )}
                        </Group>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>
          )}

          {/* Fuel Section */}
          {fuelStations.length > 0 && (
            <Paper
              p="md"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="cyan">
                      <FaGasPump size={12} />
                    </ThemeIcon>
                    <Text size="sm" c="white" fw={500}>
                      Fuel
                    </Text>
                    <Text size="xs" c="dimmed">
                      ({fuelStations.length} tank{fuelStations.length !== 1 ? 's' : ''})
                    </Text>
                  </Group>
                  <Button
                    variant="light"
                    color="cyan"
                    size="xs"
                    onClick={() => {
                      fuelStations.forEach(s => {
                        if (s.fuelCapacityGallons) {
                          updateStationInput(s.stationId, 'fuelGallons', s.fuelCapacityGallons);
                        }
                      });
                    }}
                  >
                    Fill All Tanks
                  </Button>
                </Group>

                <SimpleGrid cols={compact ? 1 : { base: 1, sm: 2 }} spacing="sm">
                  {fuelStations.map((input) => {
                    const fuelWeight = calculateFuelWeight(input.fuelGallons || 0, input.fuelWeightPerGallon);
                    const fillPercent = input.fuelCapacityGallons
                      ? (Number(input.fuelGallons || 0) / input.fuelCapacityGallons) * 100
                      : 0;

                    return (
                      <Paper
                        key={input.stationId}
                        p="sm"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.3)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          borderLeft: '3px solid var(--mantine-color-cyan-6)',
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" c="white" fw={500}>{input.name}</Text>
                            {input.maxWeight > 0 && <Text size="xs" c="dimmed">Max: {input.maxWeight} {weightLabel}</Text>}
                          </Group>

                          <Group gap="xs" align="flex-end">
                            <NumberInput
                              placeholder="Gallons"
                              value={input.fuelGallons}
                              onChange={(value) =>
                                updateStationInput(input.stationId, 'fuelGallons', value === '' ? '' : Number(value))
                              }
                              min={0}
                              max={input.fuelCapacityGallons}
                              decimalScale={1}
                              styles={inputStyles}
                              size="sm"
                              style={{ flex: 1 }}
                              rightSection={<Text size="xs" c="dimmed">gal</Text>}
                            />
                            <Button
                              variant="light"
                              color="cyan"
                              size="sm"
                              onClick={() => handleFillTank(input.stationId, input.fuelCapacityGallons)}
                            >
                              Full
                            </Button>
                          </Group>

                          {/* Fuel info display */}
                          <Group justify="space-between" gap="xs">
                            <Group gap="xs">
                              <Text size="xs" c="cyan">
                                = {fuelWeight.toFixed(1)} {weightLabel}
                              </Text>
                              <Text size="xs" c="dimmed">
                                ({input.fuelWeightPerGallon || DEFAULT_FUEL_WEIGHT.AVGAS_100LL} {weightLabel}/gal)
                              </Text>
                            </Group>
                            {input.fuelCapacityGallons && (
                              <Text size="xs" c="dimmed">
                                {input.fuelCapacityGallons} gal max
                              </Text>
                            )}
                          </Group>

                          {input.fuelCapacityGallons && (
                            <Progress
                              value={fillPercent}
                              size="xs"
                              color="cyan"
                              style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                            />
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            </Paper>
          )}

          {/* Oil Section (only show if profile has oil stations) */}
          {oilStations.length > 0 && (
            <Paper
              p="md"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Stack gap="md">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="yellow">
                    <FaOilCan size={12} />
                  </ThemeIcon>
                  <Text size="sm" c="white" fw={500}>
                    Oil
                  </Text>
                  <Tooltip label="Only shown because this profile has oil stations configured separately from empty weight">
                    <ActionIcon variant="subtle" size="xs">
                      <FiInfo size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                <SimpleGrid cols={compact ? 1 : { base: 1, sm: 2 }} spacing="sm">
                  {oilStations.map((input) => {
                    const oilWeight = (Number(input.oilQuarts || 0)) * (input.oilWeightPerQuart || 1.875);

                    return (
                      <Paper
                        key={input.stationId}
                        p="sm"
                        style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.3)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          borderLeft: '3px solid var(--mantine-color-yellow-6)',
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" c="white" fw={500}>{input.name}</Text>
                            {input.maxWeight > 0 && <Text size="xs" c="dimmed">Max: {input.maxWeight} {weightLabel}</Text>}
                          </Group>

                          <Group gap="xs" align="flex-end">
                            <NumberInput
                              placeholder="Quarts"
                              value={input.oilQuarts}
                              onChange={(value) =>
                                updateStationInput(input.stationId, 'oilQuarts', value === '' ? '' : Number(value))
                              }
                              min={0}
                              max={input.oilCapacityQuarts}
                              decimalScale={1}
                              styles={inputStyles}
                              size="sm"
                              style={{ flex: 1 }}
                              rightSection={<Text size="xs" c="dimmed">qt</Text>}
                            />
                            {input.oilCapacityQuarts && (
                              <Button
                                variant="light"
                                color="yellow"
                                size="sm"
                                onClick={() => updateStationInput(input.stationId, 'oilQuarts', input.oilCapacityQuarts!)}
                              >
                                Full
                              </Button>
                            )}
                          </Group>

                          <Text size="xs" c="yellow">
                            = {oilWeight.toFixed(1)} {weightLabel}
                          </Text>
                        </Stack>
                      </Paper>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            </Paper>
          )}

          {/* Flight Planning Section */}
          <Paper
            p="md"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Stack gap="md">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="grape">
                  <FiDroplet size={12} />
                </ThemeIcon>
                <Text size="sm" c="white" fw={500}>
                  Flight Planning
                </Text>
              </Group>

              <SimpleGrid cols={compact ? 1 : 2} spacing="md">
                {hasFuelStations && (
                  <Box>
                    <Group gap="xs" mb={4}>
                      <Text size="xs" c="gray.4">Expected Fuel Burn</Text>
                      <Tooltip
                        label="Enter the total fuel you expect to burn during your flight. This is used to calculate your landing weight and CG to ensure you'll still be within limits when you land."
                        multiline
                        w={280}
                      >
                        <ActionIcon variant="subtle" size="xs">
                          <FiInfo size={12} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <NumberInput
                      placeholder="0"
                      value={fuelBurnGallons}
                      onChange={(value) => setFuelBurnGallons(value === '' ? '' : Number(value))}
                      min={0}
                      max={totalFuelGallons}
                      decimalScale={1}
                      styles={inputStyles}
                      size="sm"
                      rightSection={<Text size="xs" c="dimmed">gal</Text>}
                    />
                    {fuelBurnGallons && Number(fuelBurnGallons) > 0 && (
                      <Text size="xs" c="dimmed" mt={4}>
                        Landing fuel: {(totalFuelGallons - Number(fuelBurnGallons)).toFixed(1)} gal remaining
                      </Text>
                    )}
                  </Box>
                )}

                <Box>
                  <Text size="xs" c="gray.4" mb={4}>CG Envelope</Text>
                  <Select
                    data={availableEnvelopes}
                    value={selectedEnvelopeId}
                    onChange={setSelectedEnvelopeId}
                    styles={selectStyles}
                    size="sm"
                  />
                </Box>
              </SimpleGrid>

              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                size="md"
                leftSection={persistCalculations ? <FiSave size={18} /> : <FiActivity size={18} />}
                onClick={handleCalculate}
                loading={calculationLoading}
                disabled={!canCalculate}
                fullWidth
              >
                {persistCalculations ? 'Calculate & Save' : 'Calculate Weight & Balance'}
              </Button>
            </Stack>
          </Paper>

          {/* Error display */}
          {error && (
            <Alert color="red" variant="light" icon={<FiAlertTriangle size={16} />}>
              {error}
            </Alert>
          )}

          {/* Results */}
          {result && (
            <Paper
              p="md"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Tabs defaultValue="chart" styles={{
                tab: {
                  color: 'var(--mantine-color-gray-4)',
                  '&[data-active]': {
                    color: 'white',
                    borderColor: 'var(--vfr3d-primary)',
                  },
                },
              }}>
                <Tabs.List>
                  <Tabs.Tab value="chart">CG Envelope</Tabs.Tab>
                  <Tabs.Tab value="breakdown">Weight Breakdown</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="chart" pt="md">
                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <Alert color="orange" variant="light" icon={<FiAlertTriangle size={16} />} mb="md">
                      <Stack gap={4}>
                        {result.warnings.map((warning, i) => (
                          <Text key={i} size="sm">{warning}</Text>
                        ))}
                      </Stack>
                    </Alert>
                  )}

                  {/* Summary cards */}
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    {result.takeoff && (
                      <Paper
                        p="md"
                        style={{
                          backgroundColor: result.takeoff.isWithinEnvelope
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `2px solid ${result.takeoff.isWithinEnvelope ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                          borderRadius: 'var(--mantine-radius-md)',
                        }}
                      >
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" c="dimmed" fw={500}>TAKEOFF</Text>
                          <Badge
                            size="sm"
                            color={result.takeoff.isWithinEnvelope ? 'green' : 'red'}
                            variant="filled"
                          >
                            {result.takeoff.isWithinEnvelope ? '✓ WITHIN LIMITS' : '✗ OUTSIDE LIMITS'}
                          </Badge>
                        </Group>
                        <Group gap="lg">
                          <Box>
                            <Text size="xs" c="dimmed">Gross Weight</Text>
                            <Text size="lg" c="white" fw={600}>
                              {result.takeoff.totalWeight?.toLocaleString()} {weightLabel}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="xs" c="dimmed">CG Location</Text>
                            <Text size="lg" c="white" fw={600}>
                              {result.takeoff.cgArm?.toFixed(2)} {armLabel}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}

                    {result.landing && (
                      <Paper
                        p="md"
                        style={{
                          backgroundColor: result.landing.isWithinEnvelope
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: `2px solid ${result.landing.isWithinEnvelope ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                          borderRadius: 'var(--mantine-radius-md)',
                        }}
                      >
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" c="dimmed" fw={500}>LANDING</Text>
                          <Badge
                            size="sm"
                            color={result.landing.isWithinEnvelope ? 'blue' : 'red'}
                            variant="filled"
                          >
                            {result.landing.isWithinEnvelope ? '✓ WITHIN LIMITS' : '✗ OUTSIDE LIMITS'}
                          </Badge>
                        </Group>
                        <Group gap="lg">
                          <Box>
                            <Text size="xs" c="dimmed">Gross Weight</Text>
                            <Text size="lg" c="white" fw={600}>
                              {result.landing.totalWeight?.toLocaleString()} {weightLabel}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="xs" c="dimmed">CG Location</Text>
                            <Text size="lg" c="white" fw={600}>
                              {result.landing.cgArm?.toFixed(2)} {armLabel}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}
                  </SimpleGrid>

                  {/* Chart */}
                  <CgEnvelopeChart
                    envelopePoints={result.envelopeLimits || []}
                    envelopeName={result.envelopeName}
                    envelopeFormat={envelopeFormat}
                    takeoffResult={result.takeoff}
                    landingResult={result.landing}
                    armUnits={selectedProfile?.armUnits}
                    weightUnits={selectedProfile?.weightUnits}
                    height={compact ? 250 : 350}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="breakdown" pt="md">
                  {result.stationBreakdown && result.takeoff && (
                    <WeightBreakdownTable
                      breakdown={result.stationBreakdown}
                      totalWeight={result.takeoff.totalWeight || 0}
                      totalMoment={result.takeoff.totalMoment || 0}
                      cgArm={result.takeoff.cgArm || 0}
                      isWithinEnvelope={result.takeoff.isWithinEnvelope}
                      weightUnits={selectedProfile?.weightUnits}
                      armUnits={selectedProfile?.armUnits}
                      title="Takeoff Weight & Balance"
                    />
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
};

export default WeightBalanceCalculator;
