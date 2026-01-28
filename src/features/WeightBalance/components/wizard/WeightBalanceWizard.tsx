import { useState } from 'react';
import { Paper, Box, Alert, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiAlertCircle } from 'react-icons/fi';
import { useAuth0 } from '@auth0/auth0-react';
import { WeightBalanceProfileDto } from '@/redux/api/vfr3d/dtos';
import {
  useCreateWeightBalanceProfileMutation,
  useUpdateWeightBalanceProfileMutation,
} from '@/redux/api/vfr3d/weightBalance.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { useWizardForm } from '../../hooks/useWizardForm';
import { WizardStepper } from './WizardStepper';
import { WizardNavigation } from './WizardNavigation';
import { GettingStartedStep } from './steps/GettingStartedStep';
import { WeightLimitsStep } from './steps/WeightLimitsStep';
import { LoadingStationsStep } from './steps/LoadingStationsStep';
import { CgEnvelopeStep } from './steps/CgEnvelopeStep';
import { ReviewStep } from './steps/ReviewStep';
import { WIZARD_STEPS } from '../../constants/wizardContent';

interface WeightBalanceWizardProps {
  mode: 'create' | 'edit';
  existingProfile?: WeightBalanceProfileDto | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function WeightBalanceWizard({
  mode,
  existingProfile,
  onCancel,
  onSuccess,
}: WeightBalanceWizardProps) {
  const { user } = useAuth0();
  const userId = user?.sub || '';

  // Fetch aircraft for selection
  const { data: aircraft = [], isLoading: isLoadingAircraft } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  // API mutations
  const [createProfile, { isLoading: isCreating }] = useCreateWeightBalanceProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateWeightBalanceProfileMutation();

  const isSubmitting = isCreating || isUpdating;

  // Wizard form state
  const {
    formState,
    currentStep,
    canGoToStep,
    goToStep,
    nextStep,
    prevStep,
    errors,
    validateAll,
    updateField,
    updateLoadingStations,
    updateCgEnvelopes,
    handleAircraftChange,
    getSubmitData,
    isEditMode,
  } = useWizardForm({
    mode,
    existingProfile,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!validateAll()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fix the errors before saving.',
        color: 'red',
        icon: <FiAlertCircle size={16} />,
      });
      return;
    }

    const submitData = getSubmitData();

    try {
      if (isEditMode && existingProfile?.id) {
        await updateProfile({
          userId,
          profileId: existingProfile.id,
          request: submitData,
        }).unwrap();
      } else {
        await createProfile({
          userId,
          request: submitData,
        }).unwrap();
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      const errorMessage = error?.data?.title || error?.message || 'Failed to save profile. Please try again.';
      setSubmitError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        icon: <FiAlertCircle size={16} />,
      });
    }
  };

  const handleStepClick = (step: number) => {
    if (canGoToStep(step)) {
      goToStep(step);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GettingStartedStep
            formState={formState}
            errors={errors}
            aircraft={aircraft}
            onFieldChange={updateField}
            onAircraftChange={handleAircraftChange}
          />
        );
      case 1:
        return (
          <WeightLimitsStep
            formState={formState}
            errors={errors}
            onFieldChange={updateField}
          />
        );
      case 2:
        return (
          <LoadingStationsStep
            formState={formState}
            errors={errors}
            onStationsChange={updateLoadingStations}
          />
        );
      case 3:
        return (
          <CgEnvelopeStep
            formState={formState}
            errors={errors}
            onEnvelopesChange={updateCgEnvelopes}
          />
        );
      case 4:
        return (
          <ReviewStep
            formState={formState}
            errors={errors}
            aircraft={aircraft}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        position: 'relative',
      }}
    >
      <LoadingOverlay
        visible={isLoadingAircraft}
        overlayProps={{ blur: 2 }}
        loaderProps={{ color: 'blue', type: 'bars' }}
      />

      {/* Stepper */}
      <Box mb="xl">
        <WizardStepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
          canGoToStep={canGoToStep}
        />
      </Box>

      {/* Submit Error */}
      {submitError && (
        <Alert
          icon={<FiAlertCircle size={16} />}
          color="red"
          variant="light"
          mb="lg"
          withCloseButton
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}

      {/* Current Step Content */}
      <Box mih={300}>{renderCurrentStep()}</Box>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={WIZARD_STEPS.length}
        onBack={prevStep}
        onNext={nextStep}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onGoToReview={() => goToStep(4)}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />
    </Paper>
  );
}
