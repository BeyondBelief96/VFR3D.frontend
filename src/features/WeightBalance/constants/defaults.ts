import { LoadingStationDto, AircraftCategory, LoadingStationType } from '@/redux/api/vfr3d/dtos';

// Default fuel weights in pounds per gallon
export const DEFAULT_FUEL_WEIGHT = {
  AVGAS_100LL: 6.0,
  JET_A: 6.75,
  MOGAS: 6.0,
};

// Default oil weight in pounds per quart
export const DEFAULT_OIL_WEIGHT_PER_QUART = 1.875; // ~7.5 lbs/gal = ~1.875 lbs/qt

// Common arm units
export const ARM_UNIT_LABELS = {
  Inches: 'in',
  Centimeters: 'cm',
};

// Common weight units
export const WEIGHT_UNIT_LABELS = {
  Pounds: 'lbs',
  Kilograms: 'kg',
};

// Standard loading station templates
// Loading graph points are empty - user must fill in from their POH
const createStation = (
  name: string,
  options: Partial<LoadingStationDto> = {}
): LoadingStationDto => ({
  name,
  maxWeight: 0,
  stationType: LoadingStationType.Standard,
  point1: { weight: 0, value: 0 },
  point2: { weight: 0, value: 0 },
  ...options,
});

const createFuelStation = (
  name: string,
  capacityGallons: number = 0
): LoadingStationDto => ({
  name,
  maxWeight: 0,
  stationType: LoadingStationType.Fuel,
  point1: { weight: 0, value: 0 },
  point2: { weight: 0, value: 0 },
  fuelCapacityGallons: capacityGallons,
  fuelWeightPerGallon: DEFAULT_FUEL_WEIGHT.AVGAS_100LL,
});

const createOilStation = (name: string = 'Oil', capacityQuarts: number = 8): LoadingStationDto => ({
  name,
  maxWeight: 0,
  stationType: LoadingStationType.Oil,
  point1: { weight: 0, value: 0 },
  point2: { weight: 0, value: 0 },
  oilCapacityQuarts: capacityQuarts,
  oilWeightPerQuart: DEFAULT_OIL_WEIGHT_PER_QUART,
});

// Default stations for single engine aircraft (most common: 4-seat like C172)
export const SINGLE_ENGINE_STATIONS: LoadingStationDto[] = [
  createStation('Front Seats', { maxWeight: 400 }),
  createStation('Rear Passengers', { maxWeight: 400 }),
  createStation('Baggage Area 1', { maxWeight: 120 }),
  createStation('Baggage Area 2', { maxWeight: 50 }),
  createFuelStation('Fuel Tanks', 53), // Typical C172 capacity
  createOilStation(),
];

// Default stations for multi-engine aircraft (6-seat like PA-34 Seneca)
export const MULTI_ENGINE_STATIONS: LoadingStationDto[] = [
  createStation('Front Seats', { maxWeight: 400 }),
  createStation('Middle Row Left', { maxWeight: 200 }),
  createStation('Middle Row Right', { maxWeight: 200 }),
  createStation('Rear Row Left', { maxWeight: 200 }),
  createStation('Rear Row Right', { maxWeight: 200 }),
  createStation('Nose Baggage', { maxWeight: 100 }),
  createStation('Rear Baggage', { maxWeight: 200 }),
  createFuelStation('Left Main Tank', 57),
  createFuelStation('Right Main Tank', 57),
  createOilStation('Left Engine Oil', 8),
  createOilStation('Right Engine Oil', 8),
];

// Default stations for helicopter
export const HELICOPTER_STATIONS: LoadingStationDto[] = [
  createStation('Front Seats', { maxWeight: 400 }),
  createStation('Rear Passengers', { maxWeight: 400 }),
  createStation('Baggage', { maxWeight: 100 }),
  createFuelStation('Main Fuel Tank', 42),
  createOilStation(),
];

// Default stations for glider
export const GLIDER_STATIONS: LoadingStationDto[] = [
  createStation('Pilot', { maxWeight: 250 }),
  createStation('Rear Seat/Passenger', { maxWeight: 250 }),
  createStation('Baggage', { maxWeight: 20 }),
  createFuelStation('Water Ballast', 0), // Some gliders have water ballast
];

// Default stations for light sport / ultralight
export const LIGHT_SPORT_STATIONS: LoadingStationDto[] = [
  createStation('Pilot', { maxWeight: 242 }), // LSA pilot weight limit consideration
  createStation('Passenger', { maxWeight: 242 }),
  createStation('Baggage', { maxWeight: 50 }),
  createFuelStation('Fuel Tank', 24),
];

// Default stations for balloon
export const BALLOON_STATIONS: LoadingStationDto[] = [
  createStation('Pilot', { maxWeight: 300 }),
  createStation('Passengers (Total)', { maxWeight: 600 }),
  createStation('Equipment', { maxWeight: 100 }),
  createFuelStation('Propane', 40), // Propane tanks
];

// Default stations for gyroplane
export const GYROPLANE_STATIONS: LoadingStationDto[] = [
  createStation('Pilot', { maxWeight: 300 }),
  createStation('Passenger', { maxWeight: 300 }),
  createStation('Baggage', { maxWeight: 50 }),
  createFuelStation('Fuel Tank', 25),
  createOilStation(),
];

// Get default stations based on aircraft category
export function getDefaultStationsForCategory(category?: AircraftCategory): LoadingStationDto[] {
  switch (category) {
    case AircraftCategory.SingleEngine:
      return SINGLE_ENGINE_STATIONS.map(s => ({ ...s })); // Clone to avoid mutation
    case AircraftCategory.MultiEngine:
      return MULTI_ENGINE_STATIONS.map(s => ({ ...s }));
    case AircraftCategory.Helicopter:
      return HELICOPTER_STATIONS.map(s => ({ ...s }));
    case AircraftCategory.Glider:
      return GLIDER_STATIONS.map(s => ({ ...s }));
    case AircraftCategory.LightSport:
    case AircraftCategory.Ultralight:
      return LIGHT_SPORT_STATIONS.map(s => ({ ...s }));
    case AircraftCategory.Balloon:
      return BALLOON_STATIONS.map(s => ({ ...s }));
    case AircraftCategory.Gyroplane:
      return GYROPLANE_STATIONS.map(s => ({ ...s }));
    default:
      // Default to single engine as it's most common
      return SINGLE_ENGINE_STATIONS.map(s => ({ ...s }));
  }
}

// Common additional stations that can be added
export const ADDITIONAL_STATION_TEMPLATES: { label: string; station: LoadingStationDto }[] = [
  { label: 'Additional Passenger', station: createStation('Passenger', { maxWeight: 200 }) },
  { label: 'Child Seat', station: createStation('Child Seat', { maxWeight: 100 }) },
  { label: 'Additional Baggage', station: createStation('Baggage', { maxWeight: 100 }) },
  { label: 'Aux Fuel Tank', station: createFuelStation('Aux Fuel Tank', 20) },
  { label: 'Tip Tanks', station: createFuelStation('Tip Tanks', 30) },
  { label: 'Equipment', station: createStation('Equipment', { maxWeight: 50 }) },
  { label: 'Survival Gear', station: createStation('Survival Gear', { maxWeight: 30 }) },
  { label: 'Cargo Pod', station: createStation('Cargo Pod', { maxWeight: 200 }) },
  { label: 'Custom Station', station: createStation('Custom', { maxWeight: 0 }) },
];
