/**
 * Educational tips and content for the Weight & Balance Wizard
 * Designed for student pilots learning W&B concepts
 */

export const WIZARD_STEPS = [
  { label: 'Getting Started', description: 'Basic profile info' },
  { label: 'Weight Limits', description: 'Aircraft limits' },
  { label: 'Loading Stations', description: 'Seats, fuel & cargo' },
  { label: 'CG Envelope', description: 'Safe CG limits' },
  { label: 'Review & Save', description: 'Verify and submit' },
] as const;

export const EDUCATIONAL_TIPS = {
  gettingStarted: {
    title: 'Finding Your W&B Data',
    content:
      "Your aircraft's POH (Pilot Operating Handbook) contains all the W&B data you'll need. " +
      'The datum is the reference point from which all arm measurements are taken - it\'s usually ' +
      'at the firewall or nose of the aircraft. Look in POH for the Weight & Balance section.',
  },
  weightLimits: {
    title: 'Understanding Weight Limits',
    content:
      "Find your aircraft's empty weight and CG on the weight and balance data sheet provided by the aircraft maintence technician (AMT) " +
      'These values are specific to YOUR aircraft and may differ from others of the same model due to ' +
      'installed equipment. Max Takeoff Weight (MTOW) is the highest weight at which the aircraft can safely take off.',
  },
  loadingStations: {
    title: 'What Are Loading Stations?',
    content:
      'Loading stations represent where weight can be added to your aircraft. Payload includes passenger seats ' +
      'and baggage areas. Fuel and oil are tracked separately because they\'re consumable - CG shifts as fuel ' +
      'burns during flight. Each station has an "arm" (distance from datum) used to calculate moments.',
  },
  cgEnvelope: {
    title: 'The CG Envelope',
    content:
      'The CG envelope defines the safe operating limits for your aircraft\'s center of gravity. Flying outside ' +
      'this envelope can make the aircraft uncontrollable. Copy the boundary points directly from your POH\'s ' +
      "CG envelope chart. Most aircraft have a 'Normal' category envelope; some have 'Utility' as well.",
  },
  review: {
    title: 'Double-Check Everything',
    content:
      'Double-check all values against your POH. Incorrect W&B data could lead to unsafe flight conditions. ' +
      "Remember that CG affects aircraft handling - too far forward makes the nose heavy and requires more " +
      'elevator force, while too far aft can make the aircraft unstable. You can always edit this profile later.',
  },
} as const;

export const FIELD_DESCRIPTIONS = {
  // Step 1
  profileName: 'A descriptive name to identify this W&B profile',
  datumDescription: 'Location of the datum reference point (e.g., "Firewall" or "78.4 inches ahead of wing leading edge")',
  aircraft: 'Select the aircraft this profile applies to',
  weightUnits: 'Unit of measurement for all weights',
  armUnits: 'Unit of measurement for all arm/station distances',
  loadingGraphFormat: 'How loading graphs are presented in your POH',

  // Step 2
  emptyWeight: 'Basic empty weight of the aircraft (from W&B Data sheet)',
  emptyWeightArm: 'Arm (station) of empty weight CG',
  maxRampWeight: 'Maximum weight for taxiing (usually slightly higher than MTOW)',
  maxTakeoffWeight: 'Maximum weight allowed at brake release for takeoff',
  maxLandingWeight: 'Maximum weight allowed for landing (may equal MTOW)',
  maxZeroFuelWeight: 'Maximum weight excluding usable fuel (if applicable)',

  // Step 3
  stationName: 'Name of this loading station (e.g., "Pilot", "Rear Baggage")',
  stationMaxWeight: 'Maximum weight allowed at this station',
  stationArm: 'Distance from datum to this station',
  fuelCapacity: 'Maximum fuel capacity in gallons',
  oilCapacity: 'Maximum oil capacity in quarts',

  // Step 4
  envelopeName: 'Name of this envelope (e.g., "Normal Category")',
  envelopeFormat: 'Whether points use CG Arm or Moment/1000',
} as const;

export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  positive: (field: string) => `${field} must be a positive number`,
  minStations: 'At least one loading station with a name is required',
  minEnvelopes: 'At least one CG envelope is required',
  minEnvelopePoints: 'Each envelope must have at least 3 boundary points',
  aircraftRequired: 'Please select an aircraft',
  profileNameRequired: 'Profile name is required',
} as const;

export const STEP_TITLES = {
  gettingStarted: 'Getting Started',
  weightLimits: 'Weight Limits',
  loadingStations: 'Loading Stations',
  cgEnvelope: 'CG Envelope',
  review: 'Review & Save',
} as const;
