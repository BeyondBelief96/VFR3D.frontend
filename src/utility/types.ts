import {
  AirportDto,
  AirsigmetDto,
  AirspaceDto,
  PirepDto,
  SpecialUseAirspaceDto,
  WaypointDto,
} from '@/redux/api/vfr3d/dtos';

export type SelectedEntityType =
  | AirportDto
  | PirepDto
  | AirsigmetDto
  | AirspaceDto
  | SpecialUseAirspaceDto
  | WaypointDto
  | null;

export type SelectableEntities =
  | 'Airport'
  | 'Pirep'
  | 'Airsigmet'
  | 'Airspace'
  | 'SpecialUseAirspace'
  | 'Waypoint'
  | null;

export interface ImageryProduct {
  id: string;
  name: string;
  filters?: {
    [key: string]: string[] | undefined;
  };
  baseUrl: string;
  fileExtension: string;
}
