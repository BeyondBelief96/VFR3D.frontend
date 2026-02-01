import { Group, Button, Stack } from '@mantine/core';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import { useIsPhone } from '@/hooks';

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
  const isPhone = useIsPhone();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  if (isPhone) {
    return (
      <Stack gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
        {/* Primary action buttons */}
        <Group grow gap="xs">
          {!isFirstStep && (
            <Button
              variant="light"
              color="gray"
              leftSection={<FiArrowLeft size={14} />}
              onClick={onBack}
              size="sm"
            >
              Back
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftSection={<FiCheck size={14} />}
              onClick={onSubmit}
              loading={isSubmitting}
              size="sm"
            >
              {isEditMode ? 'Save' : 'Create'}
            </Button>
          ) : (
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              rightSection={<FiArrowRight size={14} />}
              onClick={onNext}
              size="sm"
            >
              Next
            </Button>
          )}
        </Group>

        {/* Secondary actions */}
        <Group grow gap="xs">
          <Button variant="subtle" color="gray" onClick={onCancel} size="sm">
            Cancel
          </Button>
          {isEditMode && !isLastStep && onGoToReview && (
            <Button
              variant="light"
              color="teal"
              leftSection={<FiSave size={14} />}
              onClick={onGoToReview}
              size="sm"
            >
              Review
            </Button>
          )}
        </Group>
      </Stack>
    );
  }

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
