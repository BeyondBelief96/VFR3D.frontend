/**
 * VFR3D Backend DTOs
 *
 * User-specific types are defined here (Aircraft, Flights, Weight & Balance).
 * Public data types (Airports, Weather, Airspace, NOTAMs, etc.) are re-exported
 * from the PreflightAPI generated types.
 */

/* eslint-disable */

// ══════════════════════════════════════════════════════════════════════════
// Re-exports from PreflightAPI (public data types)
// ══════════════════════════════════════════════════════════════════════════

export type {
  // Airports & Runways
  AirportDto,
  AirportSiteType,
  AirportOwnershipType,
  AirportFacilityUse,
  AirportStatus,
  RunwayDto,
  RunwayEndDto,
  RunwaySurfaceType,
  RunwaySurfaceTreatment,
  RunwayEdgeLightIntensity,
  InstrumentApproachType,
  RunwayMarkingsType,
  RunwayMarkingsCondition,
  VisualGlideSlopeIndicatorType,
  ApproachLightSystemType,
  ControllingObjectMarking,
  RunwayCrosswindComponentDto,

  // Airspace
  AirspaceDto,
  SpecialUseAirspaceDto,
  GeoJsonGeometry,

  // Weather: METARs
  MetarDto,
  MetarQualityControlFlagsDto,
  MetarSkyConditionDto,
  FlightCategory,

  // Weather: TAFs
  TafDto,
  TafForecast,
  TafSkyCondition,
  TafTurbulenceCondition,
  TafIcingCondition,
  TafTemperature,

  // Weather: PIREPs
  PirepDto,
  PirepQualityControlFlags,
  PirepSkyCondition,
  PirepTurbulenceCondition,
  PirepIcingCondition,

  // SIGMETs
  SigmetDto,
  SigmetAltitude,
  SigmetHazardDto,
  SigmetHazardType,
  HazardSeverity,
  SigmetArea,
  SigmetPoint,

  // G-AIRMETs
  GAirmetDto,
  GAirmetProduct,
  GAirmetHazardType,
  GAirmetAltitude,
  GAirmetFzlAltitude,
  GAirmetArea,
  GAirmetPoint,

  // NOTAMs
  NotamDto,
  NotamResponseDto,
  NotamGeometryDto,
  NotamPropertiesDto,
  CoreNotamDataDto,
  NotamEventDto,
  NotamDetailDto,
  NotamTranslationDto,
  NotamQueryByRouteRequest,
  RoutePointDto,

  // Obstacles
  ObstacleDto,
  ObstacleLighting,
  HorizontalAccuracy,
  VerticalAccuracy,
  ObstacleMarking,
  VerificationStatus,

  // Communication Frequencies
  CommunicationFrequencyDto,

  // Charts & Terminal Procedures
  ChartSupplementsResponseDto,
  ChartSupplementDto,
  TerminalProceduresResponseDto,
  TerminalProcedureDto,
  TerminalProcedureChartCode,

  // Navigation Log
  NavlogResponseDto,
  NavlogRequestDto,
  NavlogPerformanceDataDto,
  NavigationLegDto,
  WaypointDto,
  WaypointType,
  BearingAndDistanceResponseDto,
  BearingAndDistanceRequestDto,
  WindsAloftDto,
  WindsAloftSiteDto,
  WindTempDto,

  // E6B / Performance
  AirportCrosswindResponseDto,
  CrosswindCalculationResponseDto,
  CrosswindCalculationRequestDto,
  DensityAltitudeResponseDto,
  DensityAltitudeRequestDto,

  // Route Briefing
  RouteBriefingResponse,
  RouteBriefingRequest,

  // Pagination & Error
  PaginationMetadata,
  ApiErrorResponse,
} from '@/redux/api/preflight/types';

// Backward-compatible aliases for renamed types
export type { SigmetDto as AirsigmetDto } from '@/redux/api/preflight/types';
export type { SigmetHazardDto as AirsigmetHazardDto } from '@/redux/api/preflight/types';
export type { SigmetHazardType as AirsigmetHazardType } from '@/redux/api/preflight/types';
export type { SigmetAltitude as AirsigmetAltitude } from '@/redux/api/preflight/types';
export type { SigmetArea as AirsigmetArea } from '@/redux/api/preflight/types';
export type { SigmetPoint as AirsigmetPoint } from '@/redux/api/preflight/types';

