import React from 'react';
import { Stack, Button, Text, Group, Menu, Paper, SimpleGrid } from '@mantine/core';
import { FiPlus, FiChevronDown, FiUser } from 'react-icons/fi';
import { FaGasPump, FaOilCan } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoadingStationDto, ArmUnits, WeightUnits, LoadingStationType, LoadingGraphFormat } from '@/redux/api/vfr3d/dtos';
import { PayloadStationInput } from './PayloadStationInput';
import { FuelStationInput } from './FuelStationInput';
import { OilStationInput } from './OilStationInput';
import { ADDITIONAL_STATION_TEMPLATES, DEFAULT_FUEL_WEIGHT, DEFAULT_OIL_WEIGHT_PER_QUART } from '../constants/defaults';

interface LoadingStationListProps {
  stations: LoadingStationDto[];
  armUnits: ArmUnits;
  weightUnits: WeightUnits;
  loadingGraphFormat: LoadingGraphFormat;
  onChange: (stations: LoadingStationDto[]) => void;
}

// Helper to determine effective station type (handles legacy data)
function getEffectiveStationType(station: LoadingStationDto): LoadingStationType {
  // If stationType is explicitly set, use it
  if (station.stationType) {
    return station.stationType;
  }
  // Fallback: check for oil-specific fields
  if (station.oilCapacityQuarts !== undefined && station.oilCapacityQuarts !== null) {
    return LoadingStationType.Oil;
  }
  // Fallback: check for fuel-specific fields
  if (station.fuelCapacityGallons !== undefined && station.fuelCapacityGallons !== null) {
    return LoadingStationType.Fuel;
  }
  // Default to standard
  return LoadingStationType.Standard;
}

// Sortable wrapper for stations - provides drag context to children
interface SortableStationProps {
  id: string;
  children: (dragHandleProps: { attributes: any; listeners: any }) => React.ReactNode;
}

