import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  NearFarScalar,
} from 'cesium';
import { RootState } from '@/redux/store';
import {
  isSameLocationWaypointCartesian,
  mapWaypointToCartesian3,
  mapWaypointToCartesian3Flat,
} from '@/utility/cesiumUtils';
import { useCesium } from 'resium';
import { PolylineEntity } from '@/components/Cesium/PolylineEntity';
import { mapWaypointsFlat } from '@/utility/utils';
import { PointEntity } from '@/components/Cesium/PointEntity';
import { FlightDisplayMode } from '@/utility/enums';
import { updateWaypointPosition } from '@/redux/slices/flightPlanningSlice';
import { NavigationLegDto, WaypointDto, WaypointType } from '@/redux/api/vfr3d/dtos';
import { useDebounce } from '@uidotdev/usehooks';
import { setSelectedEntity, updateSelectedWaypointPosition } from '@/redux/slices/selectedEntitySlice';

const RouteComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer, camera, scene } = useCesium();

  const { lineColor, pointColor: endPointColor } = useSelector(
    (state: RootState) => state.routeStyle
  );

  const { displayMode, navlogPreview, draftFlightPlan, editingFlightPlan } =
    useSelector((state: RootState) => state.flightPlanning);

  const isEditable =
    displayMode === FlightDisplayMode.PLANNING || displayMode === FlightDisplayMode.EDITING;

  const isViewingFlight =
    displayMode === FlightDisplayMode.VIEWING || displayMode === FlightDisplayMode.PREVIEW;

  const { entity: selectedEntity, type: selectedType } = useSelector(
    (state: RootState) => state.selectedEntity
  );
  const selectedContext = useSelector((state: RootState) => state.selectedEntity.context);

  const renderPoints: WaypointDto[] = useMemo(() => {
    if (displayMode === FlightDisplayMode.PREVIEW && navlogPreview?.legs) {
      // Case: Previewing a draft flight's calculated navlog
      return navlogPreview.legs
        .flatMap((leg: NavigationLegDto) => [leg.legStartPoint, leg.legEndPoint])
        .filter((point): point is WaypointDto => point !== null && point !== undefined)
        .filter((point, index, self) => self.findIndex((p) => p.id === point.id) === index);
    }

    // Case: Planning - show draft flight plan waypoints
    if (displayMode === FlightDisplayMode.PLANNING) {
      return draftFlightPlan?.waypoints ?? [];
    }

    // Case: Editing - show copy of current flight plan points
    return editingFlightPlan?.waypoints?.map(mapWaypointsFlat) ?? [];
  }, [displayMode, navlogPreview, draftFlightPlan, editingFlightPlan]);

  // State to track the waypoint being dragged
  const [draggedWaypointId, setDraggedWaypointId] = useState<string | null>(null);
  const [draggedPosition, setDraggedPosition] = useState<Cartesian3 | null>(null);

  // Debounce the position updates during dragging
  const debouncedPosition = useDebounce(draggedPosition, 500);

  // Use a ref to track if we're currently dragging
  const isDraggingRef = useRef(false);

  // Effect to update the Redux state when the debounced position changes
  useEffect(() => {
    if (debouncedPosition && draggedWaypointId && isDraggingRef.current) {
      const cartographic = Cartographic.fromCartesian(debouncedPosition);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);

      dispatch(
        updateWaypointPosition({
          waypointId: draggedWaypointId,
          position: {
            latitude,
            longitude,
          },
        })
      );
    }
  }, [debouncedPosition, draggedWaypointId, dispatch]);

  const handleRouteLeftClick = (
    event: ScreenSpaceEventHandler.PositionedEvent,
    polylinePoints: Cartesian3[]
  ) => {
    if (!viewer || !scene || !camera || !isEditable) return;
    const pickRay = scene.camera.getPickRay(event.position);
    if (!pickRay) return;
    const world = scene.globe.pick(pickRay, scene);
    if (!world) return;

    // Find insertion index based on clicked segment
    const startPointIndex = renderPoints.findIndex((point) =>
      isSameLocationWaypointCartesian(polylinePoints[0], point)
    );

    const cartographic = Cartographic.fromCartesian(world);
    const latitude = CesiumMath.toDegrees(cartographic.latitude);
    const longitude = CesiumMath.toDegrees(cartographic.longitude);

    dispatch(
      setSelectedEntity({
        entity: {
          id: `temp-${Date.now()}`,
          name: '',
          latitude,
          longitude,
          waypointType: WaypointType.Custom,
        },
        type: 'Waypoint',
        context: { insertIndex: startPointIndex + 1 },
      })
    );
  };

  // Right-click blank map to create a temporary waypoint popup
  useEffect(() => {
    if (!viewer || !scene || !camera) return;
    if (!isEditable) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    const handleContext = (pos: Cartesian2) => {
      const pickRay = scene.camera.getPickRay(pos);
      if (!pickRay) return;
      const world = scene.globe.pick(pickRay, scene);
      if (!world) return;
      // Use selected entity popup for waypoint info
      const cartographic = Cartographic.fromCartesian(world);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      dispatch(
        setSelectedEntity({
          entity: {
            id: `temp-${Date.now()}`,
            name: '',
            latitude,
            longitude,
            waypointType: WaypointType.Custom,
          },
          type: 'Waypoint',
          context: undefined,
        })
      );
    };

    handler.setInputAction((e: ScreenSpaceEventHandler.PositionedEvent) => {
      handleContext(e.position);
    }, ScreenSpaceEventType.RIGHT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [viewer, scene, camera, isEditable, renderPoints.length, dispatch]);

  const handleWaypointDrag = (waypointId: string, position: Cartesian3) => {
    // Set the dragging ref to true
    isDraggingRef.current = true;

    // Update the local state for visual feedback
    setDraggedWaypointId(waypointId);
    setDraggedPosition(position);

    // Keep selected waypoint popup (if open) in sync live
    const cartographic = Cartographic.fromCartesian(position);
    const latitude = CesiumMath.toDegrees(cartographic.latitude);
    const longitude = CesiumMath.toDegrees(cartographic.longitude);
    dispatch(updateSelectedWaypointPosition({ latitude, longitude }));
  };

  const handleWaypointDragEnd = (waypointId: string, position: Cartesian3) => {
    // Set the dragging ref to false
    isDraggingRef.current = false;

    // Update the final position immediately
    const cartographic = Cartographic.fromCartesian(position);
    const latitude = CesiumMath.toDegrees(cartographic.latitude);
    const longitude = CesiumMath.toDegrees(cartographic.longitude);

    dispatch(
      updateWaypointPosition({
        waypointId,
        position: {
          latitude,
          longitude,
        },
      })
    );

    // Also update the selected waypoint (if popup open) to reflect final drag position
    dispatch(updateSelectedWaypointPosition({ latitude, longitude }));

    // Clear the dragged waypoint state
    setDraggedWaypointId(null);
    setDraggedPosition(null);
  };

  const mapWaypointToPosition =
    displayMode === FlightDisplayMode.PLANNING
      ? mapWaypointToCartesian3Flat
      : mapWaypointToCartesian3;

  return (
    <>
      {renderPoints?.map((point: WaypointDto, index: number) => {
        const position = mapWaypointToPosition(point);
        const waypointShouldDisplay =
          point.waypointType === WaypointType.Custom ||
          point.waypointType === WaypointType.CalculatedPoint;

        if (!position || !waypointShouldDisplay) return null;

        // Use the draggedPosition for the visual position if this point is being dragged
        const displayPosition =
          draggedWaypointId === point.id && draggedPosition ? draggedPosition : position;

        const isStartPoint = index % 2 === 0;
        const legIndex = isStartPoint ? index / 2 : (index - 1) / 2;
        const legId = `leg-${legIndex}`;
        const entityKey = `${point.id}-${legId}-${isStartPoint ? 'start' : 'end'}`;

        const pointId = isViewingFlight ? `navlog-leg${legIndex} + ${point.id}` : point.id;

        return (
          <PointEntity
            key={entityKey}
            pixelSize={15}
            position={displayPosition}
            color={Color.fromCssColorString(endPointColor)}
            id={pointId ?? ''}
            onLeftClick={() => {
              // Open popup for existing waypoint (edit/delete)
              const target = point;
              if (!target) return;
              dispatch(
                setSelectedEntity({
                  entity: target,
                  type: 'Waypoint',
                  context: {
                    waypointId: target.id,
                    mode: 'existing',
                    originalName: target.name ?? '',
                    originalLat: target.latitude,
                    originalLon: target.longitude,
                  },
                })
              );
            }}
            draggable={true}
            onDrag={handleWaypointDrag}
            onDragEnd={handleWaypointDragEnd}
            labelText={point.name}
            labelBackgroundColor={Color.fromCssColorString(endPointColor)}
            labelScaleByDistance={new NearFarScalar(100000, 0.5, 500000, 0.3)}
            labelPixelOffset={new Cartesian2(0, -20)}
          />
        );
      })}

      {/* Temporary waypoint preview when selecting on blank map */}
      {selectedType === 'Waypoint' && selectedEntity && selectedContext?.mode !== 'existing' && (
        (() => {
          const tempWp = selectedEntity as WaypointDto;
          const pos = mapWaypointToPosition(tempWp);
          if (!pos) return null;
          return (
            <PointEntity
              key={`temp-${tempWp.id}`}
              pixelSize={15}
              position={pos}
              color={Color.MAGENTA}
              id={`temp-${tempWp.id}`}
              draggable={true}
              onDrag={(_id, dragPos) => {
                const c = Cartographic.fromCartesian(dragPos);
                const lat = CesiumMath.toDegrees(c.latitude);
                const lon = CesiumMath.toDegrees(c.longitude);
                dispatch(updateSelectedWaypointPosition({ latitude: lat, longitude: lon }));
              }}
              onDragEnd={(_id, dragPos) => {
                const c = Cartographic.fromCartesian(dragPos);
                const lat = CesiumMath.toDegrees(c.latitude);
                const lon = CesiumMath.toDegrees(c.longitude);
                dispatch(updateSelectedWaypointPosition({ latitude: lat, longitude: lon }));
              }}
              labelText={tempWp.name || 'New waypoint'}
              labelBackgroundColor={Color.MAGENTA}
              labelScaleByDistance={new NearFarScalar(100000, 0.5, 500000, 0.3)}
              labelPixelOffset={new Cartesian2(0, -20)}
            />
          );
        })()
      )}

      {renderPoints?.map((point: WaypointDto, index: number) => {
        if (index === 0) return null;

        const prevPoint = renderPoints[index - 1];
        const prevPosition = mapWaypointToPosition(prevPoint);
        const currPosition = mapWaypointToPosition(point);
        if (!prevPosition || !currPosition) return null;

        const polylineId = `route-polyline-${prevPoint.id}-${point.id}`;

        return (
          <PolylineEntity
            key={polylineId}
            positions={[prevPosition, currPosition]}
            color={Color.fromCssColorString(lineColor)}
            id={polylineId}
            width={5}
            onLeftClick={handleRouteLeftClick}
          />
        );
      })}
    </>
  );
};

export default RouteComponent;
