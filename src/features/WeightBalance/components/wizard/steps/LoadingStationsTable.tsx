import {
  Stack,
  Table,
  TextInput,
  NumberInput,
  ActionIcon,
  Button,
  Group,
  Text,
  Badge,
  Menu,
  Paper,
  Tooltip,
  Box,
} from '@mantine/core';
import { FiPlus, FiTrash2, FiChevronDown, FiInfo } from 'react-icons/fi';
import { FaGasPump, FaOilCan, FaUser } from 'react-icons/fa';
import {
  LoadingStationDto,
  LoadingStationType,
  WeightUnits,
  LoadingGraphFormat,
} from '@/redux/api/vfr3d/dtos';
import {
  WEIGHT_UNIT_LABELS,
  DEFAULT_FUEL_WEIGHT,
  DEFAULT_OIL_WEIGHT_PER_QUART,
} from '../../../constants/defaults';

interface LoadingStationsTableProps {
  stations: LoadingStationDto[];
  weightUnits: WeightUnits;
  loadingGraphFormat: LoadingGraphFormat;
  onChange: (stations: LoadingStationDto[]) => void;
}

const inputStyles = {
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: 'white',
    height: '32px',
    minHeight: '32px',
    '&:focus': {
      borderColor: 'var(--vfr3d-primary)',
    },
  },
};

function getEffectiveStationType(station: LoadingStationDto): LoadingStationType {
  if (station.stationType) return station.stationType;
  if (station.oilCapacityQuarts !== undefined && station.oilCapacityQuarts !== null) {
    return LoadingStationType.Oil;
  }
  if (station.fuelCapacityGallons !== undefined && station.fuelCapacityGallons !== null) {
    return LoadingStationType.Fuel;
  }
  return LoadingStationType.Standard;
}

function getStationTypeBadge(station: LoadingStationDto) {
  const type = getEffectiveStationType(station);
  switch (type) {
    case LoadingStationType.Fuel:
      return (
        <Badge size="xs" color="cyan" variant="light" leftSection={<FaGasPump size={8} />}>
          Fuel
        </Badge>
      );
    case LoadingStationType.Oil:
      return (
        <Badge size="xs" color="yellow" variant="light" leftSection={<FaOilCan size={8} />}>
          Oil
        </Badge>
      );
    default:
      return (
        <Badge size="xs" color="blue" variant="light" leftSection={<FaUser size={8} />}>
          Payload
        </Badge>
      );
  }
}