function SortableStation({ id, children }: SortableStationProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

export const LoadingStationList: React.FC<LoadingStationListProps> = ({
  stations,
  armUnits,
  weightUnits,
  loadingGraphFormat,
  onChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separate stations by effective type
  const payloadStations = stations.filter(s => getEffectiveStationType(s) === LoadingStationType.Standard);
  const fuelStations = stations.filter(s => getEffectiveStationType(s) === LoadingStationType.Fuel);
  const oilStations = stations.filter(s => getEffectiveStationType(s) === LoadingStationType.Oil);

  // Create stable IDs for drag and drop
  // Note: Do NOT include station.name in the fallback - it causes input focus loss when typing
  const getStationId = (station: LoadingStationDto, index: number) =>
    station.id || `station-${index}`;

  const handleDragEnd = (event: DragEndEvent, stationType: LoadingStationType) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Get the stations of this type with their original indices
    const typeStations = stations
      .map((s, i) => ({ station: s, originalIndex: i }))
      .filter(({ station }) => getEffectiveStationType(station) === stationType);

    const oldIndex = typeStations.findIndex(({ station }, i) =>
      getStationId(station, i) === active.id
    );
    const newIndex = typeStations.findIndex(({ station }, i) =>
      getStationId(station, i) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      // Reorder within the type group
      const reorderedTypeStations = arrayMove(typeStations, oldIndex, newIndex);

      // Rebuild the full stations array preserving positions of other types
      const newStations = [...stations];
      let typeIndex = 0;
      for (let i = 0; i < newStations.length; i++) {
        if (getEffectiveStationType(newStations[i]) === stationType) {
          newStations[i] = reorderedTypeStations[typeIndex].station;
          typeIndex++;
        }
      }
      onChange(newStations);
    }
  };

  const handleStationChange = (stationType: LoadingStationType, index: number, updatedStation: LoadingStationDto) => {
    let typeIndex = 0;
    const newStations = stations.map(s => {
      if (getEffectiveStationType(s) === stationType) {
        if (typeIndex === index) {
          typeIndex++;
          return updatedStation;
        }
        typeIndex++;
      }
      return s;
    });
    onChange(newStations);
  };

  const handleRemoveStation = (stationType: LoadingStationType, index: number) => {
    let typeIndex = 0;
    const newStations = stations.filter(s => {
      if (getEffectiveStationType(s) === stationType) {
        if (typeIndex === index) {
          typeIndex++;
          return false;
        }
        typeIndex++;
      }
      return true;
    });
    onChange(newStations);
  };

  const handleAddPayloadStation = (name: string = '', maxWeight: number = 0) => {
    const newStation: LoadingStationDto = {
      name,
      maxWeight,
      stationType: LoadingStationType.Standard,
      point1: { weight: 0, value: 0 },
      point2: { weight: 0, value: 0 },
    };
    onChange([...stations, newStation]);
  };

  const handleAddFuelStation = (name: string = 'Fuel Tank', capacity: number = 0) => {
    const newStation: LoadingStationDto = {
      name,
      maxWeight: 0,
      stationType: LoadingStationType.Fuel,
      point1: { weight: 0, value: 0 },
      point2: { weight: 0, value: 0 },
      fuelCapacityGallons: capacity,
      fuelWeightPerGallon: DEFAULT_FUEL_WEIGHT.AVGAS_100LL,
    };
    onChange([...stations, newStation]);
  };

  const handleAddOilStation = (name: string = 'Oil', capacityQuarts: number = 8) => {
    const newStation: LoadingStationDto = {
      name,
      maxWeight: 0,
      stationType: LoadingStationType.Oil,
      point1: { weight: 0, value: 0 },
      point2: { weight: 0, value: 0 },
      oilCapacityQuarts: capacityQuarts,
      oilWeightPerQuart: DEFAULT_OIL_WEIGHT_PER_QUART,
    };
    onChange([...stations, newStation]);
  };

  // Filter templates by type
  const payloadTemplates = ADDITIONAL_STATION_TEMPLATES.filter(t =>
    getEffectiveStationType(t.station) === LoadingStationType.Standard
  );
  const fuelTemplates = ADDITIONAL_STATION_TEMPLATES.filter(t =>
    getEffectiveStationType(t.station) === LoadingStationType.Fuel
  );

  const fuelAndOilCount = fuelStations.length + oilStations.length;

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {/* Payload Stations Section */}
      <Paper
        p="md"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <FiUser size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" c="white" fw={500}>
                Payload Stations
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {payloadStations.length} station{payloadStations.length !== 1 ? 's' : ''}
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            Passengers, baggage, cargo, equipment. Drag to reorder.
          </Text>

          {payloadStations.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No payload stations
            </Text>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, LoadingStationType.Standard)}
            >
              <SortableContext
                items={payloadStations.map((s, i) => getStationId(s, i))}
                strategy={verticalListSortingStrategy}
              >
                <Stack gap="xs">
                  {payloadStations.map((station, index) => (
                    <SortableStation key={getStationId(station, index)} id={getStationId(station, index)}>
                      {(dragHandleProps) => (
                        <PayloadStationInput
                          station={station}
                          index={index}
                          armUnits={armUnits}
                          weightUnits={weightUnits}
                          loadingGraphFormat={loadingGraphFormat}
                          onChange={(idx, s) => handleStationChange(LoadingStationType.Standard, idx, s)}
                          onRemove={(idx) => handleRemoveStation(LoadingStationType.Standard, idx)}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableStation>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="light"
                color="blue"
                size="xs"
                leftSection={<FiPlus size={14} />}
                rightSection={<FiChevronDown size={12} />}
              >
                Add Payload
              </Button>
            </Menu.Target>

            <Menu.Dropdown
              styles={{
                dropdown: {
                  backgroundColor: 'var(--vfr3d-surface)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                },
              }}
            >
              <Menu.Label>Quick Add</Menu.Label>
              <Menu.Item onClick={() => handleAddPayloadStation('Pilot', 300)}>
                Pilot
              </Menu.Item>
              <Menu.Item onClick={() => handleAddPayloadStation('Co-Pilot/Passenger', 300)}>
                Co-Pilot/Passenger
              </Menu.Item>
              <Menu.Item onClick={() => handleAddPayloadStation('Rear Passengers', 400)}>
                Rear Passengers
              </Menu.Item>
              <Menu.Item onClick={() => handleAddPayloadStation('Baggage', 120)}>
                Baggage
              </Menu.Item>

              <Menu.Divider />
              <Menu.Label>More Options</Menu.Label>
              {payloadTemplates.map((template, index) => (
                <Menu.Item
                  key={index}
                  onClick={() => handleAddPayloadStation(template.station.name, template.station.maxWeight)}
                >
                  {template.label}
                </Menu.Item>
              ))}
              <Menu.Item onClick={() => handleAddPayloadStation()}>
                Custom Station
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Stack>
      </Paper>

      {/* Fuel & Oil Stations Section */}
      <Paper
        p="md"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <FaGasPump size={14} color="var(--mantine-color-cyan-6)" />
              <Text size="sm" c="white" fw={500}>
                Fuel & Oil
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {fuelAndOilCount} item{fuelAndOilCount !== 1 ? 's' : ''}
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            Fuel tanks (gallons), oil (quarts). Drag to reorder.
          </Text>

          {fuelAndOilCount === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No fuel or oil stations
            </Text>
          ) : (
            <Stack gap="sm">
              {/* Fuel stations */}
              {fuelStations.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, LoadingStationType.Fuel)}
                >
                  <SortableContext
                    items={fuelStations.map((s, i) => getStationId(s, i))}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack gap="xs">
                      {fuelStations.map((station, index) => (
                        <SortableStation key={getStationId(station, index)} id={getStationId(station, index)}>
                          {(dragHandleProps) => (
                            <FuelStationInput
                              station={station}
                              index={index}
                              armUnits={armUnits}
                              weightUnits={weightUnits}
                              loadingGraphFormat={loadingGraphFormat}
                              onChange={(idx, s) => handleStationChange(LoadingStationType.Fuel, idx, s)}
                              onRemove={(idx) => handleRemoveStation(LoadingStationType.Fuel, idx)}
                              dragHandleProps={dragHandleProps}
                            />
                          )}
                        </SortableStation>
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              )}

              {/* Oil stations */}
              {oilStations.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleDragEnd(e, LoadingStationType.Oil)}
                >
                  <SortableContext
                    items={oilStations.map((s, i) => getStationId(s, i))}
                    strategy={verticalListSortingStrategy}
                  >
                    <Stack gap="xs">
                      {oilStations.map((station, index) => (
                        <SortableStation key={getStationId(station, index)} id={getStationId(station, index)}>
                          {(dragHandleProps) => (
                            <OilStationInput
                              station={station}
                              index={index}
                              armUnits={armUnits}
                              weightUnits={weightUnits}
                              loadingGraphFormat={loadingGraphFormat}
                              onChange={(idx, s) => handleStationChange(LoadingStationType.Oil, idx, s)}
                              onRemove={(idx) => handleRemoveStation(LoadingStationType.Oil, idx)}
                              dragHandleProps={dragHandleProps}
                            />
                          )}
                        </SortableStation>
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              )}
            </Stack>
          )}

          <Group gap="xs">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="light"
                  color="cyan"
                  size="xs"
                  leftSection={<FiPlus size={14} />}
                  rightSection={<FiChevronDown size={12} />}
                >
                  Add Fuel
                </Button>
              </Menu.Target>

              <Menu.Dropdown
                styles={{
                  dropdown: {
                    backgroundColor: 'var(--vfr3d-surface)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                  },
                }}
              >
                <Menu.Label>Quick Add</Menu.Label>
                <Menu.Item onClick={() => handleAddFuelStation('Main Fuel Tank', 50)}>
                  Main Tank (50 gal)
                </Menu.Item>
                <Menu.Item onClick={() => handleAddFuelStation('Left Tank', 25)}>
                  Left Tank (25 gal)
                </Menu.Item>
                <Menu.Item onClick={() => handleAddFuelStation('Right Tank', 25)}>
                  Right Tank (25 gal)
                </Menu.Item>

                <Menu.Divider />
                <Menu.Label>More Options</Menu.Label>
                {fuelTemplates.map((template, index) => (
                  <Menu.Item
                    key={index}
                    onClick={() => handleAddFuelStation(template.station.name, template.station.fuelCapacityGallons)}
                  >
                    {template.label}
                  </Menu.Item>
                ))}
                <Menu.Item onClick={() => handleAddFuelStation()}>
                  Custom Tank
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="light"
                  color="yellow"
                  size="xs"
                  leftSection={<FaOilCan size={14} />}
                  rightSection={<FiChevronDown size={12} />}
                >
                  Add Oil
                </Button>
              </Menu.Target>

              <Menu.Dropdown
                styles={{
                  dropdown: {
                    backgroundColor: 'var(--vfr3d-surface)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                  },
                }}
              >
                <Menu.Label>Quick Add</Menu.Label>
                <Menu.Item onClick={() => handleAddOilStation('Oil', 8)}>
                  Oil (8 qt)
                </Menu.Item>
                <Menu.Item onClick={() => handleAddOilStation('Left Engine Oil', 8)}>
                  Left Engine Oil (8 qt)
                </Menu.Item>
                <Menu.Item onClick={() => handleAddOilStation('Right Engine Oil', 8)}>
                  Right Engine Oil (8 qt)
                </Menu.Item>

                <Menu.Divider />
                <Menu.Item onClick={() => handleAddOilStation('Oil', 0)}>
                  Custom Oil
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
};

export default LoadingStationList;
