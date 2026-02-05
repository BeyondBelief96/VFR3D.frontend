import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stack, Group, Text, NumberInput, Switch, Paper, Box, Alert } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FiInfo, FiClock, FiArrowUp } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { RootState, AppDispatch } from '@/redux/store';
import { updateDraftPlanSettings } from '@/redux/slices/flightPlanningSlice';
import { SURFACE, BORDER, ICON_BG, HIGHLIGHT, INPUT_STYLES, THEME_COLORS } from '@/constants/surfaces';
// Enable dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const inputStyles = {
  input: {
    ...INPUT_STYLES.input,
  },
  label: {
    ...INPUT_STYLES.label,
    marginBottom: 4,
  },
};

interface AltitudeAndDepartureControlsProps {
  disabled?: boolean;
}

export const AltitudeAndDepartureControls: React.FC<AltitudeAndDepartureControlsProps> = ({
  disabled = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    plannedCruisingAltitude,
    departureTimeUtc,
    roundTrip,
    returnPlannedCruisingAltitude,
    returnDepartureTimeUtc,
    waypoints,
  } = useSelector((state: RootState) => state.flightPlanning.draftFlightPlan);

  const vfrAltitudeGuidance = useMemo(() => {
    // Basic guidance without calculating course
    // In a production app, you'd calculate the average course from the leg data
    return {
      eastbound: 'Eastbound (0°-179°): Odd thousands + 500ft (3,500, 5,500, 7,500...)',
      westbound: 'Westbound (180°-359°): Even thousands + 500ft (4,500, 6,500, 8,500...)',
    };
  }, []);

  // Get local timezone offset for display
  const timezoneOffset = useMemo(() => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const mins = Math.abs(offset % 60);
    const sign = offset <= 0 ? '+' : '-';
    return `UTC${sign}${hours}${mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ''}`;
  }, []);

  const handleAltitudeChange = (value: number | string) => {
    if (typeof value === 'number') {
      dispatch(updateDraftPlanSettings({ plannedCruisingAltitude: value }));
    }
  };

  const handleDepartureTimeChange = (date: Date | null) => {
    if (date) {
      dispatch(updateDraftPlanSettings({ departureTimeUtc: dayjs(date).utc().toISOString() }));
    }
  };

  const handleRoundTripChange = (checked: boolean) => {
    dispatch(updateDraftPlanSettings({ roundTrip: checked }));
  };

  const handleReturnAltitudeChange = (value: number | string) => {
    if (typeof value === 'number') {
      dispatch(updateDraftPlanSettings({ returnPlannedCruisingAltitude: value }));
    }
  };

  const handleReturnDepartureTimeChange = (date: Date | null) => {
    if (date) {
      dispatch(updateDraftPlanSettings({ returnDepartureTimeUtc: dayjs(date).utc().toISOString() }));
    }
  };

  // Convert UTC string to local Date for the picker
  const departureDate = useMemo(() => {
    return dayjs(departureTimeUtc).toDate();
  }, [departureTimeUtc]);

  const returnDepartureDate = useMemo(() => {
    return dayjs(returnDepartureTimeUtc).toDate();
  }, [returnDepartureTimeUtc]);

  return (
    <Stack gap="md">
      {/* Outbound Flight Section */}
      <Paper
        p="md"
        style={{
          backgroundColor: SURFACE.CARD,
          border: `1px solid ${BORDER.SUBTLE}`,
        }}
      >
        <Group gap="xs" mb="md">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: ICON_BG.GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaPlane size={14} color={THEME_COLORS.SUCCESS} />
          </Box>
          <Text fw={600} c="white">
            Outbound Flight
          </Text>
        </Group>

        <Stack gap="md">
          {/* Cruising Altitude */}
          <Box>
            <NumberInput
              label="Planned Cruising Altitude"
              value={plannedCruisingAltitude}
              onChange={handleAltitudeChange}
              min={1000}
              max={18000}
              step={500}
              suffix=" ft"
              disabled={disabled}
              styles={inputStyles}
              leftSection={<FiArrowUp size={16} />}
            />
          </Box>

          {/* Departure Time */}
          <Box>
            <DateTimePicker
              label={`Departure Time (Local - ${timezoneOffset})`}
              value={departureDate}
              onChange={handleDepartureTimeChange}
              minDate={new Date()}
              disabled={disabled}
              styles={inputStyles}
              leftSection={<FiClock size={16} />}
              valueFormat="MMM D, YYYY h:mm A"
              clearable={false}
            />
            <Text size="xs" c="dimmed" mt={4}>
              UTC: {dayjs(departureTimeUtc).utc().format('MMM D, YYYY HH:mm')}Z
            </Text>
          </Box>
        </Stack>
      </Paper>

      {/* VFR Altitude Guidance */}
      <Alert
        icon={<FiInfo size={16} />}
        color="blue"
        variant="light"
        styles={{
          root: {
            backgroundColor: HIGHLIGHT.LIGHT,
            border: `1px solid ${HIGHLIGHT.DEFAULT}`,
          },
        }}
      >
        <Text size="xs" fw={500} mb={4}>
          VFR Cruising Altitudes (above 3,000ft AGL)
        </Text>
        <Text size="xs" c="dimmed">
          {vfrAltitudeGuidance.eastbound}
        </Text>
        <Text size="xs" c="dimmed">
          {vfrAltitudeGuidance.westbound}
        </Text>
      </Alert>

      {/* Round Trip Toggle */}
      <Paper
        p="md"
        style={{
          backgroundColor: SURFACE.CARD_HOVER,
          border: `1px solid ${BORDER.SUBTLE}`,
        }}
      >
        <Switch
          label="Plan Round Trip"
          description="Calculate navigation for both outbound and return flights"
          checked={roundTrip}
          onChange={(e) => handleRoundTripChange(e.currentTarget.checked)}
          disabled={disabled}
          styles={{
            label: { color: 'white' },
            description: { color: 'var(--mantine-color-gray-5)' },
          }}
        />
      </Paper>

      {/* Return Flight Section (conditional) */}
      {roundTrip && (
        <Paper
          p="md"
          style={{
            backgroundColor: SURFACE.CARD,
            border: `1px solid ${BORDER.SUBTLE}`,
          }}
        >
          <Group gap="xs" mb="md">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: ICON_BG.RED,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaPlane size={14} color={THEME_COLORS.ERROR} style={{ transform: 'scaleX(-1)' }} />
            </Box>
            <Text fw={600} c="white">
              Return Flight
            </Text>
          </Group>

          <Stack gap="md">
            {/* Return Cruising Altitude */}
            <Box>
              <NumberInput
                label="Return Cruising Altitude"
                value={returnPlannedCruisingAltitude}
                onChange={handleReturnAltitudeChange}
                min={1000}
                max={18000}
                step={500}
                suffix=" ft"
                disabled={disabled}
                styles={inputStyles}
                leftSection={<FiArrowUp size={16} />}
              />
            </Box>

            {/* Return Departure Time */}
            <Box>
              <DateTimePicker
                label={`Return Departure Time (Local - ${timezoneOffset})`}
                value={returnDepartureDate}
                onChange={handleReturnDepartureTimeChange}
                minDate={departureDate}
                disabled={disabled}
                styles={inputStyles}
                leftSection={<FiClock size={16} />}
                valueFormat="MMM D, YYYY h:mm A"
                clearable={false}
              />
              <Text size="xs" c="dimmed" mt={4}>
                UTC: {dayjs(returnDepartureTimeUtc).utc().format('MMM D, YYYY HH:mm')}Z
              </Text>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Flight Summary */}
      {waypoints.length >= 2 && (
        <Paper
          p="sm"
          style={{
            backgroundColor: SURFACE.CARD_HOVER,
            border: `1px solid ${BORDER.SUBTLE}`,
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Route
            </Text>
            <Text size="sm" fw={500} c="white">
              {waypoints[0].name} → {waypoints[waypoints.length - 1].name}
              {roundTrip && ` → ${waypoints[0].name}`}
            </Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
};

export default AltitudeAndDepartureControls;