// Legacy aliases for chart/diagram types
export type { TerminalProceduresResponseDto as AirportDiagramsResponseDto } from '@/redux/api/preflight/types';
export type { TerminalProcedureDto as AirportDiagramDto } from '@/redux/api/preflight/types';

// Legacy alias for chart supplement (old shape was { pdfUrl?: string })
export type { ChartSupplementsResponseDto as ChartSupplementUrlDto } from '@/redux/api/preflight/types';

// ══════════════════════════════════════════════════════════════════════════
// VFR3D Backend types (user-specific)
// ══════════════════════════════════════════════════════════════════════════

export interface AircraftDto {
  id?: string;
  userId?: string;
  tailNumber?: string;
  aircraftType?: string;
  callSign?: string | undefined;
  serialNumber?: string | undefined;
  primaryColor?: string | undefined;
  color2?: string | undefined;
  color3?: string | undefined;
  color4?: string | undefined;
  category?: AircraftCategory;
  aircraftHome?: string | undefined;
  airspeedUnits?: AirspeedUnits;
  lengthUnits?: LengthUnits;
  defaultCruiseAltitude?: number | undefined;
  maxCeiling?: number | undefined;
  glideSpeed?: number | undefined;
  glideRatio?: number | undefined;
  performanceProfiles?: AircraftPerformanceProfileDto[];
}

export enum AircraftCategory {
  SingleEngine = 'SingleEngine',
  MultiEngine = 'MultiEngine',
  Helicopter = 'Helicopter',
  Glider = 'Glider',
  Balloon = 'Balloon',
  Ultralight = 'Ultralight',
  LightSport = 'LightSport',
  Gyroplane = 'Gyroplane',
}

export enum AirspeedUnits {
  Knots = 'Knots',
  MPH = 'MPH',
  KPH = 'KPH',
}

export enum LengthUnits {
  Feet = 'Feet',
  Meters = 'Meters',
}

export interface AircraftPerformanceProfileDto {
  id?: string;
  userId?: string;
  aircraftId?: string | undefined;
  profileName?: string;
  climbTrueAirspeed?: number;
  cruiseTrueAirspeed?: number;
  cruiseFuelBurn?: number;
  climbFuelBurn?: number;
  descentFuelBurn?: number;
  climbFpm?: number;
  descentFpm?: number;
  descentTrueAirspeed?: number;
  sttFuelGals?: number;
  fuelOnBoardGals?: number;
  airspeedUnits?: AirspeedUnits;
  lengthUnits?: LengthUnits;
}

export interface CreateAircraftRequestDto {
  tailNumber?: string;
  aircraftType?: string;
  callSign?: string | undefined;
  serialNumber?: string | undefined;
  primaryColor?: string | undefined;
  color2?: string | undefined;
  color3?: string | undefined;
  color4?: string | undefined;
  category?: AircraftCategory;
  aircraftHome?: string | undefined;
  airspeedUnits?: AirspeedUnits;
  lengthUnits?: LengthUnits;
  defaultCruiseAltitude?: number | undefined;
  maxCeiling?: number | undefined;
  glideSpeed?: number | undefined;
  glideRatio?: number | undefined;
}

export interface UpdateAircraftRequestDto {
  tailNumber?: string;
  aircraftType?: string;
  callSign?: string | undefined;
  serialNumber?: string | undefined;
  primaryColor?: string | undefined;
  color2?: string | undefined;
  color3?: string | undefined;
  color4?: string | undefined;
  category?: AircraftCategory;
  aircraftHome?: string | undefined;
  airspeedUnits?: AirspeedUnits;
  lengthUnits?: LengthUnits;
  defaultCruiseAltitude?: number | undefined;
  maxCeiling?: number | undefined;
  glideSpeed?: number | undefined;
  glideRatio?: number | undefined;
}

export interface AircraftDocumentDto {
  id?: string;
  aircraftId?: string;
  userId?: string;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  displayName?: string;
  description?: string | undefined;
  category?: DocumentCategory;
  uploadedAt?: Date;
  lastModifiedAt?: Date;
}

export enum DocumentCategory {
  POH = 'POH',
  Manual = 'Manual',
  Checklist = 'Checklist',
  Maintenance = 'Maintenance',
  Insurance = 'Insurance',
  Registration = 'Registration',
  Other = 'Other',
}

export interface AircraftDocumentListDto {
  id?: string;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  displayName?: string;
  category?: DocumentCategory;
  uploadedAt?: Date;
}

