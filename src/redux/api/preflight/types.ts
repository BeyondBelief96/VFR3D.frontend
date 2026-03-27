/**
 * Convenience type aliases extracted from the auto-generated OpenAPI types.
 * Import these instead of using components["schemas"]["..."] directly.
 *
 * Generated from: https://preflightapi.io/api/openapi
 */
import type { components } from './generated-types';

// ── Pagination ──────────────────────────────────────────────────────────
export type PaginationMetadata = components['schemas']['PaginationMetadata'];

export type PaginatedResponse<T> = {
  data?: T[];
  pagination?: PaginationMetadata;
};

// ── Airports ────────────────────────────────────────────────────────────
export type AirportDto = components['schemas']['AirportDto'];
export type AirportSiteType = components['schemas']['AirportSiteType'];
export type AirportOwnershipType = components['schemas']['AirportOwnershipType'];
export type AirportFacilityUse = components['schemas']['AirportFacilityUse'];
export type AirportStatus = components['schemas']['AirportStatus'];

// ── Runways ─────────────────────────────────────────────────────────────
export type RunwayDto = components['schemas']['RunwayDto'];
export type RunwayEndDto = components['schemas']['RunwayEndDto'];
export type RunwaySurfaceType = components['schemas']['RunwaySurfaceType'];
export type RunwaySurfaceTreatment = components['schemas']['RunwaySurfaceTreatment'];
export type RunwayEdgeLightIntensity = components['schemas']['RunwayEdgeLightIntensity'];
export type InstrumentApproachType = components['schemas']['InstrumentApproachType'];
export type RunwayMarkingsType = components['schemas']['RunwayMarkingsType'];
export type RunwayMarkingsCondition = components['schemas']['RunwayMarkingsCondition'];
export type VisualGlideSlopeIndicatorType = components['schemas']['VisualGlideSlopeIndicatorType'];
export type ApproachLightSystemType = components['schemas']['ApproachLightSystemType'];
export type ControllingObjectMarking = components['schemas']['ControllingObjectMarking'];
export type RunwayCrosswindComponentDto = components['schemas']['RunwayCrosswindComponentDto'];

// ── Airspaces ───────────────────────────────────────────────────────────
export type AirspaceDto = components['schemas']['AirspaceDto'];
export type SpecialUseAirspaceDto = components['schemas']['SpecialUseAirspaceDto'];
export type GeoJsonGeometry = components['schemas']['GeoJsonGeometry'];

// ── Weather: METARs ─────────────────────────────────────────────────────
export type MetarDto = components['schemas']['MetarDto'];
export type MetarQualityControlFlagsDto = components['schemas']['MetarQualityControlFlagsDto'];
export type MetarSkyConditionDto = components['schemas']['MetarSkyConditionDto'];
export type FlightCategory = components['schemas']['FlightCategory'];
export type SkyCover = components['schemas']['SkyCover'];

// ── Weather: TAFs ───────────────────────────────────────────────────────
export type TafDto = components['schemas']['TafDto'];
export type TafForecast = components['schemas']['TafForecast'];
export type TafSkyCondition = components['schemas']['TafSkyCondition'];
export type TafTurbulenceCondition = components['schemas']['TafTurbulenceCondition'];
export type TafIcingCondition = components['schemas']['TafIcingCondition'];
export type TafTemperature = components['schemas']['TafTemperature'];

// ── Weather: PIREPs ─────────────────────────────────────────────────────
export type PirepDto = components['schemas']['PirepDto'];
export type PirepQualityControlFlags = components['schemas']['PirepQualityControlFlags'];
export type PirepSkyCondition = components['schemas']['PirepSkyCondition'];
export type PirepTurbulenceCondition = components['schemas']['PirepTurbulenceCondition'];
export type PirepIcingCondition = components['schemas']['PirepIcingCondition'];
export type PirepReportType = components['schemas']['PirepReportType'];

// ── SIGMETs (was AirsigmetDto) ──────────────────────────────────────────
export type SigmetDto = components['schemas']['SigmetDto'];
export type SigmetAltitude = components['schemas']['SigmetAltitude'];
export type SigmetHazardDto = components['schemas']['SigmetHazardDto'];
export type SigmetHazardType = components['schemas']['SigmetHazardType'];
export type HazardSeverity = components['schemas']['HazardSeverity'];
export type SigmetArea = components['schemas']['SigmetArea'];
export type SigmetPoint = components['schemas']['SigmetPoint'];

/** @deprecated Use SigmetDto instead — renamed in PreflightAPI */
export type AirsigmetDto = SigmetDto;

