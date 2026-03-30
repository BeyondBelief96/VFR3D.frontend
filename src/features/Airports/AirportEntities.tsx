import React, { useEffect, useCallback, useMemo } from 'react';
import { ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from 'cesium';
import { useCesium } from 'resium';
import AirportEntity from './AirportEntity';
import { getAirportEntityIdFromAirport } from '@/utility/entityIdUtils';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { AirportDto, MetarDto } from '@/redux/api/vfr3d/dtos';
import { mapAirportDataToCartesian3Flat, isVisibleFromCamera } from '@/utility/cesiumUtils';

interface AirportEntitiesProps {
  airports: AirportDto[];
  metarMap: Map<string, MetarDto>;
}

const AirportEntities: React.FC<AirportEntitiesProps> = ({ airports, metarMap }) => {
  const { viewer } = useCesium();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(
    (movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || !viewer.cesiumWidget || viewer.isDestroyed()) return;
      const pickedObject = viewer.scene.pick(movement.position);
      if (pickedObject?.id) {
        const airport = airports.find(
          (airport) => getAirportEntityIdFromAirport(airport) === pickedObject.id.id
        );
        if (airport) {
          dispatch(setSelectedEntity({ entity: airport, type: 'Airport' }));
        }
      }
    },
    [viewer, airports, dispatch]
  );

  useEffect(() => {
    if (!viewer || !viewer.cesiumWidget || viewer.isDestroyed()) return;
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(handleClick, ScreenSpaceEventType.LEFT_CLICK);
    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, handleClick]);

  // Pre-compute Cartesian3 positions for occlusion checks
  const airportPositions = useMemo(() => {
    const map = new Map<string, Cartesian3>();
    for (const airport of airports) {
      const id = getAirportEntityIdFromAirport(airport);
      const pos = mapAirportDataToCartesian3Flat(airport);
      if (pos) map.set(id, pos);
    }
    return map;
  }, [airports]);

  // Globe occlusion culling — hide airports behind the earth's ellipsoid
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || airportPositions.size === 0) return;

    const radii = viewer.scene.globe.ellipsoid.radii;

    const updateVisibility = () => {
      const cam = viewer.camera.positionWC;
      for (const [id, position] of airportPositions) {
        const entity = viewer.entities.getById(id);
        if (entity) {
          entity.show = isVisibleFromCamera(cam, position, radii);
        }
      }
    };

    viewer.scene.preRender.addEventListener(updateVisibility);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.preRender.removeEventListener(updateVisibility);
        for (const [id] of airportPositions) {
          const entity = viewer.entities.getById(id);
          if (entity) entity.show = true;
        }
      }
    };
  }, [viewer, airportPositions]);

  return (
    <>
      {airports.map((airport) => (
        <AirportEntity
          key={airport.siteNo}
          airport={airport}
          metar={metarMap.get(airport.icaoId || 'K' + airport.arptId)}
        />
      ))}
    </>
  );
};

export default AirportEntities;
