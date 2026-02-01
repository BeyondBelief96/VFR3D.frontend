import { useState, useMemo } from 'react';
import {
  Stack,
  Paper,
  Group,
  Text,
  Select,
  NumberInput,
  Button,
  Loader,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { FiSave } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { useIsPhone } from '@/hooks';
import { FlightDto, UpdateFlightRequestDto } from '@/redux/api/vfr3d/dtos';
import { useUpdateFlightMutation } from '@/redux/api/vfr3d/flights.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';

interface FlightSettingsProps {
  flight: FlightDto;
  userId: string;
}

export function FlightSettings({ flight, userId }: FlightSettingsProps) {
  const isPhone = useIsPhone();
  const [departureTime, setDepartureTime] = useState<Date | null>(
    flight.departureTime ? new Date(flight.departureTime) : null
  );
  const [altitude, setAltitude] = useState<number>(flight.plannedCruisingAltitude || 3000);
  const [profileId, setProfileId] = useState<string | null>(
    flight.aircraftPerformanceProfile?.id || null
  );
  const [aircraftId, setAircraftId] = useState<string | null>(
    flight.aircraftPerformanceProfile?.aircraftId || flight.aircraftId || null
  );
  const [hasChanges, setHasChanges] = useState(false);

  const { data: aircraftList, isLoading: isLoadingAircraft } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  const [updateFlight, { isLoading: isUpdating }] = useUpdateFlightMutation();

  const selectedAircraft = useMemo(() => {
    return aircraftList?.find((a) => a.id === aircraftId);
  }, [aircraftList, aircraftId]);

  const profiles = selectedAircraft?.performanceProfiles || [];

  // Auto-select aircraft based on current profile when data loads
  useMemo(() => {
    if (aircraftList && profileId && !aircraftId) {
      const aircraftWithProfile = aircraftList.find((a) =>
        a.performanceProfiles?.some((p) => p.id === profileId)
      );
      if (aircraftWithProfile?.id) {
        setAircraftId(aircraftWithProfile.id);
      }
    }
  }, [aircraftList, profileId, aircraftId]);

  const handleAircraftChange = (newAircraftId: string | null) => {
    setAircraftId(newAircraftId);
    setProfileId(null);
    setHasChanges(true);
  };

  const canSave = hasChanges && aircraftId !== null && profileId !== null;

  const handleSave = async () => {
    if (!flight.id || !aircraftId || !profileId) return;

    try {
      const flightUpdate: UpdateFlightRequestDto = {
        departureTime: departureTime || undefined,
        plannedCruisingAltitude: altitude,
        aircraftId: aircraftId,
        aircraftPerformanceProfileId: profileId,
      };

      await updateFlight({ userId, flightId: flight.id, flight: flightUpdate }).unwrap();

      notifications.show({
        title: 'Flight Updated',
        message: 'Flight settings saved and navigation log regenerated.',
        color: 'green',
      });

      setHasChanges(false);
    } catch {
      notifications.show({
        title: 'Update Failed',
        message: 'Unable to update flight settings.',
        color: 'red',
      });
    }
  };

  const aircraftOptions = useMemo(() => {
    return (
      aircraftList?.map((a) => ({
        value: a.id!,
        label: a.tailNumber ? `${a.aircraftType} (${a.tailNumber})` : a.aircraftType || 'Unnamed Aircraft',
      })) || []
    );
  }, [aircraftList]);

  const profileOptions = useMemo(() => {
    return profiles.map((p) => ({
      value: p.id!,
      label: p.profileName || 'Unnamed Profile',
      description: p.cruiseTrueAirspeed && p.cruiseFuelBurn
        ? `${p.cruiseTrueAirspeed} kts / ${p.cruiseFuelBurn} gph`
        : undefined,
    }));
  }, [profiles]);

  const inputStyles = {
    input: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      color: 'white',
    },
  };

  return (
    <Stack gap="lg">
      {/* Aircraft & Profile Selection */}
      <Paper
        p="lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Group gap="sm" mb="md">
          <FaPlane size={18} color="var(--mantine-color-vfr3dBlue-5)" />
          <Text fw={600} c="white">
            Aircraft & Performance
          </Text>
        </Group>

        <Stack gap="md">
          <Select
            label="Aircraft"
            placeholder={isLoadingAircraft ? 'Loading aircraft...' : 'Select an aircraft'}
            data={aircraftOptions}
            value={aircraftId}
            onChange={handleAircraftChange}
            disabled={isLoadingAircraft}
            styles={inputStyles}
            rightSection={isLoadingAircraft ? <Loader size="xs" /> : undefined}
            required
          />

          {aircraftId && (
            <Select
              label="Performance Profile"
              placeholder={profiles.length === 0 ? 'No profiles available' : 'Select a profile'}
              data={profileOptions}
              value={profileId}
              onChange={(val) => {
                setProfileId(val);
                setHasChanges(true);
              }}
              disabled={profiles.length === 0}
              styles={inputStyles}
              required
            />
          )}

          {aircraftId && profiles.length === 0 && (
            <Text size="sm" c="yellow">
              This aircraft has no performance profiles. Add profiles on the Aircraft page.
            </Text>
          )}

          {!aircraftId && aircraftList && aircraftList.length === 0 && (
            <Text size="sm" c="dimmed">
              No aircraft configured. Visit the Aircraft page to add your aircraft.
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Flight Parameters */}
      <Paper
        p="lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Text fw={600} c="white" mb="md">
          Flight Parameters
        </Text>

        <Stack gap="md">
          <DateTimePicker
            label="Departure Time (UTC)"
            placeholder="Select departure time"
            value={departureTime}
            onChange={(date) => {
              setDepartureTime(date);
              setHasChanges(true);
            }}
            styles={inputStyles}
          />

          <NumberInput
            label="Cruising Altitude (ft MSL)"
            value={altitude}
            onChange={(val) => {
              setAltitude(typeof val === 'number' ? val : 3000);
              setHasChanges(true);
            }}
            min={500}
            max={45000}
            step={500}
            styles={inputStyles}
          />

          <Group justify={isPhone ? 'center' : 'flex-end'} mt="md">
            <Button
              leftSection={<FiSave size={isPhone ? 14 : 16} />}
              onClick={handleSave}
              loading={isUpdating}
              disabled={!canSave}
              size={isPhone ? 'sm' : 'md'}
              fullWidth={isPhone}
            >
              {hasChanges && (!aircraftId || !profileId)
                ? isPhone ? 'Select Aircraft' : 'Select Aircraft & Profile'
                : 'Save Changes'}
            </Button>
          </Group>

          <Text size="xs" c="dimmed">
            Saving will automatically regenerate the navigation log with the updated settings.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
