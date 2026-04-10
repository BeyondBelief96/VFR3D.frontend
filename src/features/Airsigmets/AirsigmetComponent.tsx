import React, { useEffect, useCallback, useMemo } from 'react';
import { Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, Entity } from 'cesium';
import { useDispatch } from 'react-redux';
import { useCesium } from 'resium';
import { useGetAllAirsigmetsQuery } from '@/redux/api/preflight/weather.api';
import { PolygonEntity } from '@/components/Cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getAirsigmetEntityId } from '@/utility/entityIdUtils';
import { getEntityFromPick } from '@/components/Cesium/hooks/cesiumHelpers';
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

  // Single bulk query — filter by hazard type client-side
  const {
    data: allFetchedAirsigmets,
    isFetching,
    isLoading: isLoadingData,
  } = useGetAllAirsigmetsQuery(undefined, {
    skip: !isAnyHazardSelected,
    pollingInterval: POLLING_INTERVAL,
    refetchOnMountOrArgChange: true,
  });

  // Filter to only the enabled hazard types
  const allAirsigmets = useMemo(() => {
    if (!allFetchedAirsigmets) return [];
    return allFetchedAirsigmets.filter((airsigmet) => {
      const hazardType = airsigmet.hazard?.type !== undefined
        ? String(airsigmet.hazard.type)
        : undefined;
      if (!hazardType) return false;
      // Normalize hazard type key (API may return "MTN OBSCN" or "MTN_OBSCN")
      const normalizedKey = hazardType.replace(/\s+/g, '_');
      return sigmetHazards[normalizedKey as keyof typeof sigmetHazards] === true;
    });
  }, [allFetchedAirsigmets, sigmetHazards]);

  const isLoading = isAnyHazardSelected && (isFetching || isLoadingData);

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

      let pickedEntity: Entity | null = getEntityFromPick(viewer.scene.pick(movement.position));
      if (pickedEntity && pickedEntity.name === '__hover_overlay__') {
        const results = viewer.scene.drillPick(movement.position) as unknown[];
        pickedEntity = null;
        for (const r of results) {
          const ent = getEntityFromPick(r);
          if (ent && ent.name !== '__hover_overlay__') {
            pickedEntity = ent;
            break;
          }
        }
      }

      if (pickedEntity) {
        const pickedId = String(pickedEntity.id);
        const clickedAirsigmet = allAirsigmets.find(
          (a) => getAirsigmetEntityId(a) === pickedId
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
