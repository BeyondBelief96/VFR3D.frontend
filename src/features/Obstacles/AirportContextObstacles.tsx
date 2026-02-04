import React, { useMemo, useEffect } from 'react';
import { useSearchObstaclesNearbyQuery } from '@/redux/api/vfr3d/obstacles.api';
import { ObstacleAirportEntry } from '@/redux/slices/obstaclesSlice';
import { ObstacleDto } from '@/redux/api/vfr3d/dtos';
import ObstacleEntity from './ObstacleEntity';

interface AirportContextObstaclesProps {
  airport: ObstacleAirportEntry;
  radiusNm: number;
  minHeightFilter: number;
  heightExaggeration: number;
  showLabels: boolean;
  excludeOasNumbers: Set<string>;
  onObstaclesLoaded?: (obstacles: ObstacleDto[]) => void;
}

export const AirportContextObstacles: React.FC<AirportContextObstaclesProps> = ({
  airport,
  radiusNm,
  minHeightFilter,
  heightExaggeration,
  showLabels,
  excludeOasNumbers,
  onObstaclesLoaded,
}) => {
  const { data: obstacles } = useSearchObstaclesNearbyQuery(
    {
      lat: airport.lat,
      lon: airport.lon,
      radiusNm,
      minHeightAgl: minHeightFilter,
      limit: 500,
    },
    {
      // Always query if we have the airport (being in the list means obstacles should show)
      skip: false,
    }
  );

  // Filter out obstacles that are already shown by route (to avoid duplicates)
  const filteredObstacles = useMemo(() => {
    if (!obstacles) return [];
    return obstacles.filter((obs) => !excludeOasNumbers.has(obs.oasNumber || ''));
  }, [obstacles, excludeOasNumbers]);

  // Report obstacles to parent for click handling
  useEffect(() => {
    if (onObstaclesLoaded) {
      onObstaclesLoaded(filteredObstacles);
    }
  }, [filteredObstacles, onObstaclesLoaded]);

  if (filteredObstacles.length === 0) {
    return null;
  }

  return (
    <>
      {filteredObstacles.map((obstacle) => (
        <ObstacleEntity
          key={`airport-${airport.icaoOrIdent}-${obstacle.oasNumber}`}
          obstacle={obstacle}
          heightExaggeration={heightExaggeration}
          showLabel={showLabels}
        />
      ))}
    </>
  );
};

export default AirportContextObstacles;
