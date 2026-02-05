import { Group, Button, Stack } from '@mantine/core';
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from 'react-icons/fi';
import { useIsPhone } from '@/hooks';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';
import { BORDER } from '@/constants/surfaces';

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
      <Stack gap="xs" mt="md" pt="md" style={{ borderTop: `1px solid ${BORDER.DEFAULT}` }}>
        {/* Primary action buttons */}
        <Group grow gap="xs">
          {!isFirstStep && (
            <Button
              variant="subtle"
              color={BUTTON_COLORS.BACK}
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
              gradient={BUTTON_GRADIENTS.PRIMARY}
              leftSection={<FiCheck size={14} />}
              onClick={onSubmit}
              loading={isSubmitting}
              size="sm"
            >
              {isEditMode ? 'Save' : 'Create'}
            </Button>
          ) : (
            <Button
              variant="filled"
              color={BUTTON_COLORS.NEXT}
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
          <Button variant="subtle" color={BUTTON_COLORS.SECONDARY} onClick={onCancel} size="sm">
            Cancel
          </Button>
          {isEditMode && !isLastStep && onGoToReview && (
            <Button
              variant="light"
              color={BUTTON_COLORS.CONFIRM}
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
    <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: `1px solid ${BORDER.DEFAULT}` }}>
      <Group>
        <Button variant="subtle" color={BUTTON_COLORS.SECONDARY} onClick={onCancel}>
          Cancel
        </Button>
      </Group>

      <Group>
        {!isFirstStep && (
          <Button
            variant="subtle"
            color={BUTTON_COLORS.BACK}
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
            color={BUTTON_COLORS.CONFIRM}
            leftSection={<FiSave size={16} />}
            onClick={onGoToReview}
          >
            Review & Save
          </Button>
        )}

        {isLastStep ? (
          <Button
            variant="gradient"
            gradient={BUTTON_GRADIENTS.PRIMARY}
            leftSection={<FiCheck size={16} />}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Create Profile'}
          </Button>
        ) : (
          <Button
            variant="filled"
            color={BUTTON_COLORS.NEXT}
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
