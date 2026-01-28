import { useState, useCallback, useMemo, useEffect } from 'react';
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

interface StationInput {
  stationId: string;
  name: string;
  maxWeight: number;
  stationType: LoadingStationType;
  // Fuel fields
  fuelCapacityGallons?: number;
  fuelWeightPerGallon?: number;
  // Oil fields
  oilCapacityQuarts?: number;
  oilWeightPerQuart?: number;
  // Input values
  weight: number | '';
  fuelGallons: number | '';
  oilQuarts: number | '';
}

export interface UseWeightBalanceCalculationOptions {
  userId: string;
  profile: WeightBalanceProfileDto | null;
  initialState?: StandaloneCalculationStateDto | null; // For form repopulation
  autoFuelBurn?: number; // From flight nav log
  flightId?: string; // For flight-associated calculations
  persistCalculations?: boolean; // Whether to use calculateAndSave instead of calculate
}

export function useWeightBalanceCalculation(
  userId: string,
  profile: WeightBalanceProfileDto | null,
  options?: Omit<UseWeightBalanceCalculationOptions, 'userId' | 'profile'>
) {
  const { initialState, autoFuelBurn, flightId, persistCalculations = false } = options || {};

  const [calculate, { isLoading: isCalculating }] = useCalculateWeightBalanceMutation();
  const [calculateAndSave, { isLoading: isSaving }] = useCalculateAndSaveMutation();
  const isLoading = isCalculating || isSaving;

  const [stationInputs, setStationInputs] = useState<StationInput[]>([]);
  const [fuelBurnGallons, setFuelBurnGallons] = useState<number | ''>(autoFuelBurn || '');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [result, setResult] = useState<WeightBalanceCalculationResultDto | null>(null);
  const [savedCalculation, setSavedCalculation] = useState<WeightBalanceCalculationDto | null>(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialStateApplied, setIsInitialStateApplied] = useState(false);

  // Apply auto fuel burn when it changes
  useEffect(() => {
    if (autoFuelBurn !== undefined && autoFuelBurn > 0) {
      setFuelBurnGallons(autoFuelBurn);
    }
  }, [autoFuelBurn]);

  // Apply initial state to station inputs
  const applyInitialState = useCallback((
    inputs: StationInput[],
    state: StandaloneCalculationStateDto | WeightBalanceCalculationDto
  ): StationInput[] => {
    if (!state.loadedStations || state.loadedStations.length === 0) {
      return inputs;
    }

    return inputs.map((input) => {
      const savedLoad = state.loadedStations?.find(
        (s: StationLoadDto) => s.stationId === input.stationId
      );

      if (!savedLoad) return input;

      return {
        ...input,
        weight: savedLoad.weight ?? '',
        fuelGallons: savedLoad.fuelGallons ?? '',
        oilQuarts: savedLoad.oilQuarts ?? '',
      };
    });
  }, []);

  // Initialize station inputs from profile
  const initializeFromProfile = useCallback((
    newProfile: WeightBalanceProfileDto | null,
    stateToApply?: StandaloneCalculationStateDto | WeightBalanceCalculationDto | null
  ) => {
    if (!newProfile || !newProfile.loadingStations) {
      setStationInputs([]);
      setSelectedEnvelopeId(null);
      setResult(null);
      setSavedCalculation(null);
      return;
    }

    let inputs: StationInput[] = newProfile.loadingStations.map((station: LoadingStationDto, index: number) => ({
      // Use station.id if available, otherwise generate a unique ID from index
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

    // Apply saved state if provided
    if (stateToApply) {
      inputs = applyInitialState(inputs, stateToApply);

      // Set envelope from saved state
      if (stateToApply.envelopeId) {
        setSelectedEnvelopeId(stateToApply.envelopeId);
      }

      // Set fuel burn from saved state
      if (stateToApply.fuelBurnGallons !== undefined && stateToApply.fuelBurnGallons !== null) {
        setFuelBurnGallons(stateToApply.fuelBurnGallons);
      }

      // Set last calculated timestamp
      if (stateToApply.calculatedAt) {
        setLastCalculatedAt(new Date(stateToApply.calculatedAt));
      }

      setIsInitialStateApplied(true);
    } else {
      // Set default envelope if no state to apply
      if (newProfile.cgEnvelopes && newProfile.cgEnvelopes.length > 0) {
        setSelectedEnvelopeId(newProfile.cgEnvelopes[0].id || null);
      }
    }

    setStationInputs(inputs);
    setResult(null);
    setError(null);
  }, [applyInitialState]);

  // Apply initial state when it changes (but only once per mount)
  useEffect(() => {
    if (initialState && profile && !isInitialStateApplied && initialState.profileId === profile.id) {
      initializeFromProfile(profile, initialState);
    }
  }, [initialState, profile, isInitialStateApplied, initializeFromProfile]);

  // Update a station input
  const updateStationInput = useCallback((stationId: string, field: 'weight' | 'fuelGallons' | 'oilQuarts', value: number | '') => {
    setStationInputs((prev) =>
      prev.map((input) =>
        input.stationId === stationId
          ? { ...input, [field]: value }
          : input
      )
    );
  }, []);

  // Build loaded stations from current inputs
  const buildLoadedStations = useCallback((): StationLoadDto[] => {
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
  }, [stationInputs]);

  // Calculate weight and balance
  const calculateWeightBalance = useCallback(async () => {
    if (!userId || !profile?.id) {
      setError('No profile selected');
      return null;
    }

    const loadedStations = buildLoadedStations();

    try {
      setError(null);

      if (persistCalculations) {
        // Use calculateAndSave for persisted calculations
        const saveRequest: SaveWeightBalanceCalculationRequestDto = {
          profileId: profile.id,
          flightId: flightId || undefined,
          envelopeId: selectedEnvelopeId || undefined,
          fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
          loadedStations,
        };

        const savedResult = await calculateAndSave({
          userId,
          request: saveRequest,
        }).unwrap();

        setResult(savedResult);
        setSavedCalculation(savedResult);
        setLastCalculatedAt(new Date(savedResult.calculatedAt || Date.now()));
        return savedResult;
      } else {
        // Use regular calculate (non-persisted)
        const request: WeightBalanceCalculationRequestDto = {
          loadedStations,
          envelopeId: selectedEnvelopeId || undefined,
          fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
        };

        const calculationResult = await calculate({
          userId,
          profileId: profile.id,
          request,
        }).unwrap();
        setResult(calculationResult);
        return calculationResult;
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Calculation failed. Please try again.');
      setResult(null);
      return null;
    }
  }, [userId, profile, buildLoadedStations, selectedEnvelopeId, fuelBurnGallons, persistCalculations, flightId, calculate, calculateAndSave]);

  // Save calculation (explicit save, separate from calculate)
  const saveCalculation = useCallback(async (overrideFlightId?: string): Promise<WeightBalanceCalculationDto | null> => {
    if (!userId || !profile?.id) {
      setError('No profile selected');
      return null;
    }

    const loadedStations = buildLoadedStations();

    const saveRequest: SaveWeightBalanceCalculationRequestDto = {
      profileId: profile.id,
      flightId: overrideFlightId || flightId || undefined,
      envelopeId: selectedEnvelopeId || undefined,
      fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
      loadedStations,
    };

    try {
      setError(null);
      const savedResult = await calculateAndSave({
        userId,
        request: saveRequest,
      }).unwrap();

      setResult(savedResult);
      setSavedCalculation(savedResult);
      setLastCalculatedAt(new Date(savedResult.calculatedAt || Date.now()));
      return savedResult;
    } catch (err: any) {
      setError(err?.data?.message || 'Save failed. Please try again.');
      return null;
    }
  }, [userId, profile, buildLoadedStations, selectedEnvelopeId, fuelBurnGallons, flightId, calculateAndSave]);

  // Clear all inputs
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
    setSavedCalculation(null);
    setLastCalculatedAt(null);
    setError(null);
    setIsInitialStateApplied(false);
  }, [autoFuelBurn]);

  // Available envelopes from profile
  const availableEnvelopes = useMemo(() => {
    if (!profile?.cgEnvelopes) return [];
    return profile.cgEnvelopes.map((env) => ({
      value: env.id || '',
      label: env.name || 'Unnamed Envelope',
    }));
  }, [profile]);

  return {
    // State
    stationInputs,
    fuelBurnGallons,
    selectedEnvelopeId,
    result,
    error,
    isLoading,
    availableEnvelopes,
    savedCalculation,
    lastCalculatedAt,
    isInitialStateApplied,

    // Actions
    initializeFromProfile,
    updateStationInput,
    setFuelBurnGallons,
    setSelectedEnvelopeId,
    calculateWeightBalance,
    saveCalculation,
    clearInputs,
  };
}

export default useWeightBalanceCalculation;
