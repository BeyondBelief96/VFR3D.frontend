import { Group, Button } from '@mantine/core';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onGoToReview?: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onCancel,
  onGoToReview,
  isSubmitting = false,
  isEditMode = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <Group>
        <Button variant="subtle" color="gray" onClick={onCancel}>
          Cancel
        </Button>
      </Group>

      <Group>
        {!isFirstStep && (
          <Button
            variant="light"
            color="gray"
            leftSection={<FiArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
        )}

        {/* In edit mode, show "Save Changes" button on all steps except review */}
        {isEditMode && !isLastStep && onGoToReview && (
          <Button
            variant="light"
            color="teal"
            leftSection={<FiSave size={16} />}
            onClick={onGoToReview}
          >
            Review & Save
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            leftSection={<FiCheck size={16} />}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Create Profile'}
          </Button>
        ) : (
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            rightSection={<FiArrowRight size={16} />}
            onClick={onNext}
          >
            Next
          </Button>
        )}
      </Group>
    </Group>
  );
}