export interface AircraftDocumentUrlDto {
  id?: string;
  url?: string;
  expiresAt?: Date;
}

export interface UpdateAircraftDocumentRequest {
  displayName?: string;
  description?: string | undefined;
  category?: DocumentCategory;
}

export interface SaveAircraftPerformanceProfileRequestDto {
  userId?: string;
  aircraftId?: string | undefined;
  profileName?: string;
  climbTrueAirspeed?: number;
  cruiseTrueAirspeed?: number;
  cruiseFuelBurn?: number;
  climbFuelBurn?: number;
  descentFuelBurn?: number;
  climbFpm?: number;
  descentFpm?: number;
  descentTrueAirspeed?: number;
  sttFuelGals?: number;
  fuelOnBoardGals?: number;
}

export interface UpdateAircraftPerformanceProfileRequestDto {
  userId?: string;
  aircraftId?: string | undefined;
  profileName?: string;
  climbTrueAirspeed?: number;
  cruiseTrueAirspeed?: number;
  cruiseFuelBurn?: number;
  climbFuelBurn?: number;
  descentFuelBurn?: number;
  climbFpm?: number;
  descentFpm?: number;
  descentTrueAirspeed?: number;
  sttFuelGals?: number;
  fuelOnBoardGals?: number;
}

export interface FlightDto {
  id?: string;
  auth0UserId?: string;
  name?: string;
  departureTime?: string;
  plannedCruisingAltitude?: number;
  waypoints?: import('@/redux/api/preflight/types').WaypointDto[];
  aircraftPerformanceId?: string;
  aircraftId?: string | undefined;
  totalRouteDistance?: number;
  totalRouteTimeHours?: number;
  totalFuelUsed?: number;
  averageWindComponent?: number;
  legs?: import('@/redux/api/preflight/types').NavigationLegDto[];
  stateCodesAlongRoute?: string[];
  airspaceGlobalIds?: string[];
  specialUseAirspaceGlobalIds?: string[];
  obstacleOasNumbers?: string[];
  aircraftPerformanceProfile?: AircraftPerformanceProfileDto | undefined;
  aircraft?: AircraftDto | undefined;
  relatedFlightId?: string | undefined;
}

export interface CreateFlightRequestDto {
  name?: string;
  departureTime?: Date;
  plannedCruisingAltitude?: number;
  waypoints?: import('@/redux/api/preflight/types').WaypointDto[];
  aircraftPerformanceProfileId?: string;
  aircraftId?: string | undefined;
}

export interface ValueTupleOfFlightDtoAndFlightDto {}

export interface CreateRoundTripFlightRequestDto {
  outboundName?: string;
  returnName?: string;
  departureTime?: Date;
  returnDepartureTime?: Date;
  plannedCruisingAltitude?: number;
  waypoints?: import('@/redux/api/preflight/types').WaypointDto[];
  aircraftPerformanceProfileId?: string;
}

export interface UpdateFlightRequestDto {
  name?: string | undefined;
  departureTime?: Date | undefined;
  plannedCruisingAltitude?: number | undefined;
  waypoints?: import('@/redux/api/preflight/types').WaypointDto[] | undefined;
  aircraftPerformanceProfileId?: string | undefined;
  aircraftId?: string | undefined;
}

export interface WeightBalanceProfileDto {
  id?: string;
  userId?: string;
  aircraftId?: string | undefined;
  profileName?: string;
  datumDescription?: string | undefined;
  emptyWeight?: number;
  emptyWeightArm?: number;
  maxRampWeight?: number | undefined;
  maxTakeoffWeight?: number;
  maxLandingWeight?: number | undefined;
  maxZeroFuelWeight?: number | undefined;
  weightUnits?: WeightUnits;
  armUnits?: ArmUnits;
  loadingGraphFormat?: LoadingGraphFormat;
  loadingStations?: LoadingStationDto[];
  cgEnvelopes?: CgEnvelopeDto[];
}

export enum WeightUnits {
  Pounds = 'Pounds',
  Kilograms = 'Kilograms',
}

export enum ArmUnits {
  Inches = 'Inches',
  Centimeters = 'Centimeters',
}

export enum LoadingGraphFormat {
  Arm = 'Arm',
  MomentDividedBy1000 = 'MomentDividedBy1000',
}

