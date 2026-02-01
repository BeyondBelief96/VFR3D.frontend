import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  WeightBalanceProfileDto,
  WeightBalanceCalculationRequestDto,
  WeightBalanceCalculationResultDto,
  WeightBalanceCalculationDto,
  StationLoadDto,
  LoadingStationDto,
  LoadingStationType,
  StandaloneCalculationStateDto,
  SaveWeightBalanceCalculationRequestDto,
} from '@/redux/api/vfr3d/dtos';
import {
  useCalculateWeightBalanceMutation,
  useCalculateAndSaveMutation,
} from '@/redux/api/vfr3d/weightBalance.api';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a loading station with its current input values.
 * Used internally to track user input for each station in the profile.
 */
export interface StationInput {
  stationId: string;
  name: string;
  maxWeight: number;
  stationType: LoadingStationType;
  // Fuel station fields
  fuelCapacityGallons?: number;
  fuelWeightPerGallon?: number;
  // Oil station fields
  oilCapacityQuarts?: number;
  oilWeightPerQuart?: number;
  // Current input values (empty string = no value entered)
  weight: number | '';
  fuelGallons: number | '';
  oilQuarts: number | '';
}

/**
 * Saved state that can be used to restore the calculator form.
 * This is a union type that accepts either:
 * - WeightBalanceCalculationDto: Full saved calculation with results (from flight)
 * - StandaloneCalculationStateDto: Just the inputs without results (from standalone calc)
 */
export type SavedCalculationState = WeightBalanceCalculationDto | StandaloneCalculationStateDto;

/**
 * Options for the useWeightBalanceCalculation hook.
 */
export interface UseWeightBalanceCalculationOptions {
  /**
   * Existing saved state to restore. If this contains result data (takeoff/landing),
   * the chart will display immediately without needing to recalculate.
   */
  initialState?: SavedCalculationState | null;

  /**
   * Pre-populated fuel burn value (e.g., from a flight's nav log).
   * Takes precedence over initialState.fuelBurnGallons if provided.
   */
  autoFuelBurn?: number;

  /**
   * Flight ID for flight-associated calculations.
   * When set, calculations are saved linked to this flight.
   */
  flightId?: string;

  /**
   * Whether to persist calculations to the backend when calculating.
   * - true: Uses calculateAndSave endpoint, saves to database
   * - false: Uses calculate endpoint, result is ephemeral
   */
  persistCalculations?: boolean;

  /**
   * Whether to automatically calculate on initial load if there are valid saved inputs.
   * This is useful when restoring a standaloneState that has inputs but no results.
   * Default: false
   */
  autoCalculateOnLoad?: boolean;
}

/**
 * Return type for the useWeightBalanceCalculation hook.
 */
export interface UseWeightBalanceCalculationReturn {
  // Current form state
  stationInputs: StationInput[];
  fuelBurnGallons: number | '';
  selectedEnvelopeId: string | null;

  // Calculation result (null if not yet calculated)
  result: WeightBalanceCalculationResultDto | null;

  // Error message if calculation failed
  error: string | null;

  // Loading state during API calls
  isLoading: boolean;

  // Available CG envelopes from the profile
  availableEnvelopes: { value: string; label: string }[];

  // Timestamp of last successful calculation
  lastCalculatedAt: Date | null;

  // Whether any input values have changed from the saved state
  hasChanges: boolean;

