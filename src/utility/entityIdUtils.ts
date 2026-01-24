import { AirportDto, AirsigmetDto, ObstacleDto, PirepDto, AirspaceDto, SpecialUseAirspaceDto } from '@/redux/api/vfr3d/dtos';

export const getAirportEntityIdFromAirport = (airport: AirportDto) => {
  return `airport-${airport.siteNo}`;
};

export const getAirsigmetEntityId = (airsigmet: AirsigmetDto) => {
  return `airsigmet-${airsigmet.id}`;
};

export const getPirepEntityId = (pirep: PirepDto) => {
  return `pirep-${pirep.id}`;
};

export const getAirspaceEntityId = (airspace: AirspaceDto) => {
  return `airspace-${airspace.globalId}`;
};

export const getSpecialUseAirspaceEntityId = (airspace: SpecialUseAirspaceDto) => {
  return `sua-${airspace.globalId}`;
};

export const getObstacleEntityId = (obstacle: ObstacleDto) => {
  return `obstacle-${obstacle.oasNumber}`;
};

export const parseEntityId = (entityId: string): { type: string; id: string } | null => {
  const parts = entityId.split('-');
  if (parts.length < 2) return null;
  const type = parts[0];
  const id = parts.slice(1).join('-');
  return { type, id };
};
