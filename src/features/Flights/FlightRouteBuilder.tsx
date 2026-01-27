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
import { FiTrash2, FiNavigation, FiMapPin, FiMap } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch } from '@/redux/store';
import { useCalcBearingAndDistanceMutation } from '@/redux/api/vfr3d/navlog.api';
import { mapAirportDTOToWaypoint } from '@/utility/utils';
import { setShowSelectedStateAirports, setSearchedAirportState } from '@/redux/slices/airportsSlice';
import AirportSearch from '@/components/Search/AirportSearch';
import { AirportDto, BearingAndDistanceResponseDto, WaypointDto, WaypointType } from '@/redux/api/vfr3d/dtos';
import { setWaypointRefuel } from '@/redux/slices/flightPlanningSlice';

interface FlightRouteBuilderProps {
  routePoints: WaypointDto[];
  onRoutePointsChange: (points: WaypointDto[]) => void;
  disabled: boolean;
}

const FlightRouteBuilder: React.FC<FlightRouteBuilderProps> = ({
  routePoints: waypoints,
  onRoutePointsChange,
  disabled,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [legData, setLegData] = useState<{ [key: string]: BearingAndDistanceResponseDto }>({});
  const [calcBearingAndDistance] = useCalcBearingAndDistanceMutation();
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index || disabled) return;
    const dragged = waypoints[dragIndex];
    // Rule: Only an Airport can become the first waypoint
    if (index === 0 && dragged?.waypointType !== WaypointType.Airport) {
      return;
    }
    // Rule: If moving the current first away, the next item must be an Airport
    if (dragIndex === 0 && index !== 0) {
      const wouldBeFirst = waypoints[1];
      if (!wouldBeFirst || wouldBeFirst.waypointType !== WaypointType.Airport) {
        return;
      }
    }

    const updated = [...waypoints];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    onRoutePointsChange(updated);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
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
          <Stack gap="xs">
            <AnimatePresence>
              {waypoints.map((point: WaypointDto, index: number) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper
                    p="sm"
                    radius="md"
                    withBorder
                    draggable={!disabled}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => {
                      handleDragOver(e);
                      if (overIndex !== index) setOverIndex(index);
                    }}
                    onDragEnd={() => handleDragEnd()}
                    onDrop={() => handleDrop(index)}
                    style={{
                      cursor: disabled ? 'default' : 'grab',
                      borderColor: overIndex === index && dragIndex !== null ? 'var(--mantine-color-blue-5)' : undefined,
                      opacity: dragIndex === index ? 0.5 : 1,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <Box
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              index === 0
                                ? 'rgba(34, 197, 94, 0.2)'
                                : index === waypoints.length - 1
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                            color:
                              index === 0
                                ? 'var(--mantine-color-green-6)'
                                : index === waypoints.length - 1
                                ? 'var(--mantine-color-red-6)'
                                : 'var(--mantine-color-blue-6)',
                          }}
                        >
                          {index === 0 ? (
                            <FaPlane size={14} />
                          ) : index === waypoints.length - 1 ? (
                            <FiMapPin size={14} />
                          ) : (
                            <FiNavigation size={14} />
                          )}
                        </Box>
                        <Box>
                          <Text size="sm" fw={600}>
                            {point.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {point.latitude?.toFixed(4)}°, {point.longitude?.toFixed(4)}°
                          </Text>
                        </Box>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleRemoveRoutePoint(point.name || '')}
                        disabled={disabled}
                      >
                        <FiTrash2 size={16} />
                      </ActionIcon>
                    </Group>

                    {/* Refueling option for intermediate airports */}
                    {point.waypointType === WaypointType.Airport && index > 0 && index < waypoints.length - 1 && (
                      <Box mt="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
                        <Switch
                          size="sm"
                          label="Refueling stop"
                          checked={!!point.isRefuelingStop}
                          onChange={(e) =>
                            dispatch(
                              setWaypointRefuel({
                                waypointId: point.id || '',
                                isRefuel: e.currentTarget.checked,
                              })
                            )
                          }
                          disabled={disabled}
                        />
                        {point.isRefuelingStop && (
                          <Group gap="sm" mt="xs">
                            <Switch
                              size="xs"
                              label="Refuel to full"
                              checked={point.refuelToFull ?? true}
                              onChange={(e) =>
                                dispatch(
                                  setWaypointRefuel({
                                    waypointId: point.id || '',
                                    isRefuel: true,
                                    refuelToFull: e.currentTarget.checked,
                                  })
                                )
                              }
                              disabled={disabled}
                            />
                            {!(point.refuelToFull ?? true) && (
                              <NumberInput
                                size="xs"
                                w={80}
                                value={point.refuelGallons}
                                onChange={(v) =>
                                  dispatch(
                                    setWaypointRefuel({
                                      waypointId: point.id || '',
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
                    {index < waypoints.length - 1 && legData[`${point.id}~${waypoints[index + 1].id}`] && (
                      <Group gap="xs" mt="xs">
                        <Badge size="xs" variant="light">
                          {legData[`${point.id}~${waypoints[index + 1].id}`].trueCourse?.toFixed(0)}° TC
                        </Badge>
                        <Badge size="xs" variant="light">
                          {legData[`${point.id}~${waypoints[index + 1].id}`].distance?.toFixed(1)} nm
                        </Badge>
                      </Group>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
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
