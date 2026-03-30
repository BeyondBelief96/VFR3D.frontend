import { ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from 'cesium';
import React, { useEffect, useRef, useMemo } from 'react';
import { useCesium } from 'resium';
import { useDispatch } from 'react-redux';
import { PirepEntity } from './PirepEntity';
import { useGetAllPirepsQuery } from '@/redux/api/preflight/weather.api';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { mapPirepToCartesian3, isVisibleFromCamera } from '@/utility/cesiumUtils';

export const Pireps: React.FC = () => {
  const showPireps = useAppSelector((state) => state.pireps.showPireps);
  const { data: pireps, isSuccess } = useGetAllPirepsQuery(undefined, {
    skip: !showPireps,
    pollingInterval: showPireps ? 300 * 1000 : undefined,
    refetchOnMountOrArgChange: true,
  });
  const { viewer } = useCesium();
  const dispatch = useDispatch();
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    const handleClick = (movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      const pickedObject = viewer.scene.pick(movement.position);

      if (pickedObject && pickedObject.id) {
        const pirepId = pickedObject.id.id;
        const clickedPirep = pireps?.find((pirep) => pirep.id?.toString() === pirepId);

        if (clickedPirep) {
          dispatch(setSelectedEntity({ entity: clickedPirep, type: 'Pirep' }));
        }
      }
    };

    handler.setInputAction(handleClick, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, pireps, dispatch]);

  // Pre-compute Cartesian3 positions for occlusion checks
  const pirepPositions = useMemo(() => {
    const map = new Map<string, Cartesian3>();
    if (!pireps) return map;
    for (const pirep of pireps) {
      const id = pirep.id?.toString();
      if (!id) continue;
      const pos = mapPirepToCartesian3(pirep);
      if (pos) map.set(id, pos);
    }
    return map;
  }, [pireps]);

  // Globe occlusion culling — hide PIREPs behind the earth's ellipsoid
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || pirepPositions.size === 0) return;

    const radii = viewer.scene.globe.ellipsoid.radii;

    const updateVisibility = () => {
      const cam = viewer.camera.positionWC;
      for (const [id, position] of pirepPositions) {
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
        for (const [id] of pirepPositions) {
          const entity = viewer.entities.getById(id);
          if (entity) entity.show = true;
        }
      }
    };
  }, [viewer, pirepPositions]);

  return isSuccess && showPireps ? (
    <>
      {pireps.map((pirep) => {
        return <PirepEntity key={pirep.id} pirep={pirep} />;
      })}
    </>
  ) : null;
};