export function LoadingStationsTable({
  stations,
  weightUnits,
  loadingGraphFormat,
  onChange,
}: LoadingStationsTableProps) {
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';
  const isMomentFormat = loadingGraphFormat === LoadingGraphFormat.MomentDividedBy1000;
  const valueColumnLabel = isMomentFormat ? 'Mom/1000' : 'Arm';

  const handleStationChange = (
    index: number,
    field: keyof LoadingStationDto | 'point1Weight' | 'point1Value' | 'point2Weight' | 'point2Value',
    value: string | number
  ) => {
    const newStations = [...stations];
    const station = { ...newStations[index] };

    if (field === 'point1Weight') {
      station.point1 = { ...station.point1, weight: Number(value) || 0 };
    } else if (field === 'point1Value') {
      station.point1 = { ...station.point1, value: Number(value) || 0 };
    } else if (field === 'point2Weight') {
      station.point2 = { ...station.point2, weight: Number(value) || 0 };
    } else if (field === 'point2Value') {
      station.point2 = { ...station.point2, value: Number(value) || 0 };
    } else if (field === 'name') {
      station.name = value as string;
    } else if (field === 'maxWeight') {
      station.maxWeight = Number(value) || 0;
    } else if (field === 'fuelCapacityGallons') {
      station.fuelCapacityGallons = Number(value) || 0;
    } else if (field === 'oilCapacityQuarts') {
      station.oilCapacityQuarts = Number(value) || 0;
    }

    newStations[index] = station;
    onChange(newStations);
  };

  const handleRemoveStation = (index: number) => {
    const newStations = stations.filter((_, i) => i !== index);
    onChange(newStations);
  };

  const handleAddStation = (type: LoadingStationType, name: string = '', preset?: Partial<LoadingStationDto>) => {
    const baseStation: LoadingStationDto = {
      name,
      maxWeight: 0,
      stationType: type,
      point1: { weight: 0, value: 0 },
      point2: { weight: 0, value: 0 },
      ...preset,
    };

    if (type === LoadingStationType.Fuel) {
      baseStation.fuelCapacityGallons = preset?.fuelCapacityGallons ?? 0;
      baseStation.fuelWeightPerGallon = DEFAULT_FUEL_WEIGHT.AVGAS_100LL;
    } else if (type === LoadingStationType.Oil) {
      baseStation.oilCapacityQuarts = preset?.oilCapacityQuarts ?? 8;
      baseStation.oilWeightPerQuart = DEFAULT_OIL_WEIGHT_PER_QUART;
    }

    onChange([...stations, baseStation]);
  };

  // Separate stations by type for display
  const payloadStations = stations
    .map((s, i) => ({ station: s, index: i }))
    .filter(({ station }) => getEffectiveStationType(station) === LoadingStationType.Standard);
  const fuelStations = stations
    .map((s, i) => ({ station: s, index: i }))
    .filter(({ station }) => getEffectiveStationType(station) === LoadingStationType.Fuel);
  const oilStations = stations
    .map((s, i) => ({ station: s, index: i }))
    .filter(({ station }) => getEffectiveStationType(station) === LoadingStationType.Oil);

  const renderStationRow = (station: LoadingStationDto, index: number) => {
    const type = getEffectiveStationType(station);
    const isFuel = type === LoadingStationType.Fuel;
    const isOil = type === LoadingStationType.Oil;

    return (
      <Table.Tr key={index}>
        <Table.Td style={{ width: 70 }}>{getStationTypeBadge(station)}</Table.Td>
        <Table.Td style={{ minWidth: 120 }}>
          <TextInput
            placeholder="Name"
            value={station.name || ''}
            onChange={(e) => handleStationChange(index, 'name', e.target.value)}
            size="xs"
            styles={inputStyles}
          />
        </Table.Td>
        <Table.Td style={{ width: 85 }}>
          {isFuel ? (
            <NumberInput
              placeholder="0"
              value={station.fuelCapacityGallons ?? ''}
              onChange={(val) => handleStationChange(index, 'fuelCapacityGallons', val || 0)}
              size="xs"
              min={0}
              styles={inputStyles}
              rightSection={<Text size="10px" c="dimmed">gal</Text>}
            />
          ) : isOil ? (
            <NumberInput
              placeholder="0"
              value={station.oilCapacityQuarts ?? ''}
              onChange={(val) => handleStationChange(index, 'oilCapacityQuarts', val || 0)}
              size="xs"
              min={0}
              styles={inputStyles}
              rightSection={<Text size="10px" c="dimmed">qt</Text>}
            />
          ) : (
            <NumberInput
              placeholder="0"
              value={station.maxWeight ?? ''}
              onChange={(val) => handleStationChange(index, 'maxWeight', val || 0)}
              size="xs"
              min={0}
              styles={inputStyles}
              rightSection={<Text size="10px" c="dimmed">{weightLabel}</Text>}
            />
          )}
        </Table.Td>
        {/* Point 1 */}
        <Table.Td style={{ width: 70 }}>
          <NumberInput
            placeholder="0"
            value={station.point1?.weight ?? ''}
            onChange={(val) => handleStationChange(index, 'point1Weight', val || 0)}
            size="xs"
            min={0}
            styles={inputStyles}
          />
        </Table.Td>
        <Table.Td style={{ width: 70 }}>
          <NumberInput
            placeholder="0"
            value={station.point1?.value ?? ''}
            onChange={(val) => handleStationChange(index, 'point1Value', val || 0)}
            size="xs"
            decimalScale={isMomentFormat ? 1 : 2}
            styles={inputStyles}
          />
        </Table.Td>
        {/* Point 2 */}
        <Table.Td style={{ width: 70 }}>
          <NumberInput
            placeholder="0"
            value={station.point2?.weight ?? ''}
            onChange={(val) => handleStationChange(index, 'point2Weight', val || 0)}
            size="xs"
            min={0}
            styles={inputStyles}
          />
        </Table.Td>
        <Table.Td style={{ width: 70 }}>
          <NumberInput
            placeholder="0"
            value={station.point2?.value ?? ''}
            onChange={(val) => handleStationChange(index, 'point2Value', val || 0)}
            size="xs"
            decimalScale={isMomentFormat ? 1 : 2}
            styles={inputStyles}
          />
        </Table.Td>
        <Table.Td style={{ width: 40 }}>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => handleRemoveStation(index)}
          >
            <FiTrash2 size={14} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    color: string,
    stationList: { station: LoadingStationDto; index: number }[],
    addMenu: React.ReactNode,
    capacityLabel: string
  ) => (
    <Paper
      p="sm"
      mb="md"
      style={{
        background: 'rgba(15, 23, 42, 0.3)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--mantine-radius-md)',
      }}
    >
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          {icon}
          <Text size="sm" fw={500} c="gray.2">
            {title}
          </Text>
          <Badge size="xs" variant="light" color="gray">
            {stationList.length}
          </Badge>
        </Group>
        {addMenu}
      </Group>

      {stationList.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          No {title.toLowerCase()} added yet
        </Text>
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table
            horizontalSpacing="xs"
            verticalSpacing={6}
            styles={{
              table: { backgroundColor: 'transparent', minWidth: 650 },
              th: {
                color: 'var(--mantine-color-gray-5)',
                fontWeight: 500,
                fontSize: '11px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                padding: '4px 6px',
                whiteSpace: 'nowrap',
              },
              td: {
                borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                padding: '4px 6px',
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>{capacityLabel}</Table.Th>
                <Table.Th colSpan={2} style={{ textAlign: 'center' }}>
                  <Group gap={4} justify="center">
                    <span>Point 1</span>
                    <Tooltip
                      label="First point from POH loading graph: Weight and corresponding Arm (or Moment/1000)"
                      multiline
                      w={220}
                    >
                      <Box component="span" style={{ cursor: 'help' }}>
                        <FiInfo size={10} />
                      </Box>
                    </Tooltip>
                  </Group>
                </Table.Th>
                <Table.Th colSpan={2} style={{ textAlign: 'center' }}>
                  <Group gap={4} justify="center">
                    <span>Point 2</span>
                    <Tooltip
                      label="Second point from POH loading graph: Weight and corresponding Arm (or Moment/1000)"
                      multiline
                      w={220}
                    >
                      <Box component="span" style={{ cursor: 'help' }}>
                        <FiInfo size={10} />
                      </Box>
                    </Tooltip>
                  </Group>
                </Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
                <Table.Th style={{ fontSize: '10px' }}>Wt ({weightLabel})</Table.Th>
                <Table.Th style={{ fontSize: '10px' }}>{valueColumnLabel}</Table.Th>
                <Table.Th style={{ fontSize: '10px' }}>Wt ({weightLabel})</Table.Th>
                <Table.Th style={{ fontSize: '10px' }}>{valueColumnLabel}</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stationList.map(({ station, index }) => renderStationRow(station, index))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </Paper>
  );

  return (
    <Stack gap="xs">
      {/* Payload Stations */}
      {renderSection(
        'Payload Stations',
        <FaUser size={14} color="var(--mantine-color-blue-5)" />,
        'rgba(59, 130, 246, 0.3)',
        payloadStations,
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant="light"
              color="blue"
              size="xs"
              leftSection={<FiPlus size={12} />}
              rightSection={<FiChevronDown size={10} />}
            >
              Add
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ backgroundColor: 'var(--vfr3d-surface)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Standard, 'Pilot', { maxWeight: 300 })}>
              Pilot
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Standard, 'Front Passenger', { maxWeight: 300 })}>
              Front Passenger
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Standard, 'Rear Passengers', { maxWeight: 400 })}>
              Rear Passengers
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Standard, 'Baggage', { maxWeight: 120 })}>
              Baggage
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Standard, '')}>
              Custom...
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>,
        `Max (${weightLabel})`
      )}

      {/* Fuel Tanks */}
      {renderSection(
        'Fuel Tanks',
        <FaGasPump size={14} color="var(--mantine-color-cyan-5)" />,
        'rgba(6, 182, 212, 0.3)',
        fuelStations,
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant="light"
              color="cyan"
              size="xs"
              leftSection={<FiPlus size={12} />}
              rightSection={<FiChevronDown size={10} />}
            >
              Add
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ backgroundColor: 'var(--vfr3d-surface)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Fuel, 'Main Tank', { fuelCapacityGallons: 50 })}>
              Main Tank (50 gal)
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Fuel, 'Left Tank', { fuelCapacityGallons: 25 })}>
              Left Tank (25 gal)
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Fuel, 'Right Tank', { fuelCapacityGallons: 25 })}>
              Right Tank (25 gal)
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Fuel, '')}>
              Custom...
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>,
        'Capacity'
      )}

      {/* Oil */}
      {renderSection(
        'Oil',
        <FaOilCan size={14} color="var(--mantine-color-yellow-5)" />,
        'rgba(234, 179, 8, 0.3)',
        oilStations,
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant="light"
              color="yellow"
              size="xs"
              leftSection={<FiPlus size={12} />}
              rightSection={<FiChevronDown size={10} />}
            >
              Add
            </Button>
          </Menu.Target>
          <Menu.Dropdown style={{ backgroundColor: 'var(--vfr3d-surface)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Oil, 'Oil', { oilCapacityQuarts: 8 })}>
              Oil (8 qt)
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Oil, 'Left Engine Oil', { oilCapacityQuarts: 8 })}>
              Left Engine (8 qt)
            </Menu.Item>
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Oil, 'Right Engine Oil', { oilCapacityQuarts: 8 })}>
              Right Engine (8 qt)
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => handleAddStation(LoadingStationType.Oil, '', { oilCapacityQuarts: 0 })}>
              Custom...
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>,
        'Capacity'
      )}
    </Stack>
  );
}