  // Actions
  updateStationInput: (stationId: string, field: 'weight' | 'fuelGallons' | 'oilQuarts', value: number | '') => void;
  setFuelBurnGallons: (value: number | '') => void;
  setSelectedEnvelopeId: (id: string | null) => void;
  calculateWeightBalance: () => Promise<WeightBalanceCalculationResultDto | null>;
  clearInputs: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type guard to check if saved state has full result data.
 * WeightBalanceCalculationDto has takeoff/landing results we can display immediately.
 */
function hasResultData(state: SavedCalculationState): state is WeightBalanceCalculationDto {
  return 'takeoff' in state && state.takeoff !== undefined;
}

/**
 * Creates station inputs from a profile's loading stations.
 */
function createStationInputsFromProfile(profile: WeightBalanceProfileDto): StationInput[] {
  if (!profile.loadingStations) return [];

  return profile.loadingStations.map((station: LoadingStationDto, index: number) => ({
    stationId: station.id || `station-${index}`,
    name: station.name || '',
    maxWeight: station.maxWeight || 0,
    stationType: station.stationType || LoadingStationType.Standard,
    fuelCapacityGallons: station.fuelCapacityGallons,
    fuelWeightPerGallon: station.fuelWeightPerGallon,
    oilCapacityQuarts: station.oilCapacityQuarts,
    oilWeightPerQuart: station.oilWeightPerQuart,
    weight: '',
    fuelGallons: '',
    oilQuarts: '',
  }));
}

/**
 * Applies saved station loads to station inputs.
 */
function applyLoadedStations(
  inputs: StationInput[],
  loadedStations: StationLoadDto[] | undefined
): StationInput[] {
  if (!loadedStations?.length) return inputs;

  return inputs.map((input) => {
    const savedLoad = loadedStations.find((s) => s.stationId === input.stationId);
    if (!savedLoad) return input;

    return {
      ...input,
      weight: savedLoad.weight ?? '',
      fuelGallons: savedLoad.fuelGallons ?? '',
      oilQuarts: savedLoad.oilQuarts ?? '',
    };
  });
}

/**
 * Converts current station inputs to StationLoadDto array for API calls.
 * Only includes stations with non-empty values.
 */
function buildLoadedStations(stationInputs: StationInput[]): StationLoadDto[] {
  return stationInputs
    .filter((input) => {
      switch (input.stationType) {
        case LoadingStationType.Fuel:
          return input.fuelGallons !== '' && Number(input.fuelGallons) > 0;
        case LoadingStationType.Oil:
          return input.oilQuarts !== '' && Number(input.oilQuarts) > 0;
        default:
          return input.weight !== '' && Number(input.weight) > 0;
      }
    })
    .map((input) => {
      const load: StationLoadDto = { stationId: input.stationId };
      switch (input.stationType) {
        case LoadingStationType.Fuel:
          load.fuelGallons = Number(input.fuelGallons) || undefined;
          break;
        case LoadingStationType.Oil:
          load.oilQuarts = Number(input.oilQuarts) || undefined;
          break;
        default:
          load.weight = Number(input.weight) || undefined;
      }
      return load;
    });
}

/**
 * Serializes current inputs for comparison (change detection).
 */
function serializeInputs(
  stationInputs: StationInput[],
  fuelBurnGallons: number | '',
  envelopeId: string | null
): string {
  const loads = buildLoadedStations(stationInputs);
  return JSON.stringify({ loads, fuelBurnGallons, envelopeId });
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing weight and balance calculations.
 *
 * This hook provides:
 * - Form state management for loading station inputs
 * - Automatic restoration of saved calculation state
 * - Change detection to enable/disable the calculate button
 * - API integration for calculating and persisting results
 *
 * ## Usage Patterns
 *
 * ### Basic standalone calculation:
 * ```tsx
 * const { stationInputs, result, calculateWeightBalance } =
 *   useWeightBalanceCalculation(userId, profile);
 * ```
 *
 * ### Flight-linked calculation with persistence:
 * ```tsx
 * const { result, hasChanges, calculateWeightBalance } =
 *   useWeightBalanceCalculation(userId, profile, {
 *     initialState: existingCalculation, // Shows chart immediately if has results
 *     flightId: flight.id,
 *     persistCalculations: true,
 *     autoFuelBurn: flight.totalFuelUsed,
 *   });
 * ```
 *
 * ## State Flow
 *
 * 1. **Initialization**: When profile changes, station inputs are created from
 *    the profile's loading stations. If initialState is provided:
 *    - Station inputs are populated with saved values
 *    - If initialState has result data, it's displayed immediately
 *    - Original values are captured for change detection
 *
 * 2. **User Input**: As user modifies values, `hasChanges` updates to reflect
 *    whether current inputs differ from the saved state.
 *
 * 3. **Calculation**: When calculateWeightBalance() is called:
 *    - If persistCalculations=true: Saves and returns full calculation
 *    - If persistCalculations=false: Returns ephemeral result
 *    - Updates `result` and `lastCalculatedAt`
 *    - Resets `hasChanges` to false (current = saved)
 *
 * @param userId - The authenticated user's ID
 * @param profile - The weight & balance profile to use for calculations
 * @param options - Configuration options
 * @returns State and actions for the weight & balance calculator
 */
export function useWeightBalanceCalculation(
  userId: string,
  profile: WeightBalanceProfileDto | null,
  options?: UseWeightBalanceCalculationOptions
): UseWeightBalanceCalculationReturn {
  const { initialState, autoFuelBurn, flightId, persistCalculations = false, autoCalculateOnLoad = false } = options || {};

  // API mutations
  const [calculate, { isLoading: isCalculating }] = useCalculateWeightBalanceMutation();
  const [calculateAndSave, { isLoading: isSaving }] = useCalculateAndSaveMutation();
  const isLoading = isCalculating || isSaving;

  // Form state
  const [stationInputs, setStationInputs] = useState<StationInput[]>([]);
  const [fuelBurnGallons, setFuelBurnGallons] = useState<number | ''>(autoFuelBurn || '');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<WeightBalanceCalculationResultDto | null>(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Change detection: track the serialized "saved" state to compare against current
  const savedStateRef = useRef<string>('');

  // Track initialization to prevent re-running setup
  const initializedProfileIdRef = useRef<string | null>(null);

  // Track if auto-calculation has been performed
  const autoCalculatedRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // Initialization Effect
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!profile) {
      // No profile - clear everything
      setStationInputs([]);
      setSelectedEnvelopeId(null);
      setResult(null);
      setError(null);
      savedStateRef.current = '';
      initializedProfileIdRef.current = null;
      return;
    }

    // Skip if we've already initialized for this profile and have a result
    // This prevents clearing the chart when initialState updates after save
    if (initializedProfileIdRef.current === profile.id && result !== null) {
      return;
    }

    // Create station inputs from profile
    let inputs = createStationInputsFromProfile(profile);

    // Set default envelope
    const defaultEnvelopeId = profile.cgEnvelopes?.[0]?.id || null;
    let envelopeId = defaultEnvelopeId;
    let fuelBurn: number | '' = autoFuelBurn || '';

    // Apply saved state if provided and matches this profile
    if (initialState && initialState.profileId === profile.id) {
      // Apply saved station loads
      inputs = applyLoadedStations(inputs, initialState.loadedStations);

      // Apply saved envelope and fuel burn
      if (initialState.envelopeId) {
        envelopeId = initialState.envelopeId;
      }
      if (initialState.fuelBurnGallons !== undefined && initialState.fuelBurnGallons !== null) {
        fuelBurn = initialState.fuelBurnGallons;
      }

      // If saved state has result data, display it immediately
      if (hasResultData(initialState)) {
        setResult(initialState);
        if (initialState.calculatedAt) {
          setLastCalculatedAt(new Date(initialState.calculatedAt));
        }
      }
    }

    // Override fuel burn with autoFuelBurn if provided (takes precedence)
    if (autoFuelBurn !== undefined && autoFuelBurn > 0) {
      fuelBurn = autoFuelBurn;
    }

    // Update state
    setStationInputs(inputs);
    setSelectedEnvelopeId(envelopeId);
    setFuelBurnGallons(fuelBurn);
    setError(null);

    // Capture the saved state for change detection
    savedStateRef.current = serializeInputs(inputs, fuelBurn, envelopeId);

    // Mark this profile as initialized
    initializedProfileIdRef.current = profile.id || null;
  }, [profile, initialState, autoFuelBurn, result]);

