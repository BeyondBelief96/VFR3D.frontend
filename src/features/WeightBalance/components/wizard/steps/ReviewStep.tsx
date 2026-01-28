import {
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  SimpleGrid,
  ThemeIcon,
  Button,
  Alert,
} from '@mantine/core';
import { FiSettings, FiUsers, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import { FaBalanceScale, FaChartArea } from 'react-icons/fa';
import { AircraftDto, LoadingStationType } from '@/redux/api/vfr3d/dtos';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';
import { WEIGHT_UNIT_LABELS, ARM_UNIT_LABELS } from '../../../constants/defaults';

interface ReviewStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  aircraft: AircraftDto[];
  onGoToStep: (step: number) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, onEdit, children }: SectionProps) {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={600} c="gray.2">
            {title}
          </Text>
        </Group>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<FiEdit2 size={12} />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </Group>
      {children}
    </Paper>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" py={4}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" c="gray.2" fw={500}>
        {value}
      </Text>
    </Group>
  );
}

export function ReviewStep({
  formState,
  errors,
  aircraft,
  onGoToStep,
}: ReviewStepProps) {
  const weightLabel = WEIGHT_UNIT_LABELS[formState.weightUnits] || 'lbs';
  const armLabel = ARM_UNIT_LABELS[formState.armUnits] || 'in';

  const selectedAircraft = aircraft.find((a) => a.id === formState.selectedAircraftId);

  const payloadStations = formState.loadingStations.filter(
    (s) => s.stationType === LoadingStationType.Standard || (!s.stationType && !s.fuelCapacityGallons && !s.oilCapacityQuarts)
  );
  const fuelStations = formState.loadingStations.filter(
    (s) => s.stationType === LoadingStationType.Fuel || s.fuelCapacityGallons
  );
  const oilStations = formState.loadingStations.filter(
    (s) => s.stationType === LoadingStationType.Oil || s.oilCapacityQuarts
  );

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <StepContainer
      title="Review & Save"
      description="Review your weight and balance profile before saving"
      tip={EDUCATIONAL_TIPS.review}
    >
      <Stack gap="md">
        {hasErrors && (
          <Alert
            icon={<FiAlertCircle size={16} />}
            color="red"
            variant="light"
            title="Please fix errors before saving"
          >
            <Stack gap="xs">
              {Object.entries(errors).map(([key, message]) => (
                <Text key={key} size="sm">
                  {message}
                </Text>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Basic Info Section */}
        <Section
          title="Basic Information"
          icon={<FiSettings size={14} />}
          onEdit={() => onGoToStep(0)}
        >
          <Stack gap={0}>
            <DataRow
              label="Aircraft"
              value={
                selectedAircraft
                  ? `${selectedAircraft.tailNumber} - ${selectedAircraft.aircraftType}`
                  : 'Not selected'
              }
            />
            <DataRow label="Profile Name" value={formState.profileName || 'Not set'} />
            <DataRow label="Datum" value={formState.datumDescription || 'Not specified'} />
            <DataRow label="Weight Units" value={formState.weightUnits} />
            <DataRow label="Arm Units" value={formState.armUnits} />
            <DataRow
              label="Loading Graph Format"
              value={formState.loadingGraphFormat === 'MomentDividedBy1000' ? 'Moment/1000' : 'Arm'}
            />
          </Stack>
        </Section>

        {/* Weight Limits Section */}
        <Section
          title="Weight Limits"
          icon={<FaBalanceScale size={14} />}
          onEdit={() => onGoToStep(1)}
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            <DataRow
              label="Empty Weight"
              value={
                formState.emptyWeight !== ''
                  ? `${formState.emptyWeight} ${weightLabel}`
                  : 'Not set'
              }
            />
            <DataRow
              label="Empty Weight Arm"
              value={
                formState.emptyWeightArm !== ''
                  ? `${formState.emptyWeightArm} ${armLabel}`
                  : 'Not set'
              }
            />
            <DataRow
              label="Max Ramp Weight"
              value={
                formState.maxRampWeight !== ''
                  ? `${formState.maxRampWeight} ${weightLabel}`
                  : 'Not set'
              }
            />
            <DataRow
              label="Max Takeoff Weight"
              value={
                formState.maxTakeoffWeight !== ''
                  ? `${formState.maxTakeoffWeight} ${weightLabel}`
                  : 'Not set'
              }
            />
            <DataRow
              label="Max Landing Weight"
              value={
                formState.maxLandingWeight !== ''
                  ? `${formState.maxLandingWeight} ${weightLabel}`
                  : 'Not set'
              }
            />
            <DataRow
              label="Max Zero Fuel Weight"
              value={
                formState.maxZeroFuelWeight !== ''
                  ? `${formState.maxZeroFuelWeight} ${weightLabel}`
                  : 'Not set'
              }
            />
          </SimpleGrid>
        </Section>

        {/* Loading Stations Section */}
        <Section
          title="Loading Stations"
          icon={<FiUsers size={14} />}
          onEdit={() => onGoToStep(2)}
        >
          <Stack gap="sm">
            {payloadStations.length > 0 && (
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Payload Stations ({payloadStations.length})
                </Text>
                <Group gap="xs" wrap="wrap">
                  {payloadStations.map((station, index) => (
                    <Badge key={index} variant="light" color="blue" size="sm">
                      {station.name || `Station ${index + 1}`}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}

            {fuelStations.length > 0 && (
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Fuel Stations ({fuelStations.length})
                </Text>
                <Group gap="xs" wrap="wrap">
                  {fuelStations.map((station, index) => (
                    <Badge key={index} variant="light" color="cyan" size="sm">
                      {station.name || `Tank ${index + 1}`}
                      {station.fuelCapacityGallons ? ` (${station.fuelCapacityGallons} gal)` : ''}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}

            {oilStations.length > 0 && (
              <div>
                <Text size="xs" c="dimmed" mb={4}>
                  Oil Stations ({oilStations.length})
                </Text>
                <Group gap="xs" wrap="wrap">
                  {oilStations.map((station, index) => (
                    <Badge key={index} variant="light" color="yellow" size="sm">
                      {station.name || `Oil ${index + 1}`}
                      {station.oilCapacityQuarts ? ` (${station.oilCapacityQuarts} qt)` : ''}
                    </Badge>
                  ))}
                </Group>
              </div>
            )}

            {formState.loadingStations.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="sm">
                No loading stations defined
              </Text>
            )}
          </Stack>
        </Section>

        {/* CG Envelopes Section */}
        <Section
          title="CG Envelopes"
          icon={<FaChartArea size={14} />}
          onEdit={() => onGoToStep(3)}
        >
          {formState.cgEnvelopes.length > 0 ? (
            <Stack gap="sm">
              {formState.cgEnvelopes.map((envelope, index) => (
                <Group key={index} justify="space-between">
                  <Group gap="xs">
                    <Badge variant="light" color="green" size="sm">
                      {envelope.name || `Envelope ${index + 1}`}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {envelope.format === 'MomentDividedBy1000' ? 'Moment/1000' : 'Arm'} format
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {envelope.limits?.length || 0} points
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="sm">
              No CG envelopes defined
            </Text>
          )}
        </Section>
      </Stack>
    </StepContainer>
  );
}
