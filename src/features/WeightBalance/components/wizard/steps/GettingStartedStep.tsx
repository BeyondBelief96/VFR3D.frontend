import { Stack, TextInput, Select, SimpleGrid, SegmentedControl, Box, Text } from '@mantine/core';
import { WeightUnits, ArmUnits, LoadingGraphFormat, AircraftDto } from '@/redux/api/vfr3d/dtos';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS, FIELD_DESCRIPTIONS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';
import {
  WIZARD_INPUT_STYLES,
  SEGMENTED_CONTROL_STYLES,
  THEME_COLORS,
  BORDER,
  HIGHLIGHT,
} from '@/constants/surfaces';

interface GettingStartedStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  aircraft: AircraftDto[];
  onFieldChange: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
  onAircraftChange: (aircraftId: string | null, aircraft?: AircraftDto) => void;
}


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
              ...WIZARD_INPUT_STYLES,
              dropdown: {
                backgroundColor: THEME_COLORS.SURFACE_8,
                border: `1px solid ${BORDER.DEFAULT}`,
              },
              option: {
                '&[data-selected]': {
                  backgroundColor: THEME_COLORS.PRIMARY,
                },
                '&[data-hovered]': {
                  backgroundColor: HIGHLIGHT.DEFAULT,
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
            styles={WIZARD_INPUT_STYLES}
          />
        </SimpleGrid>

        <TextInput
          label="Datum Description"
          placeholder="e.g., Firewall or 78.4 inches ahead of wing leading edge"
          description={FIELD_DESCRIPTIONS.datumDescription}
          value={formState.datumDescription}
          onChange={(e) => onFieldChange('datumDescription', e.target.value)}
          styles={WIZARD_INPUT_STYLES}
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
              styles={SEGMENTED_CONTROL_STYLES}
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
              styles={SEGMENTED_CONTROL_STYLES}
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
              styles={SEGMENTED_CONTROL_STYLES}
            />
          </Box>
        </SimpleGrid>
      </Stack>
    </StepContainer>
  );
}
