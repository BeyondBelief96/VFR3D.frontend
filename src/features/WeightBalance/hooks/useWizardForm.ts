import { useState, useCallback } from 'react';
import {
  WeightBalanceProfileDto,
  LoadingStationDto,
  CgEnvelopeDto,
  WeightUnits,
  ArmUnits,
  LoadingGraphFormat,
  CgEnvelopeFormat,
  AircraftDto,
} from '@/redux/api/vfr3d/dtos';
import { getDefaultStationsForCategory } from '../constants/defaults';
import { VALIDATION_MESSAGES } from '../constants/wizardContent';

export interface WizardFormState {
  // Step 1 - Getting Started
  profileName: string;
  datumDescription: string;
  selectedAircraftId: string | null;
  weightUnits: WeightUnits;
  armUnits: ArmUnits;
  loadingGraphFormat: LoadingGraphFormat;

  // Step 2 - Weight Limits
  emptyWeight: number | '';
  emptyWeightArm: number | '';
  maxRampWeight: number | '';
  maxTakeoffWeight: number | '';
  maxLandingWeight: number | '';
  maxZeroFuelWeight: number | '';

  // Step 3 - Loading Stations
  loadingStations: LoadingStationDto[];

  // Step 4 - CG Envelopes
  cgEnvelopes: CgEnvelopeDto[];
}

export interface WizardValidationErrors {
  [key: string]: string | undefined;
}

export interface UseWizardFormOptions {
  mode: 'create' | 'edit';
  existingProfile?: WeightBalanceProfileDto | null;
  aircraft?: AircraftDto[];
}

export interface UseWizardFormReturn {
  // Form state
  formState: WizardFormState;

  // Navigation
  currentStep: number;
  completedSteps: Set<number>;
  canGoToStep: (step: number) => boolean;
  goToStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;

  // Validation
  errors: WizardValidationErrors;
  validateStep: (step: number) => boolean;
  validateAll: () => boolean;

  // Field updates
  updateField: <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => void;
  updateLoadingStations: (stations: LoadingStationDto[]) => void;
  updateCgEnvelopes: (envelopes: CgEnvelopeDto[]) => void;

  // Aircraft change handling
  handleAircraftChange: (aircraftId: string | null, aircraft?: AircraftDto) => void;

  // Submission
  getSubmitData: () => Omit<WeightBalanceProfileDto, 'id' | 'userId'>;

  // Mode
  mode: 'create' | 'edit';
  isEditMode: boolean;
}

const DEFAULT_FORM_STATE: WizardFormState = {
  profileName: '',
  datumDescription: '',
  selectedAircraftId: null,
  weightUnits: WeightUnits.Pounds,
  armUnits: ArmUnits.Inches,
  loadingGraphFormat: LoadingGraphFormat.Arm,
  emptyWeight: '',
  emptyWeightArm: '',
  maxRampWeight: '',
  maxTakeoffWeight: '',
  maxLandingWeight: '',
  maxZeroFuelWeight: '',
  loadingStations: [],
  cgEnvelopes: [
    {
      name: 'Normal Category',
      format: CgEnvelopeFormat.Arm,
      limits: [],
    },
  ],
};

function initializeFromProfile(profile: WeightBalanceProfileDto): WizardFormState {
  return {
    profileName: profile.profileName || '',
    datumDescription: profile.datumDescription || '',
    selectedAircraftId: profile.aircraftId || null,
    weightUnits: profile.weightUnits || WeightUnits.Pounds,
    armUnits: profile.armUnits || ArmUnits.Inches,
    loadingGraphFormat: profile.loadingGraphFormat || LoadingGraphFormat.Arm,
    emptyWeight: profile.emptyWeight ?? '',
    emptyWeightArm: profile.emptyWeightArm ?? '',
    maxRampWeight: profile.maxRampWeight ?? '',
    maxTakeoffWeight: profile.maxTakeoffWeight ?? '',
    maxLandingWeight: profile.maxLandingWeight ?? '',
    maxZeroFuelWeight: profile.maxZeroFuelWeight ?? '',
    loadingStations: profile.loadingStations || [],
    cgEnvelopes:
      profile.cgEnvelopes && profile.cgEnvelopes.length > 0
        ? profile.cgEnvelopes
        : [{ name: 'Normal Category', format: CgEnvelopeFormat.Arm, limits: [] }],
  };
}

