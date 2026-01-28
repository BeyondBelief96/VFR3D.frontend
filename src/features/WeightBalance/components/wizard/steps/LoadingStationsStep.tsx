import { Alert, Text } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import { LoadingStationDto } from '@/redux/api/vfr3d/dtos';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';
import { LoadingStationsTable } from './LoadingStationsTable';

interface LoadingStationsStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  onStationsChange: (stations: LoadingStationDto[]) => void;
}

export function LoadingStationsStep({
  formState,
  errors,
  onStationsChange,
}: LoadingStationsStepProps) {
  return (
    <StepContainer
      title="Loading Stations"
      description="Define where weight can be added to your aircraft"
      tip={EDUCATIONAL_TIPS.loadingStations}
    >
      {errors.loadingStations && (
        <Alert
          icon={<FiAlertCircle size={16} />}
          color="red"
          variant="light"
          mb="md"
        >
          {errors.loadingStations}
        </Alert>
      )}

      <Text size="sm" c="dimmed" mb="md">
        Add stations for passengers, baggage, fuel, and oil. Enter the arm value (distance from datum) for each.
      </Text>

      <LoadingStationsTable
        stations={formState.loadingStations}
        weightUnits={formState.weightUnits}
        loadingGraphFormat={formState.loadingGraphFormat}
        onChange={onStationsChange}
      />
    </StepContainer>
  );
}
