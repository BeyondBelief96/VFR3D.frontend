import { useState, useCallback, useMemo } from 'react';
import {
  WeightBalanceProfileDto,
  WeightBalanceCalculationRequestDto,
  WeightBalanceCalculationResultDto,
  StationLoadDto,
  LoadingStationDto,
  LoadingStationType,
} from '@/redux/api/vfr3d/dtos';
import { useCalculateWeightBalanceMutation } from '@/redux/api/vfr3d/weightBalance.api';

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

export function useWeightBalanceCalculation(
  userId: string,
  profile: WeightBalanceProfileDto | null
) {
  const [calculate, { isLoading }] = useCalculateWeightBalanceMutation();

  const [stationInputs, setStationInputs] = useState<StationInput[]>([]);
  const [fuelBurnGallons, setFuelBurnGallons] = useState<number | ''>('');
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [result, setResult] = useState<WeightBalanceCalculationResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize station inputs from profile
  const initializeFromProfile = useCallback((newProfile: WeightBalanceProfileDto | null) => {
    if (!newProfile || !newProfile.loadingStations) {
      setStationInputs([]);
      setSelectedEnvelopeId(null);
      setResult(null);
      return;
    }

    const inputs: StationInput[] = newProfile.loadingStations.map((station: LoadingStationDto, index: number) => ({
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

    setStationInputs(inputs);

    // Set default envelope
    if (newProfile.cgEnvelopes && newProfile.cgEnvelopes.length > 0) {
      setSelectedEnvelopeId(newProfile.cgEnvelopes[0].id || null);
    }

    setResult(null);
    setError(null);
  }, []);

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

  // Calculate weight and balance
  const calculateWeightBalance = useCallback(async () => {
    if (!userId || !profile?.id) {
      setError('No profile selected');
      return;
    }

    const loadedStations: StationLoadDto[] = stationInputs
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

    const request: WeightBalanceCalculationRequestDto = {
      loadedStations,
      envelopeId: selectedEnvelopeId || undefined,
      fuelBurnGallons: fuelBurnGallons !== '' ? Number(fuelBurnGallons) : undefined,
    };

    try {
      setError(null);
      const calculationResult = await calculate({
        userId,
        profileId: profile.id,
        request,
      }).unwrap();
      setResult(calculationResult);
    } catch (err: any) {
      setError(err?.data?.message || 'Calculation failed. Please try again.');
      setResult(null);
    }
  }, [userId, profile, stationInputs, selectedEnvelopeId, fuelBurnGallons, calculate]);

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
    setFuelBurnGallons('');
    setResult(null);
    setError(null);
  }, []);

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

    // Actions
    initializeFromProfile,
    updateStationInput,
    setFuelBurnGallons,
    setSelectedEnvelopeId,
    calculateWeightBalance,
    clearInputs,
  };
}

export default useWeightBalanceCalculation;
