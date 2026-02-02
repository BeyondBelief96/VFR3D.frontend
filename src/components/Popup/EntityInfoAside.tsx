import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  AirportDto,
  AirsigmetDto,
  AirspaceDto,
  GAirmetDto,
  ObstacleDto,
  PirepDto,
  SpecialUseAirspaceDto,
  WaypointDto,
} from '@/redux/api/vfr3d/dtos';
import type { RootState } from '@/redux/store';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { AirportInfoAsideContent } from '@/features/Airports/InformationPopup';
import { AirspaceAsideContent } from '@/features/Airspace';
import { PirepAsideContent } from '@/features/Pireps';
import { ObstacleAsideContent } from '@/features/Obstacles';
import { AirsigmetAsideContent, GAirmetAsideContent } from '@/features/Airsigmets';
import { WaypointInfoAsideContent } from '@/features/Flights';

/**
 * EntityInfoAside - Renders entity info in the aside panel
 */
const EntityInfoAside: React.FC = () => {
  const dispatch = useDispatch();
  const selectedEntity = useSelector((state: RootState) => state.selectedEntity.entity);
  const selectedEntityType = useSelector((state: RootState) => state.selectedEntity.type);

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  if (!selectedEntity || !selectedEntityType) return null;

  switch (selectedEntityType) {
    case 'Airport':
      return <AirportInfoAsideContent selectedAirport={selectedEntity as AirportDto} onClose={handleClose} />;
    case 'Airspace':
      return <AirspaceAsideContent airspace={selectedEntity as AirspaceDto} onClose={handleClose} />;
    case 'SpecialUseAirspace':
      return <AirspaceAsideContent airspace={selectedEntity as SpecialUseAirspaceDto} onClose={handleClose} />;
    case 'Pirep':
      return <PirepAsideContent pirep={selectedEntity as PirepDto} onClose={handleClose} />;
    case 'Airsigmet':
      return <AirsigmetAsideContent airsigmet={selectedEntity as AirsigmetDto} onClose={handleClose} />;
    case 'GAirmet':
      return <GAirmetAsideContent gairmet={selectedEntity as GAirmetDto} onClose={handleClose} />;
    case 'Waypoint':
      return <WaypointInfoAsideContent selectedWaypoint={selectedEntity as WaypointDto} onClose={handleClose} />;
    case 'Obstacle':
      return <ObstacleAsideContent obstacle={selectedEntity as ObstacleDto} onClose={handleClose} />;
    default:
      return null;
  }
};

export default EntityInfoAside;
