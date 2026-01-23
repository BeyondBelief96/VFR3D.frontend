import { ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import { useDispatch } from 'react-redux';
import { PirepEntity } from './PirepEntity';
import { useGetAllPirepsQuery } from '@/redux/api/vfr3d/weather.api';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';

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

  return isSuccess && showPireps ? (
    <>
      {pireps.map((pirep) => {
        return <PirepEntity key={pirep.id} pirep={pirep} />;
      })}
    </>
  ) : null;
};
