import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Stack,
  Text,
  Paper,
  Group,
  ActionIcon,
  Badge,
  Switch,
  NumberInput,
} from '@mantine/core';
import { FiTrash2, FiNavigation, FiMapPin, FiMap, FiMenu } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppDispatch } from '@/redux/store';
import { useCalcBearingAndDistanceMutation } from '@/redux/api/vfr3d/navlog.api';
import { mapAirportDTOToWaypoint } from '@/utility/utils';
import { setShowSelectedStateAirports, setSearchedAirportState } from '@/redux/slices/airportsSlice';
import AirportSearch from '@/components/Search/AirportSearch';
import { AirportDto, BearingAndDistanceResponseDto, WaypointDto, WaypointType } from '@/redux/api/vfr3d/dtos';
import { setWaypointRefuel } from '@/redux/slices/flightPlanningSlice';
import { SUCCESS_BG, ERROR_BG, HIGHLIGHT, THEME_COLORS, SHADOW } from '@/constants/surfaces';

interface FlightRouteBuilderProps {
  routePoints: WaypointDto[];
  onRoutePointsChange: (points: WaypointDto[]) => void;
  disabled: boolean;
}

interface SortableWaypointProps {
  waypoint: WaypointDto;
  index: number;
  waypointsLength: number;
  legData: { [key: string]: BearingAndDistanceResponseDto };
  waypoints: WaypointDto[];
  disabled: boolean;
  onRemove: (name: string) => void;
  dispatch: AppDispatch;
}

