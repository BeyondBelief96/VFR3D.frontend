import React, { useEffect, useCallback, useMemo } from 'react';
import { Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from 'cesium';
import { useDispatch } from 'react-redux';
import { useCesium } from 'resium';
import {
  useGetMtObscGAirmetsQuery,
  useGetIfrGAirmetsQuery,
  useGetTurbLoGAirmetsQuery,
  useGetTurbHiGAirmetsQuery,
  useGetLlwsGAirmetsQuery,
  useGetSfcWindGAirmetsQuery,
  useGetIceGAirmetsQuery,
  useGetFzlvlGAirmetsQuery,
  useGetMFzlvlGAirmetsQuery,
} from '@/redux/api/vfr3d/weather.api';
import { PolygonEntity } from '@/components/Cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getGAirmetEntityId } from '@/utility/entityIdUtils';
import { GAirmetDto, GAirmetPoint, GAirmetHazardType } from '@/redux/api/vfr3d/dtos';
import { Center, Loader } from '@mantine/core';
import type { RootState } from '@/redux/store';

const POLLING_INTERVAL = 600 * 1000; // 10 minutes

export const GAirmetComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer } = useCesium();
  const gairmetHazards = useAppSelector((state: RootState) => state.airsigmet.gairmetHazards);

  // Check if any hazard is selected
  const isAnyHazardSelected = useMemo(() => {
    return Object.values(gairmetHazards).some((value) => value === true);
  }, [gairmetHazards]);

  // Individual queries per hazard type with skip when not enabled
  const { data: mtObscGAirmets, isFetching: isFetchingMtObsc, isLoading: isLoadingMtObsc } =
    useGetMtObscGAirmetsQuery(undefined, {
      skip: !gairmetHazards.MT_OBSC,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: ifrGAirmets, isFetching: isFetchingIfr, isLoading: isLoadingIfr } =
    useGetIfrGAirmetsQuery(undefined, {
      skip: !gairmetHazards.IFR,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: turbLoGAirmets, isFetching: isFetchingTurbLo, isLoading: isLoadingTurbLo } =
    useGetTurbLoGAirmetsQuery(undefined, {
      skip: !gairmetHazards.TURB_LO,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: turbHiGAirmets, isFetching: isFetchingTurbHi, isLoading: isLoadingTurbHi } =
    useGetTurbHiGAirmetsQuery(undefined, {
      skip: !gairmetHazards.TURB_HI,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: llwsGAirmets, isFetching: isFetchingLlws, isLoading: isLoadingLlws } =
    useGetLlwsGAirmetsQuery(undefined, {
      skip: !gairmetHazards.LLWS,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: sfcWindGAirmets, isFetching: isFetchingSfcWind, isLoading: isLoadingSfcWind } =
    useGetSfcWindGAirmetsQuery(undefined, {
      skip: !gairmetHazards.SFC_WIND,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: iceGAirmets, isFetching: isFetchingIce, isLoading: isLoadingIce } =
    useGetIceGAirmetsQuery(undefined, {
      skip: !gairmetHazards.ICE,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: fzlvlGAirmets, isFetching: isFetchingFzlvl, isLoading: isLoadingFzlvl } =
    useGetFzlvlGAirmetsQuery(undefined, {
      skip: !gairmetHazards.FZLVL,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  const { data: mFzlvlGAirmets, isFetching: isFetchingMFzlvl, isLoading: isLoadingMFzlvl } =
    useGetMFzlvlGAirmetsQuery(undefined, {
      skip: !gairmetHazards.M_FZLVL,
      pollingInterval: POLLING_INTERVAL,
      refetchOnMountOrArgChange: true,
    });

  // Combine all visible G-AIRMETs
  const allGAirmets = useMemo(() => {
    const combined: GAirmetDto[] = [];
    if (gairmetHazards.MT_OBSC && mtObscGAirmets) combined.push(...mtObscGAirmets);
    if (gairmetHazards.IFR && ifrGAirmets) combined.push(...ifrGAirmets);
    if (gairmetHazards.TURB_LO && turbLoGAirmets) combined.push(...turbLoGAirmets);
    if (gairmetHazards.TURB_HI && turbHiGAirmets) combined.push(...turbHiGAirmets);
    if (gairmetHazards.LLWS && llwsGAirmets) combined.push(...llwsGAirmets);
    if (gairmetHazards.SFC_WIND && sfcWindGAirmets) combined.push(...sfcWindGAirmets);
    if (gairmetHazards.ICE && iceGAirmets) combined.push(...iceGAirmets);
    if (gairmetHazards.FZLVL && fzlvlGAirmets) combined.push(...fzlvlGAirmets);
    if (gairmetHazards.M_FZLVL && mFzlvlGAirmets) combined.push(...mFzlvlGAirmets);
    return combined;
  }, [
    gairmetHazards,
    mtObscGAirmets,
    ifrGAirmets,
    turbLoGAirmets,
    turbHiGAirmets,
    llwsGAirmets,
    sfcWindGAirmets,
    iceGAirmets,
    fzlvlGAirmets,
    mFzlvlGAirmets,
  ]);

  const isLoading =
    (gairmetHazards.MT_OBSC && (isFetchingMtObsc || isLoadingMtObsc)) ||
    (gairmetHazards.IFR && (isFetchingIfr || isLoadingIfr)) ||
    (gairmetHazards.TURB_LO && (isFetchingTurbLo || isLoadingTurbLo)) ||
    (gairmetHazards.TURB_HI && (isFetchingTurbHi || isLoadingTurbHi)) ||
    (gairmetHazards.LLWS && (isFetchingLlws || isLoadingLlws)) ||
    (gairmetHazards.SFC_WIND && (isFetchingSfcWind || isLoadingSfcWind)) ||
    (gairmetHazards.ICE && (isFetchingIce || isLoadingIce)) ||
    (gairmetHazards.FZLVL && (isFetchingFzlvl || isLoadingFzlvl)) ||
    (gairmetHazards.M_FZLVL && (isFetchingMFzlvl || isLoadingMFzlvl));

  // Get color based on hazard type
  const getColorForHazard = useCallback((hazard?: GAirmetHazardType): Color => {
    switch (hazard) {
      // SIERRA hazards (gray tones)
      case GAirmetHazardType.MT_OBSC:
        return Color.fromCssColorString('#6b7280').withAlpha(0.25); // Gray
      case GAirmetHazardType.IFR:
        return Color.fromCssColorString('#10b981').withAlpha(0.25); // Green

      // TANGO hazards (orange/yellow tones)
      case GAirmetHazardType.TURB_LO:
        return Color.fromCssColorString('#f97316').withAlpha(0.25); // Orange
      case GAirmetHazardType.TURB_HI:
        return Color.fromCssColorString('#ef4444').withAlpha(0.25); // Red-orange
      case GAirmetHazardType.LLWS:
        return Color.fromCssColorString('#eab308').withAlpha(0.25); // Yellow
      case GAirmetHazardType.SFC_WIND:
        return Color.fromCssColorString('#a855f7').withAlpha(0.25); // Purple

      // ZULU hazards (blue/cyan tones)
      case GAirmetHazardType.ICE:
        return Color.fromCssColorString('#22d3ee').withAlpha(0.25); // Cyan
      case GAirmetHazardType.FZLVL:
        return Color.fromCssColorString('#3b82f6').withAlpha(0.25); // Blue
      case GAirmetHazardType.M_FZLVL:
        return Color.fromCssColorString('#6366f1').withAlpha(0.25); // Indigo

      default:
        return Color.BLUE.withAlpha(0.25);
    }
  }, []);

  // Filter G-AIRMETs with valid polygon data and not expired
  const visibleGAirmets = useMemo(() => {
    const now = new Date();
    return allGAirmets.filter((gairmet) => {
      // Must have valid polygon data
      if (!gairmet.area || !gairmet.area.points || gairmet.area.points.length < 3) {
        return false;
      }
      // Filter out expired G-AIRMETs
      if (gairmet.expireTime) {
        const expireTime = new Date(gairmet.expireTime);
        if (expireTime < now) {
          return false;
        }
      }
      return true;
    });
  }, [allGAirmets]);

  // Convert feet to meters
  const feetToMeters = (feet: number): number => feet * 0.3048;

  // Thin layer thickness in feet (for single altitude levels)
  const THIN_LAYER_THICKNESS_FT = 1000;

  // Parse altitude string value - handles special cases like "FZL", "SFC00", etc.
  const parseAltitudeValue = (value: string | undefined): number | null => {
    if (!value) return null;

    // Handle surface values (SFC, SFC00, etc.)
    if (value.toUpperCase().startsWith('SFC')) {
      return 0;
    }

    // Handle "FZL" - this is a special marker, not an actual altitude
    if (value.toUpperCase() === 'FZL') {
      return null;
    }

    // Try to parse as a number
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Convert G-AIRMET to polygon props
  const convertGAirmetToPolygonProps = useCallback(
    (gairmet: GAirmetDto) => {
      const points =
        gairmet.area?.points?.map((point: GAirmetPoint) =>
          Cartesian3.fromDegrees(Number(point.longitude), Number(point.latitude))
        ) || [];

      // Default heights (in meters) - thin layer at surface if no altitude info
      let minHeight = 0;
      let maxHeight = feetToMeters(THIN_LAYER_THICKNESS_FT);

      if (gairmet.altitudes && gairmet.altitudes.length > 0) {
        const altitude = gairmet.altitudes[0];

        // Case 1: Only levelFtMsl provided (single altitude) - thin layer AT that altitude
        if (altitude.levelFtMsl && !altitude.minFtMsl && !altitude.maxFtMsl) {
          const levelFeet = parseAltitudeValue(altitude.levelFtMsl);
          if (levelFeet !== null) {
            // Thin layer centered on the level altitude
            const halfThickness = THIN_LAYER_THICKNESS_FT / 2;
            minHeight = feetToMeters(Math.max(0, levelFeet - halfThickness));
            maxHeight = feetToMeters(levelFeet + halfThickness);
          }
        }
        // Case 2: Both min and max provided - render full altitude range
        else if (altitude.minFtMsl || altitude.maxFtMsl) {
          // Parse minFtMsl - if it's "FZL", use fzlAltitude.minFtMsl instead
          let minFeet: number | null = null;
          if (altitude.minFtMsl?.toUpperCase() === 'FZL' && altitude.fzlAltitude?.minFtMsl) {
            minFeet = parseAltitudeValue(altitude.fzlAltitude.minFtMsl);
          } else {
            minFeet = parseAltitudeValue(altitude.minFtMsl);
          }

          // Parse maxFtMsl - if it's "FZL", use fzlAltitude.maxFtMsl instead
          let maxFeet: number | null = null;
          if (altitude.maxFtMsl?.toUpperCase() === 'FZL' && altitude.fzlAltitude?.maxFtMsl) {
            maxFeet = parseAltitudeValue(altitude.fzlAltitude.maxFtMsl);
          } else {
            maxFeet = parseAltitudeValue(altitude.maxFtMsl);
          }

          // Only set heights if we have valid values for both
          if (minFeet !== null && maxFeet !== null) {
            minHeight = feetToMeters(minFeet);
            maxHeight = feetToMeters(maxFeet);
          } else if (minFeet !== null && maxFeet === null) {
            // Only min is valid - thin layer at min altitude
            const halfThickness = THIN_LAYER_THICKNESS_FT / 2;
            minHeight = feetToMeters(Math.max(0, minFeet - halfThickness));
            maxHeight = feetToMeters(minFeet + halfThickness);
          } else if (maxFeet !== null && minFeet === null) {
            // Only max is valid - thin layer at max altitude
            const halfThickness = THIN_LAYER_THICKNESS_FT / 2;
            minHeight = feetToMeters(Math.max(0, maxFeet - halfThickness));
            maxHeight = feetToMeters(maxFeet + halfThickness);
          }
        }
      }

      return {
        points,
        minHeight,
        maxHeight,
        color: getColorForHazard(gairmet.hazard),
        id: `gairmet-${gairmet.id}`,
      };
    },
    [getColorForHazard]
  );

  // Handle click events for entity selection
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      const pickedObject = viewer.scene.pick(movement.position);
      if (pickedObject && pickedObject.id) {
        const clickedGAirmet = allGAirmets.find(
          (g) => getGAirmetEntityId(g) === pickedObject.id.id
        );
        if (clickedGAirmet) {
          dispatch(setSelectedEntity({ entity: clickedGAirmet, type: 'GAirmet' }));
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, allGAirmets, dispatch]);

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
      {visibleGAirmets.map((gairmet) => (
        <PolygonEntity key={gairmet.id} {...convertGAirmetToPolygonProps(gairmet)} />
      ))}
    </>
  );
};

export default GAirmetComponent;