export interface LoadingStationDto {
  id?: string;
  name?: string;
  maxWeight?: number;
  point1?: LoadingGraphPointDto;
  point2?: LoadingGraphPointDto;
  stationType?: LoadingStationType;
  fuelCapacityGallons?: number | undefined;
  fuelWeightPerGallon?: number | undefined;
  oilCapacityQuarts?: number | undefined;
  oilWeightPerQuart?: number | undefined;
}

export interface LoadingGraphPointDto {
  weight?: number;
  value?: number;
}

export enum LoadingStationType {
  Standard = 'Standard',
  Fuel = 'Fuel',
  Oil = 'Oil',
}

export interface CgEnvelopeDto {
  id?: string;
  name?: string;
  format?: CgEnvelopeFormat;
  limits?: CgEnvelopePointDto[];
}

export enum CgEnvelopeFormat {
  Arm = 'Arm',
  MomentDividedBy1000 = 'MomentDividedBy1000',
}

export interface CgEnvelopePointDto {
  weight?: number;
  arm?: number | undefined;
  momentDividedBy1000?: number | undefined;
}

export interface CreateWeightBalanceProfileRequestDto {
  aircraftId?: string | undefined;
  profileName?: string;
  datumDescription?: string | undefined;
  emptyWeight?: number;
  emptyWeightArm?: number;
  maxRampWeight?: number | undefined;
  maxTakeoffWeight?: number;
  maxLandingWeight?: number | undefined;
  maxZeroFuelWeight?: number | undefined;
  weightUnits?: WeightUnits;
  armUnits?: ArmUnits;
  loadingGraphFormat?: LoadingGraphFormat;
  loadingStations?: LoadingStationDto[];
  cgEnvelopes?: CgEnvelopeDto[];
}

export interface UpdateWeightBalanceProfileRequestDto {
  aircraftId?: string | undefined;
  profileName?: string;
  datumDescription?: string | undefined;
  emptyWeight?: number;
  emptyWeightArm?: number;
  maxRampWeight?: number | undefined;
  maxTakeoffWeight?: number;
  maxLandingWeight?: number | undefined;
  maxZeroFuelWeight?: number | undefined;
  weightUnits?: WeightUnits;
  armUnits?: ArmUnits;
  loadingGraphFormat?: LoadingGraphFormat;
  loadingStations?: LoadingStationDto[];
  cgEnvelopes?: CgEnvelopeDto[];
}

export interface WeightBalanceCalculationResultDto {
  takeoff?: WeightBalanceCgResultDto;
  landing?: WeightBalanceCgResultDto | undefined;
  stationBreakdown?: StationBreakdownDto[];
  envelopeName?: string;
  envelopeLimits?: CgEnvelopePointDto[];
  warnings?: string[];
}

export interface WeightBalanceCgResultDto {
  totalWeight?: number;
  totalMoment?: number;
  cgArm?: number;
  isWithinEnvelope?: boolean;
}

export interface StationBreakdownDto {
  stationId?: string;
  name?: string;
  weight?: number;
  arm?: number;
  moment?: number;
}

export interface WeightBalanceCalculationRequestDto {
  loadedStations?: StationLoadDto[];
  envelopeId?: string | undefined;
  fuelBurnGallons?: number | undefined;
}

export interface StationLoadDto {
  stationId?: string;
  weight?: number | undefined;
  fuelGallons?: number | undefined;
  oilQuarts?: number | undefined;
}

export interface WeightBalanceCalculationDto {
  id?: string;
  profileId?: string;
  flightId?: string | undefined;
  envelopeId?: string | undefined;
  fuelBurnGallons?: number | undefined;
  loadedStations?: StationLoadDto[];
  takeoff?: WeightBalanceCgResultDto;
  landing?: WeightBalanceCgResultDto | undefined;
  stationBreakdown?: StationBreakdownDto[];
  envelopeName?: string;
  envelopeLimits?: CgEnvelopePointDto[];
  warnings?: string[];
  calculatedAt?: Date;
  isStandalone?: boolean;
}

export interface SaveWeightBalanceCalculationRequestDto {
  profileId?: string;
  flightId?: string | undefined;
  envelopeId?: string | undefined;
  fuelBurnGallons?: number | undefined;
  loadedStations?: StationLoadDto[];
}

export interface StandaloneCalculationStateDto {
  calculationId?: string;
  profileId?: string;
  envelopeId?: string | undefined;
  fuelBurnGallons?: number | undefined;
  loadedStations?: StationLoadDto[];
  calculatedAt?: Date;
}

export interface FileParameter {
  data: any;
  fileName: string;
}
