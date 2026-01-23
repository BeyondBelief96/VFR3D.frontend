import React, { useEffect, useCallback, useMemo } from 'react';
import { Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from 'cesium';
import { useDispatch } from 'react-redux';
import { useCesium } from 'resium';
import { useGetAllAirsigmetsQuery } from '@/redux/api/vfr3d/weather.api';
import { PolygonEntity } from '@/components/Cesium';
import { HazardType } from '@/redux/slices/airsigmetsSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getAirsigmetEntityId } from '@/utility/entityIdUtils';
import { FEET_TO_METERS } from '@/utility/cesiumUtils';
import { AirsigmetDto, AirsigmetPoint } from '@/redux/api/vfr3d/dtos';
import { Center, Loader } from '@mantine/core';
import type { RootState } from '@/redux/store';

export const AirsigmetComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer } = useCesium();
  const visibleHazards = useAppSelector((state: RootState) => state.airsigmet.visibleHazards);

  const isAnyHazardSelected = useMemo(() => {
    return Object.values(visibleHazards).some((value) => value === true);
  }, [visibleHazards]);

  const {
    data: airsigmets,
    isFetching,
    isLoading,
  } = useGetAllAirsigmetsQuery(undefined, {
    skip: !isAnyHazardSelected,
    pollingInterval: 600 * 1000,
    refetchOnMountOrArgChange: true,
  });

  const getColorForHazard = useCallback((hazardType: HazardType, severity: string): Color => {
    switch (hazardType) {
      case 'CONVECTIVE':
        return severity === 'SEV' ? Color.RED.withAlpha(0.2) : Color.YELLOW.withAlpha(0.2);
      case 'ICE':
        return Color.CYAN.withAlpha(0.2);
      case 'TURB':
        return Color.ORANGE.withAlpha(0.2);
      case 'IFR':
        return Color.GREEN.withAlpha(0.2);
      case 'MTN OBSCN':
        return Color.PURPLE.withAlpha(0.2);
      default:
        return Color.BLUE.withAlpha(0.2);
    }
  }, []);

  const visibleAirsigmets = useMemo(() => {
    return (
      airsigmets?.filter(
        (airsigmet) =>
          airsigmet.areas &&
          airsigmet.areas[0].points &&
          airsigmet.areas[0].points.length >= 3 &&
          airsigmet.hazard?.type &&
          visibleHazards[airsigmet.hazard.type as HazardType]
      ) || []
    );
  }, [airsigmets, visibleHazards]);

  const convertAirsigmetToPolygonProps = useCallback(
    (airsigmet: AirsigmetDto) => {
      const points =
        airsigmet.areas?.[0]?.points?.map((point: AirsigmetPoint) =>
          Cartesian3.fromDegrees(Number(point.longitude), Number(point.latitude))
        ) || [];

      const minHeight = (airsigmet.altitude?.minFtMsl || 0) * FEET_TO_METERS;
      const maxHeight =
        (airsigmet.altitude?.maxFtMsl || minHeight / FEET_TO_METERS + 1000) * FEET_TO_METERS;

      return {
        points,
        minHeight,
        maxHeight,
        color: getColorForHazard(
          airsigmet.hazard?.type as HazardType,
          airsigmet.hazard?.severity || ''
        ),
        id: `airsigmet-${airsigmet.id}`,
      };
    },
    [getColorForHazard]
  );

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      const pickedObject = viewer.scene.pick(movement.position);
      if (pickedObject && pickedObject.id) {
        const clickedAirsigmet = airsigmets?.find(
          (a) => getAirsigmetEntityId(a) === pickedObject.id.id
        );
        if (clickedAirsigmet) {
          dispatch(setSelectedEntity({ entity: clickedAirsigmet, type: 'Airsigmet' }));
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, airsigmets, dispatch]);

  if (!isAnyHazardSelected) {
    return null;
  }

  if ((isFetching || isLoading) && isAnyHazardSelected) {
    return (
      <Center style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
      {visibleAirsigmets.map((airsigmet) => (
        <PolygonEntity key={airsigmet.id} {...convertAirsigmetToPolygonProps(airsigmet)} />
      ))}
    </>
  );
};

export default AirsigmetComponent;