  // -------------------------------------------------------------------------
  // Change Detection
  // -------------------------------------------------------------------------

  const hasChanges = useMemo(() => {
    if (!profile || stationInputs.length === 0) return false;

    const currentState = serializeInputs(stationInputs, fuelBurnGallons, selectedEnvelopeId);
    return currentState !== savedStateRef.current;
  }, [profile, stationInputs, fuelBurnGallons, selectedEnvelopeId]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const updateStationInput = useCallback((
    stationId: string,
    field: 'weight' | 'fuelGallons' | 'oilQuarts',
    value: number | ''
  ) => {
    setStationInputs((prev) =>
      prev.map((input) =>
        input.stationId === stationId ? { ...input, [field]: value } : input
      )
    );
  }, []);

  const calculateWeightBalance = useCallback(async (): Promise<WeightBalanceCalculationResultDto | null> => {
    if (!userId || !profile?.id) {
      setError('No profile selected');
      return null;
    }

    const loadedStations = buildLoadedStations(stationInputs);

    try {
      setError(null);
      let calcResult: WeightBalanceCalculationResultDto;

      if (persistCalculations) {
        // Save calculation to database
        const saveRequest: SaveWeightBalanceCalculationRequestDto = {
          profileId: profile.id,
          flightId: flightId || undefined,
          envelopeId: selectedEnvelopeId || undefined,
          fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
          loadedStations,
        };

        calcResult = await calculateAndSave({
          userId,
          request: saveRequest,
        }).unwrap();
      } else {
        // Ephemeral calculation (not saved)
        const request: WeightBalanceCalculationRequestDto = {
          loadedStations,
          envelopeId: selectedEnvelopeId || undefined,
          fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
        };

        calcResult = await calculate({
          userId,
          profileId: profile.id,
          request,
        }).unwrap();
      }

      setResult(calcResult);
      // WeightBalanceCalculationDto (from calculateAndSave) has calculatedAt, but
      // WeightBalanceCalculationResultDto (from calculate) doesn't
      const calculatedAt = 'calculatedAt' in calcResult && calcResult.calculatedAt
        ? new Date(calcResult.calculatedAt as string | Date)
        : new Date();
      setLastCalculatedAt(calculatedAt);

      // Update saved state reference (current values are now "saved")
      savedStateRef.current = serializeInputs(stationInputs, fuelBurnGallons, selectedEnvelopeId);

      return calcResult;
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : 'Calculation failed. Please try again.';
      setError(errorMessage || 'Calculation failed. Please try again.');
      setResult(null);
      return null;
    }
  }, [
    userId,
    profile,
    stationInputs,
    selectedEnvelopeId,
    fuelBurnGallons,
    persistCalculations,
    flightId,
    calculate,
    calculateAndSave,
  ]);

  const clearInputs = useCallback(() => {
    setStationInputs((prev) =>
      prev.map((input) => ({
        ...input,
        weight: '',
        fuelGallons: '',
        oilQuarts: '',
      }))
    );
    setFuelBurnGallons(autoFuelBurn || '');
    setResult(null);
    setLastCalculatedAt(null);
    setError(null);

    // Reset saved state reference
    savedStateRef.current = '';
  }, [autoFuelBurn]);

  // -------------------------------------------------------------------------
  // Auto-Calculate on Load Effect
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Only auto-calculate if:
    // 1. autoCalculateOnLoad is enabled
    // 2. We have a profile
    // 3. We have an initialState with inputs (but no results displayed yet)
    // 4. We haven't already auto-calculated for this profile
    // 5. There are valid inputs to calculate with
    if (
      autoCalculateOnLoad &&
      profile?.id &&
      initialState &&
      initialState.profileId === profile.id &&
      !hasResultData(initialState) &&
      !autoCalculatedRef.current &&
      result === null &&
      stationInputs.length > 0
    ) {
      // Check if there are any non-empty inputs
      const hasValidInputs = stationInputs.some((input) => {
        switch (input.stationType) {
          case LoadingStationType.Fuel:
            return input.fuelGallons !== '' && Number(input.fuelGallons) > 0;
          case LoadingStationType.Oil:
            return input.oilQuarts !== '' && Number(input.oilQuarts) > 0;
          default:
            return input.weight !== '' && Number(input.weight) > 0;
        }
      });

      if (hasValidInputs) {
        autoCalculatedRef.current = true;
        // Trigger calculation asynchronously
        calculateWeightBalance();
      }
    }
  }, [autoCalculateOnLoad, profile?.id, initialState, result, stationInputs, calculateWeightBalance]);

  // -------------------------------------------------------------------------
  // Derived State
  // -------------------------------------------------------------------------

  const availableEnvelopes = useMemo(() => {
    if (!profile?.cgEnvelopes) return [];
    return profile.cgEnvelopes.map((env) => ({
      value: env.id || '',
      label: env.name || 'Unnamed Envelope',
    }));
  }, [profile]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    // Form state
    stationInputs,
    fuelBurnGallons,
    selectedEnvelopeId,

    // Result
    result,
    error,
    isLoading,
    lastCalculatedAt,

    // Change detection
    hasChanges,

    // Derived data
    availableEnvelopes,

    // Actions
    updateStationInput,
    setFuelBurnGallons,
    setSelectedEnvelopeId,
    calculateWeightBalance,
    clearInputs,
  };
}

export default useWeightBalanceCalculation;
