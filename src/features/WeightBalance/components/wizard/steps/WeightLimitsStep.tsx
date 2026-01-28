import { Stack, NumberInput, SimpleGrid, Text, Paper, Group, ThemeIcon } from '@mantine/core';
import { FaBalanceScale, FaPlane } from 'react-icons/fa';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS, FIELD_DESCRIPTIONS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';
import { WEIGHT_UNIT_LABELS, ARM_UNIT_LABELS } from '../../../constants/defaults';

interface WeightLimitsStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  onFieldChange: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
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

export function WeightLimitsStep({
  formState,
  errors,
  onFieldChange,
}: WeightLimitsStepProps) {
  const weightLabel = WEIGHT_UNIT_LABELS[formState.weightUnits] || 'lbs';
  const armLabel = ARM_UNIT_LABELS[formState.armUnits] || 'in';

  return (
    <StepContainer
      title="Weight Limits"
      description="Enter your aircraft's weight limits from Section 6 of your POH"
      tip={EDUCATIONAL_TIPS.weightLimits}
    >
      <Stack gap="lg">
        {/* Empty Weight Section */}
        <Paper
          p="md"
          radius="md"
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Group gap="sm" mb="md">
            <ThemeIcon size="md" radius="xl" variant="light" color="blue">
              <FaBalanceScale size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600} c="gray.2">
              Empty Weight & CG (Required)
            </Text>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Empty Weight"
              placeholder="e.g., 1663"
              description={FIELD_DESCRIPTIONS.emptyWeight}
              value={formState.emptyWeight}
              onChange={(value) => onFieldChange('emptyWeight', value === '' ? '' : Number(value))}
              error={errors.emptyWeight}
              required
              min={0}
              rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
              styles={inputStyles}
            />

            <NumberInput
              label="Empty Weight Arm (CG)"
              placeholder="e.g., 39.1"
              description={FIELD_DESCRIPTIONS.emptyWeightArm}
              value={formState.emptyWeightArm}
              onChange={(value) => onFieldChange('emptyWeightArm', value === '' ? '' : Number(value))}
              error={errors.emptyWeightArm}
              required
              decimalScale={2}
              rightSection={<Text size="xs" c="dimmed">{armLabel}</Text>}
              styles={inputStyles}
            />
          </SimpleGrid>
        </Paper>

        {/* Maximum Weights Section */}
        <Paper
          p="md"
          radius="md"
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
          }}
        >
          <Group gap="sm" mb="md">
            <ThemeIcon size="md" radius="xl" variant="light" color="cyan">
              <FaPlane size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600} c="gray.2">
              Maximum Weights
            </Text>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Max Ramp Weight"
              placeholder="e.g., 2558"
              description={FIELD_DESCRIPTIONS.maxRampWeight}
              value={formState.maxRampWeight}
              onChange={(value) => onFieldChange('maxRampWeight', value === '' ? '' : Number(value))}
              min={0}
              rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
              styles={inputStyles}
            />

            <NumberInput
              label="Max Takeoff Weight (MTOW)"
              placeholder="e.g., 2550"
              description={FIELD_DESCRIPTIONS.maxTakeoffWeight}
              value={formState.maxTakeoffWeight}
              onChange={(value) => onFieldChange('maxTakeoffWeight', value === '' ? '' : Number(value))}
              error={errors.maxTakeoffWeight}
              required
              min={0}
              rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
              styles={inputStyles}
            />

            <NumberInput
              label="Max Landing Weight"
              placeholder="e.g., 2550"
              description={FIELD_DESCRIPTIONS.maxLandingWeight}
              value={formState.maxLandingWeight}
              onChange={(value) => onFieldChange('maxLandingWeight', value === '' ? '' : Number(value))}
              min={0}
              rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
              styles={inputStyles}
            />

            <NumberInput
              label="Max Zero Fuel Weight"
              placeholder="e.g., 2200"
              description={FIELD_DESCRIPTIONS.maxZeroFuelWeight}
              value={formState.maxZeroFuelWeight}
              onChange={(value) => onFieldChange('maxZeroFuelWeight', value === '' ? '' : Number(value))}
              min={0}
              rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
              styles={inputStyles}
            />
          </SimpleGrid>
        </Paper>
      </Stack>
    </StepContainer>
  );
}