// ── G-AIRMETs ───────────────────────────────────────────────────────────
export type GAirmetDto = components['schemas']['GAirmetDto'];
export type GAirmetProduct = components['schemas']['GAirmetProduct'];
export type GAirmetHazardType = components['schemas']['GAirmetHazardType'];
export type GAirmetAltitude = components['schemas']['GAirmetAltitude'];
export type GAirmetFzlAltitude = components['schemas']['GAirmetFzlAltitude'];
export type GAirmetArea = components['schemas']['GAirmetArea'];
export type GAirmetPoint = components['schemas']['GAirmetPoint'];

// ── NOTAMs ──────────────────────────────────────────────────────────────
export type NotamDto = components['schemas']['NotamDto'];
export type NotamGeometryDto = components['schemas']['NotamGeometryDto'];
export type NotamPropertiesDto = components['schemas']['NotamPropertiesDto'];
export type CoreNotamDataDto = components['schemas']['CoreNotamDataDto'];
export type NotamEventDto = components['schemas']['NotamEventDto'];
export type NotamDetailDto = components['schemas']['NotamDetailDto'];
export type NotamTranslationDto = components['schemas']['NotamTranslationDto'];
export type NotamResponseDto = components['schemas']['NotamResponseDto'];
export type NotamQueryByRouteRequest = components['schemas']['NotamQueryByRouteRequest'];
export type RoutePointDto = components['schemas']['RoutePointDto'];
export type NotamFilterDto = components['schemas']['NotamFilterDto'];

// ── Obstacles ───────────────────────────────────────────────────────────
export type ObstacleDto = components['schemas']['ObstacleDto'];
export type ObstacleLighting = components['schemas']['ObstacleLighting'];
export type HorizontalAccuracy = components['schemas']['HorizontalAccuracy'];
export type VerticalAccuracy = components['schemas']['VerticalAccuracy'];
export type ObstacleMarking = components['schemas']['ObstacleMarking'];
export type VerificationStatus = components['schemas']['VerificationStatus'];

// ── Communication Frequencies ───────────────────────────────────────────
export type CommunicationFrequencyDto = components['schemas']['CommunicationFrequencyDto'];

// ── Chart Supplements ───────────────────────────────────────────────────
export type ChartSupplementsResponseDto = components['schemas']['ChartSupplementsResponseDto'];
export type ChartSupplementDto = components['schemas']['ChartSupplementDto'];

// ── Terminal Procedures (replaces Airport Diagrams) ─────────────────────
export type TerminalProceduresResponseDto = components['schemas']['TerminalProceduresResponseDto'];
export type TerminalProcedureDto = components['schemas']['TerminalProcedureDto'];
export type TerminalProcedureChartCode = components['schemas']['TerminalProcedureChartCode'];

// ── Navigation Log ──────────────────────────────────────────────────────
export type NavlogResponseDto = components['schemas']['NavlogResponseDto'];
export type NavlogRequestDto = components['schemas']['NavlogRequestDto'];
export type NavlogPerformanceDataDto = components['schemas']['NavlogPerformanceDataDto'];
export type NavigationLegDto = components['schemas']['NavigationLegDto'];
export type WaypointDto = components['schemas']['WaypointDto'];
export type WaypointType = components['schemas']['WaypointType'];
export type BearingAndDistanceResponseDto = components['schemas']['BearingAndDistanceResponseDto'];
export type BearingAndDistanceRequestDto = components['schemas']['BearingAndDistanceRequestDto'];
export type WindsAloftDto = components['schemas']['WindsAloftDto'];
export type WindsAloftSiteDto = components['schemas']['WindsAloftSiteDto'];
export type WindTempDto = components['schemas']['WindTempDto'];

// ── E6B / Performance Calculations ──────────────────────────────────────
export type AirportCrosswindResponseDto = components['schemas']['AirportCrosswindResponseDto'];
export type CrosswindCalculationResponseDto = components['schemas']['CrosswindCalculationResponseDto'];
export type CrosswindCalculationRequestDto = components['schemas']['CrosswindCalculationRequestDto'];
export type DensityAltitudeResponseDto = components['schemas']['DensityAltitudeResponseDto'];
export type DensityAltitudeRequestDto = components['schemas']['DensityAltitudeRequestDto'];

// ── Route Briefing ──────────────────────────────────────────────────────
export type RouteBriefingResponse = components['schemas']['RouteBriefingResponse'];
export type RouteBriefingRequest = components['schemas']['RouteBriefingRequest'];
export type RouteBriefingSummary = components['schemas']['RouteBriefingSummary'];
export type BriefingWaypoint = components['schemas']['BriefingWaypoint'];

// ── Error ───────────────────────────────────────────────────────────────
export type ApiErrorResponse = components['schemas']['ApiErrorResponse'];