const SortableWaypoint: React.FC<SortableWaypointProps> = ({
  waypoint,
  index,
  waypointsLength,
  legData,
  waypoints,
  disabled,
  onRemove,
  dispatch,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id || `waypoint-${index}`, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        p="sm"
        radius="md"
        withBorder
        style={{
          cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
          borderColor: isDragging ? THEME_COLORS.PRIMARY : undefined,
          borderWidth: isDragging ? 2 : 1,
          boxShadow: isDragging ? SHADOW.BOX_HOVER : undefined,
          backgroundColor: isDragging ? THEME_COLORS.DARK_5 : undefined,
          transform: isDragging ? 'scale(1.02)' : undefined,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            {/* Drag handle - always visible for touch users */}
            <Box
              {...attributes}
              {...listeners}
              style={{
                cursor: disabled ? 'default' : 'grab',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <FiMenu size={16} color={THEME_COLORS.TEXT_MUTED} />
            </Box>
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor:
                  index === 0
                    ? SUCCESS_BG.DEFAULT
                    : index === waypointsLength - 1
                    ? ERROR_BG.SUBTLE
                    : HIGHLIGHT.DEFAULT,
                color:
                  index === 0
                    ? THEME_COLORS.GREEN_6
                    : index === waypointsLength - 1
                    ? THEME_COLORS.RED_6
                    : THEME_COLORS.BLUE_6,
              }}
            >
              {index === 0 ? (
                <FaPlane size={14} />
              ) : index === waypointsLength - 1 ? (
                <FiMapPin size={14} />
              ) : (
                <FiNavigation size={14} />
              )}
            </Box>
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text size="sm" fw={600} truncate>
                {waypoint.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {waypoint.latitude?.toFixed(4)}°, {waypoint.longitude?.toFixed(4)}°
              </Text>
            </Box>
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            onClick={() => onRemove(waypoint.name || '')}
            disabled={disabled}
          >
            <FiTrash2 size={16} />
          </ActionIcon>
        </Group>

        {/* Refueling option for intermediate airports */}
        {waypoint.waypointType === WaypointType.Airport && index > 0 && index < waypointsLength - 1 && (
          <Box mt="sm" pt="sm" style={{ borderTop: `1px solid ${THEME_COLORS.DARK_4}` }}>
            <Switch
              size="sm"
              label="Refueling stop"
              checked={!!waypoint.isRefuelingStop}
              onChange={(e) =>
                dispatch(
                  setWaypointRefuel({
                    waypointId: waypoint.id || '',
                    isRefuel: e.currentTarget.checked,
                  })
                )
              }
              disabled={disabled}
            />
            {waypoint.isRefuelingStop && (
              <Group gap="sm" mt="xs" wrap="wrap">
                <Switch
                  size="xs"
                  label="Refuel to full"
                  checked={waypoint.refuelToFull ?? true}
                  onChange={(e) =>
                    dispatch(
                      setWaypointRefuel({
                        waypointId: waypoint.id || '',
                        isRefuel: true,
                        refuelToFull: e.currentTarget.checked,
                      })
                    )
                  }
                  disabled={disabled}
                />
                {!(waypoint.refuelToFull ?? true) && (
                  <NumberInput
                    size="xs"
                    w={{ base: 70, sm: 80 }}
                    value={waypoint.refuelGallons}
                    onChange={(v) =>
                      dispatch(
                        setWaypointRefuel({
                          waypointId: waypoint.id || '',
                          isRefuel: true,
                          refuelToFull: false,
                          refuelGallons: typeof v === 'number' ? v : undefined,
                        })
                      )
                    }
                    min={0}
                    disabled={disabled}
                    suffix=" gal"
                  />
                )}
              </Group>
            )}
          </Box>
        )}

        {/* Leg info */}
        {index < waypointsLength - 1 && legData[`${waypoint.id}~${waypoints[index + 1].id}`] && (
          <Group gap="xs" mt="xs" wrap="wrap">
            <Badge size="xs" variant="light">
              {legData[`${waypoint.id}~${waypoints[index + 1].id}`].trueCourse?.toFixed(0)}° TC
            </Badge>
            <Badge size="xs" variant="light">
              {legData[`${waypoint.id}~${waypoints[index + 1].id}`].distance?.toFixed(1)} nm
            </Badge>
          </Group>
        )}
      </Paper>
    </div>
  );
};

const FlightRouteBuilder: React.FC<FlightRouteBuilderProps> = ({
  routePoints: waypoints,
  onRoutePointsChange,
  disabled,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [legData, setLegData] = useState<{ [key: string]: BearingAndDistanceResponseDto }>({});
  const [calcBearingAndDistance] = useCalcBearingAndDistanceMutation();
  const [totalDistance, setTotalDistance] = useState<number>(0);

  // Configure sensors for both mouse and touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchBearingAndDistance = async (
      startPoint: WaypointDto,
      endPoint: WaypointDto
    ): Promise<BearingAndDistanceResponseDto> => {
      const response = await calcBearingAndDistance({
        startLatitude: startPoint.latitude,
        startLongitude: startPoint.longitude,
        endLatitude: endPoint.latitude,
        endLongitude: endPoint.longitude,
      }).unwrap();
      return response;
    };

    const calculateLegs = async () => {
      const data: { [key: string]: BearingAndDistanceResponseDto } = {};
      let distance = 0;

      for (let i = 0; i < waypoints.length - 1; i++) {
        const startPoint = waypoints[i];
        const endPoint = waypoints[i + 1];
        const legKey = `${startPoint.id}~${endPoint.id}`;
        const legResult = await fetchBearingAndDistance(startPoint, endPoint);
        data[legKey] = legResult;
        distance += legResult.distance || 0;
      }

      setLegData(data);
      setTotalDistance(distance);
    };

    if (waypoints.length > 1) {
      calculateLegs();
    } else {
      setLegData({});
      setTotalDistance(0);
    }
  }, [waypoints, calcBearingAndDistance]);

  const handleAirportSelect = (airport: AirportDto) => {
    if (
      airport &&
      !waypoints.some((point: WaypointDto) => point.name === (airport.icaoId || airport.arptId))
    ) {
      const newRoutePoint = mapAirportDTOToWaypoint(airport);
      onRoutePointsChange([...waypoints, newRoutePoint]);
      dispatch(setShowSelectedStateAirports(true));
      // Clear the header search state so only route-based airports show
      dispatch(setSearchedAirportState(''));
    }
  };

  const handleRemoveRoutePoint = (name: string) => {
    if (disabled) return;
    onRoutePointsChange(waypoints.filter((point) => point.name !== name));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || disabled) return;

    const oldIndex = waypoints.findIndex((w) => (w.id || `waypoint-${waypoints.indexOf(w)}`) === active.id);
    const newIndex = waypoints.findIndex((w) => (w.id || `waypoint-${waypoints.indexOf(w)}`) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const dragged = waypoints[oldIndex];

    // Rule: Only an Airport can become the first waypoint
    if (newIndex === 0 && dragged?.waypointType !== WaypointType.Airport) {
      return;
    }
    // Rule: If moving the current first away, the next item must be an Airport
    if (oldIndex === 0 && newIndex !== 0) {
      const wouldBeFirst = waypoints[1];
      if (!wouldBeFirst || wouldBeFirst.waypointType !== WaypointType.Airport) {
        return;
      }
    }

    const updated = [...waypoints];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    onRoutePointsChange(updated);
  };

  return (
    <Stack gap="sm" h="100%">
      {/* Search */}
      <Box>
        <AirportSearch
          onAirportSelect={handleAirportSelect}
          placeholder="Add airport to route..."
          clearOnSelect={true}
          setAsSelectedEntity={false}
        />
      </Box>

      {/* Stats */}
      {waypoints.length > 1 && (
        <Paper p="xs" radius="md" withBorder>
          <Group justify="space-around">
            <Box ta="center">
              <Text size="xs" c="dimmed">Distance</Text>
              <Text fw={600}>{totalDistance.toFixed(1)} nm</Text>
            </Box>
            <Box ta="center">
              <Text size="xs" c="dimmed">Waypoints</Text>
              <Text fw={600}>{waypoints.length}</Text>
            </Box>
          </Group>
        </Paper>
      )}

      {/* Waypoints List */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        {waypoints.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={waypoints.map((w, i) => w.id || `waypoint-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="xs">
                {waypoints.map((point: WaypointDto, index: number) => (
                  <SortableWaypoint
                    key={point.id || `waypoint-${index}`}
                    waypoint={point}
                    index={index}
                    waypointsLength={waypoints.length}
                    legData={legData}
                    waypoints={waypoints}
                    disabled={disabled}
                    onRemove={handleRemoveRoutePoint}
                    dispatch={dispatch}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          <Paper p="xl" radius="md" withBorder ta="center">
            <FiMap size={32} style={{ opacity: 0.5 }} />
            <Text size="sm" fw={500} mt="sm">
              Your flight route is empty
            </Text>
            <Text size="xs" c="dimmed">
              Search for an airport above to start building your route
            </Text>
          </Paper>
        )}
      </Box>
    </Stack>
  );
};

export default FlightRouteBuilder;
