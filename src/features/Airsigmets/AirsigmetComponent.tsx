import React, { useEffect, useCallback, useMemo } from 'react';
import { Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from 'cesium';
import { useDispatch } from 'react-redux';
import { useCesium } from 'resium';
import {
  useGetConvectiveAirsigmetsQuery,
  useGetIceAirsigmetsQuery,
  useGetTurbAirsigmetsQuery,
  useGetIfrAirsigmetsQuery,
  useGetMtnObscnAirsigmetsQuery,
} from '@/redux/api/vfr3d/weather.api';
import { PolygonEntity } from '@/components/Cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getAirsigmetEntityId } from '@/utility/entityIdUtils';
import { FEET_TO_METERS } from '@/utility/cesiumUtils';
import { AirsigmetDto, AirsigmetPoint } from '@/redux/api/vfr3d/dtos';
import { Center, Loader } from '@mantine/core';
import type { RootState } from '@/redux/store';

const POLLING_INTERVAL = 600 * 1000; // 10 minutes

export const AirsigmetComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer } = useCesium();
  const sigmetHazards = useAppSelector((state: RootState) => state.airsigmet.sigmetHazards);

  const isAnyHazardSelected = useMemo(() => {
    return Object.values(sigmetHazards).some((value) => value === true);
  }, [sigmetHazards]);

  // Individual queries per hazard type with skip when not enabled
  const {
    data: convectiveAirsigmets,
    isFetching: isFetchingConvective,
    isLoading: isLoadingConvective,
  } = useGetConvectiveAirsigmetsQuery(undefined, {
    skip: !sigmetHazards.CONVECTIVE,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: iceAirsigmets,
    isFetching: isFetchingIce,
    isLoading: isLoadingIce,
  } = useGetIceAirsigmetsQuery(undefined, {
    skip: !sigmetHazards.ICE,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: turbAirsigmets,
    isFetching: isFetchingTurb,
    isLoading: isLoadingTurb,
  } = useGetTurbAirsigmetsQuery(undefined, {
    skip: !sigmetHazards.TURB,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: ifrAirsigmets,
    isFetching: isFetchingIfr,
    isLoading: isLoadingIfr,
  } = useGetIfrAirsigmetsQuery(undefined, {
    skip: !sigmetHazards.IFR,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: mtnObscnAirsigmets,
    isFetching: isFetchingMtnObscn,
    isLoading: isLoadingMtnObscn,
  } = useGetMtnObscnAirsigmetsQuery(undefined, {
    skip: !sigmetHazards.MTN_OBSCN,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  // Combine all visible AIRSIGMETs
  const allAirsigmets = useMemo(() => {
    const combined: AirsigmetDto[] = [];
    if (sigmetHazards.CONVECTIVE && convectiveAirsigmets) {
      combined.push(...convectiveAirsigmets);
    }
    if (sigmetHazards.ICE && iceAirsigmets) {
      combined.push(...iceAirsigmets);
    }
    if (sigmetHazards.TURB && turbAirsigmets) {
      combined.push(...turbAirsigmets);
    }
    if (sigmetHazards.IFR && ifrAirsigmets) {
      combined.push(...ifrAirsigmets);
    }
    if (sigmetHazards.MTN_OBSCN && mtnObscnAirsigmets) {
      combined.push(...mtnObscnAirsigmets);
    }
    return combined;
  }, [
    sigmetHazards,
    convectiveAirsigmets,
    iceAirsigmets,
    turbAirsigmets,
    ifrAirsigmets,
    mtnObscnAirsigmets,
  ]);

  const isLoading =
    (sigmetHazards.CONVECTIVE && (isFetchingConvective || isLoadingConvective)) ||
    (sigmetHazards.ICE && (isFetchingIce || isLoadingIce)) ||
    (sigmetHazards.TURB && (isFetchingTurb || isLoadingTurb)) ||
    (sigmetHazards.IFR && (isFetchingIfr || isLoadingIfr)) ||
    (sigmetHazards.MTN_OBSCN && (isFetchingMtnObscn || isLoadingMtnObscn));

  const getColorForHazard = useCallback((hazardType: string | undefined, severity: string): Color => {
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
      case 'MTN_OBSCN':
        return Color.PURPLE.withAlpha(0.2);
      default:
        return Color.BLUE.withAlpha(0.2);
    }
  }, []);

  const visibleAirsigmets = useMemo(() => {
    const now = new Date();
    return allAirsigmets.filter((airsigmet) => {
      // Must have valid polygon data
      if (!airsigmet.areas || !airsigmet.areas[0]?.points || airsigmet.areas[0].points.length < 3) {
        return false;
      }
      // Filter out expired AIRSIGMETs
      if (airsigmet.validTimeTo) {
        const expireTime = new Date(airsigmet.validTimeTo);
        if (expireTime < now) {
          return false;
        }
      }
      return true;
    });
  }, [allAirsigmets]);

  const convertAirsigmetToPolygonProps = useCallback(
    (airsigmet: AirsigmetDto) => {
      const points =
        airsigmet.areas?.[0]?.points?.map((point: AirsigmetPoint) =>
          Cartesian3.fromDegrees(Number(point.longitude), Number(point.latitude))
        ) || [];

      const minHeight = (airsigmet.altitude?.minFtMsl || 0) * FEET_TO_METERS;
      const maxHeight =
        (airsigmet.altitude?.maxFtMsl || minHeight / FEET_TO_METERS + 1000) * FEET_TO_METERS;

      // Get hazard type as string for color mapping
      const hazardTypeStr = airsigmet.hazard?.type !== undefined
        ? String(airsigmet.hazard.type)
        : undefined;

      return {
        points,
        minHeight,
        maxHeight,
        color: getColorForHazard(hazardTypeStr, airsigmet.hazard?.severity || ''),
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
        const clickedAirsigmet = allAirsigmets.find(
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
  }, [viewer, allAirsigmets, dispatch]);

  if (!isAnyHazardSelected) {
    return null;
  }

  if (isLoading && isAnyHazardSelected) {
    return (
      <Center
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
        }}
      >
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