export function useWizardForm({
  mode,
  existingProfile,
}: UseWizardFormOptions): UseWizardFormReturn {
  const [formState, setFormState] = useState<WizardFormState>(() =>
    mode === 'edit' && existingProfile
      ? initializeFromProfile(existingProfile)
      : DEFAULT_FORM_STATE
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() =>
    mode === 'edit' ? new Set([0, 1, 2, 3, 4]) : new Set()
  );
  const [errors, setErrors] = useState<WizardValidationErrors>({});

  const isEditMode = mode === 'edit';

  // Validation functions for each step
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: WizardValidationErrors = {};

      switch (step) {
        case 0: // Getting Started
          if (!formState.selectedAircraftId) {
            newErrors.selectedAircraftId = VALIDATION_MESSAGES.aircraftRequired;
          }
          if (!formState.profileName.trim()) {
            newErrors.profileName = VALIDATION_MESSAGES.profileNameRequired;
          }
          break;

        case 1: // Weight Limits
          if (formState.emptyWeight === '' || formState.emptyWeight <= 0) {
            newErrors.emptyWeight = VALIDATION_MESSAGES.positive('Empty weight');
          }
          if (formState.emptyWeightArm === '') {
            newErrors.emptyWeightArm = VALIDATION_MESSAGES.required('Empty weight arm');
          }
          if (formState.maxTakeoffWeight === '' || formState.maxTakeoffWeight <= 0) {
            newErrors.maxTakeoffWeight = VALIDATION_MESSAGES.positive('Max takeoff weight');
          }
          break;

        case 2: // Loading Stations
          const validStations = formState.loadingStations.filter(
            (s) => s.name && s.name.trim().length > 0
          );
          if (validStations.length === 0) {
            newErrors.loadingStations = VALIDATION_MESSAGES.minStations;
          }
          break;

        case 3: // CG Envelope
          if (formState.cgEnvelopes.length === 0) {
            newErrors.cgEnvelopes = VALIDATION_MESSAGES.minEnvelopes;
          } else {
            const invalidEnvelope = formState.cgEnvelopes.find(
              (env) => !env.limits || env.limits.length < 3
            );
            if (invalidEnvelope) {
              newErrors.cgEnvelopes = VALIDATION_MESSAGES.minEnvelopePoints;
            }
          }
          break;

        case 4: // Review - validate all
          return validateAll();
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formState]
  );

  const validateAll = useCallback((): boolean => {
    const allErrors: WizardValidationErrors = {};

    // Step 0 validation
    if (!formState.selectedAircraftId) {
      allErrors.selectedAircraftId = VALIDATION_MESSAGES.aircraftRequired;
    }
    if (!formState.profileName.trim()) {
      allErrors.profileName = VALIDATION_MESSAGES.profileNameRequired;
    }

    // Step 1 validation
    if (formState.emptyWeight === '' || formState.emptyWeight <= 0) {
      allErrors.emptyWeight = VALIDATION_MESSAGES.positive('Empty weight');
    }
    if (formState.emptyWeightArm === '') {
      allErrors.emptyWeightArm = VALIDATION_MESSAGES.required('Empty weight arm');
    }
    if (formState.maxTakeoffWeight === '' || formState.maxTakeoffWeight <= 0) {
      allErrors.maxTakeoffWeight = VALIDATION_MESSAGES.positive('Max takeoff weight');
    }

    // Step 2 validation
    const validStations = formState.loadingStations.filter(
      (s) => s.name && s.name.trim().length > 0
    );
    if (validStations.length === 0) {
      allErrors.loadingStations = VALIDATION_MESSAGES.minStations;
    }

    // Step 3 validation
    if (formState.cgEnvelopes.length === 0) {
      allErrors.cgEnvelopes = VALIDATION_MESSAGES.minEnvelopes;
    } else {
      const invalidEnvelope = formState.cgEnvelopes.find(
        (env) => !env.limits || env.limits.length < 3
      );
      if (invalidEnvelope) {
        allErrors.cgEnvelopes = VALIDATION_MESSAGES.minEnvelopePoints;
      }
    }

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [formState]);

  // Navigation
  const canGoToStep = useCallback(
    (step: number): boolean => {
      if (isEditMode) return true; // Edit mode can jump anywhere
      if (step <= currentStep) return true; // Can always go back
      // Can only go forward if all previous steps are completed
      for (let i = 0; i < step; i++) {
        if (!completedSteps.has(i)) return false;
      }
      return true;
    },
    [isEditMode, currentStep, completedSteps]
  );

  const goToStep = useCallback(
    (step: number) => {
      if (canGoToStep(step)) {
        setCurrentStep(step);
        setErrors({});
      }
    },
    [canGoToStep]
  );

  const nextStep = useCallback((): boolean => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      }
      return true;
    }
    return false;
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  // Field updates
  const updateField = useCallback(
    <K extends keyof WizardFormState>(field: K, value: WizardFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    []
  );

  const updateLoadingStations = useCallback((stations: LoadingStationDto[]) => {
    setFormState((prev) => ({ ...prev, loadingStations: stations }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.loadingStations;
      return newErrors;
    });
  }, []);

  const updateCgEnvelopes = useCallback((envelopes: CgEnvelopeDto[]) => {
    setFormState((prev) => ({ ...prev, cgEnvelopes: envelopes }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cgEnvelopes;
      return newErrors;
    });
  }, []);

  // Aircraft change handling
  const handleAircraftChange = useCallback(
    (aircraftId: string | null, selectedAircraft?: AircraftDto) => {
      setFormState((prev) => {
        const newState = { ...prev, selectedAircraftId: aircraftId };

        // In create mode, auto-populate default stations based on aircraft category
        if (mode === 'create' && selectedAircraft) {
          const defaultStations = getDefaultStationsForCategory(selectedAircraft.category);
          newState.loadingStations = defaultStations;
        }

        return newState;
      });

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.selectedAircraftId;
        return newErrors;
      });
    },
    [mode]
  );

  // Get data for submission
  const getSubmitData = useCallback((): Omit<WeightBalanceProfileDto, 'id' | 'userId'> => {
    return {
      aircraftId: formState.selectedAircraftId || undefined,
      profileName: formState.profileName,
      datumDescription: formState.datumDescription || undefined,
      emptyWeight: formState.emptyWeight === '' ? 0 : formState.emptyWeight,
      emptyWeightArm: formState.emptyWeightArm === '' ? 0 : formState.emptyWeightArm,
      maxRampWeight: formState.maxRampWeight === '' ? undefined : formState.maxRampWeight,
      maxTakeoffWeight: formState.maxTakeoffWeight === '' ? 0 : formState.maxTakeoffWeight,
      maxLandingWeight: formState.maxLandingWeight === '' ? undefined : formState.maxLandingWeight,
      maxZeroFuelWeight: formState.maxZeroFuelWeight === '' ? undefined : formState.maxZeroFuelWeight,
      weightUnits: formState.weightUnits,
      armUnits: formState.armUnits,
      loadingGraphFormat: formState.loadingGraphFormat,
      loadingStations: formState.loadingStations,
      cgEnvelopes: formState.cgEnvelopes,
    };
  }, [formState]);

  return {
    formState,
    currentStep,
    completedSteps,
    canGoToStep,
    goToStep,
    nextStep,
    prevStep,
    errors,
    validateStep,
    validateAll,
    updateField,
    updateLoadingStations,
    updateCgEnvelopes,
    handleAircraftChange,
    getSubmitData,
    mode,
    isEditMode,
  };
}
