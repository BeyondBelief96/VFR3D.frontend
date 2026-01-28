import { Alert, Text } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import { CgEnvelopeDto } from '@/redux/api/vfr3d/dtos';
import { StepContainer } from '../shared/StepContainer';
import { EDUCATIONAL_TIPS } from '../../../constants/wizardContent';
import { WizardFormState, WizardValidationErrors } from '../../../hooks/useWizardForm';
import { CgEnvelopeEditor } from '../../CgEnvelopeEditor';

interface CgEnvelopeStepProps {
  formState: WizardFormState;
  errors: WizardValidationErrors;
  onEnvelopesChange: (envelopes: CgEnvelopeDto[]) => void;
}

export function CgEnvelopeStep({
  formState,
  errors,
  onEnvelopesChange,
}: CgEnvelopeStepProps) {
  return (
    <StepContainer
      title="CG Envelope"
      description="Define the safe center of gravity boundaries for your aircraft"
      tip={EDUCATIONAL_TIPS.cgEnvelope}
    >
      {errors.cgEnvelopes && (
        <Alert
          icon={<FiAlertCircle size={16} />}
          color="red"
          variant="light"
          mb="md"
        >
          {errors.cgEnvelopes}
        </Alert>
      )}

      <Text size="sm" c="dimmed" mb="md">
        Copy the boundary points from your POH's CG envelope chart. Most aircraft have a "Normal Category"
        envelope; some also have a "Utility Category" envelope for more aerobatic operations.
      </Text>

      <CgEnvelopeEditor
        envelopes={formState.cgEnvelopes}
        armUnits={formState.armUnits}
        weightUnits={formState.weightUnits}
        onChange={onEnvelopesChange}
      />
    </StepContainer>
  );
}
