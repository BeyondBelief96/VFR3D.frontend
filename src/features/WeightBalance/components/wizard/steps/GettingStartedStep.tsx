import { Stack, TextInput, Select, SimpleGrid, SegmentedControl, Box, Text } from '@mantine/core';
import { WeightUnits, ArmUnits, LoadingGraphFormat, AircraftDto } from '@/redux/api/vfr3d/dtos';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS, FIELD_DESCRIPTIONS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';

interface GettingStartedStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  aircraft: AircraftDto[];
  onFieldChange: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
  onAircraftChange: (aircraftId: string | null, aircraft?: AircraftDto) => void;
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
    color: 'var(--mantine-color-gray-3)',
    marginBottom: 4,
  },
  description: {
    color: 'var(--mantine-color-gray-5)',
    fontSize: '11px',
  },
  error: {
    color: 'var(--mantine-color-red-5)',
  },
};

export function GettingStartedStep({
  formState,
  errors,
  aircraft,
  onFieldChange,
  onAircraftChange,
}: GettingStartedStepProps) {
  const aircraftOptions = aircraft.map((a) => ({
    value: a.id || '',
    label: `${a.tailNumber || 'Unknown'} - ${a.aircraftType || 'Unknown Type'}`,
  }));

  const handleAircraftSelect = (value: string | null) => {
    const selectedAircraft = aircraft.find((a) => a.id === value);
    onAircraftChange(value, selectedAircraft);
  };

  return (
    <StepContainer
      title="Getting Started"
      description="Set up the basics for your weight and balance profile"
      tip={EDUCATIONAL_TIPS.gettingStarted}
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Select
            label="Aircraft"
            placeholder="Select an aircraft"
            description={FIELD_DESCRIPTIONS.aircraft}
            data={aircraftOptions}
            value={formState.selectedAircraftId}
            onChange={handleAircraftSelect}
            error={errors.selectedAircraftId}
            required
            searchable
            styles={{
              ...inputStyles,
              dropdown: {
                backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
              },
              option: {
                '&[data-selected]': {
                  backgroundColor: 'var(--mantine-color-vfr3dBlue-5)',
                },
                '&[data-hovered]': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                },
              },
            }}
          />

          <TextInput
            label="Profile Name"
            placeholder="e.g., Standard W&B, IFR Equipped"
            description={FIELD_DESCRIPTIONS.profileName}
            value={formState.profileName}
            onChange={(e) => onFieldChange('profileName', e.target.value)}
            error={errors.profileName}
            required
            styles={inputStyles}
          />
        </SimpleGrid>

        <TextInput
          label="Datum Description"
          placeholder="e.g., Firewall or 78.4 inches ahead of wing leading edge"
          description={FIELD_DESCRIPTIONS.datumDescription}
          value={formState.datumDescription}
          onChange={(e) => onFieldChange('datumDescription', e.target.value)}
          styles={inputStyles}
        />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Box>
            <Text size="sm" c="gray.3" mb={4}>
              Weight Units
            </Text>
            <Text size="xs" c="gray.5" mb={8}>
              {FIELD_DESCRIPTIONS.weightUnits}
            </Text>
            <SegmentedControl
              fullWidth
              value={formState.weightUnits}
              onChange={(value) => onFieldChange('weightUnits', value as WeightUnits)}
              data={[
                { label: 'Pounds (lbs)', value: WeightUnits.Pounds },
                { label: 'Kilograms (kg)', value: WeightUnits.Kilograms },
              ]}
              styles={{
                root: {
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                },
                label: {
                  color: 'var(--mantine-color-gray-4)',
                  '&[data-active]': {
                    color: 'white',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Text size="sm" c="gray.3" mb={4}>
              Arm Units
            </Text>
            <Text size="xs" c="gray.5" mb={8}>
              {FIELD_DESCRIPTIONS.armUnits}
            </Text>
            <SegmentedControl
              fullWidth
              value={formState.armUnits}
              onChange={(value) => onFieldChange('armUnits', value as ArmUnits)}
              data={[
                { label: 'Inches (in)', value: ArmUnits.Inches },
                { label: 'Centimeters (cm)', value: ArmUnits.Centimeters },
              ]}
              styles={{
                root: {
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                },
                label: {
                  color: 'var(--mantine-color-gray-4)',
                  '&[data-active]': {
                    color: 'white',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Text size="sm" c="gray.3" mb={4}>
              Loading Graph Format
            </Text>
            <Text size="xs" c="gray.5" mb={8}>
              {FIELD_DESCRIPTIONS.loadingGraphFormat}
            </Text>
            <SegmentedControl
              fullWidth
              value={formState.loadingGraphFormat}
              onChange={(value) => onFieldChange('loadingGraphFormat', value as LoadingGraphFormat)}
              data={[
                { label: 'Arm', value: LoadingGraphFormat.Arm },
                { label: 'Moment/1000', value: LoadingGraphFormat.MomentDividedBy1000 },
              ]}
              styles={{
                root: {
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                },
                label: {
                  color: 'var(--mantine-color-gray-4)',
                  '&[data-active]': {
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        </SimpleGrid>
      </Stack>
    </StepContainer>
  );
}
