import React, { useMemo } from 'react';
import {
  Stack,
  Group,
  Text,
  Paper,
  Box,
  Badge,
  Tabs,
  Table,
  ScrollArea,
  Grid,
  Alert,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import dayjs from 'dayjs';
import {
  FiNavigation,
  FiClock,
  FiDroplet,
  FiWind,
  FiThermometer,
  FiCompass,
  FiAlertTriangle,
} from 'react-icons/fi';
import { FaPlane, FaGasPump, FaRoute } from 'react-icons/fa';
import { NavlogResponseDto, NavigationLegDto } from '@/redux/api/vfr3d/dtos';
import { METRIC_COLORS, getIconBgColor } from '@/constants/colors';

interface NavLogTableProps {
  navlog: NavlogResponseDto;
  returnNavlog?: NavlogResponseDto;
  isRoundTrip: boolean;
}

// Fuel status helpers
const FUEL_WARNING_THRESHOLD = 10; // gallons - low fuel reserve warning

interface FuelStatus {
  hasCriticalFuel: boolean; // Negative fuel (will run out)
  hasLowFuel: boolean; // Less than threshold but positive
  criticalLegs: number[]; // Indices of legs with negative fuel
  lowFuelLegs: number[]; // Indices of legs with low fuel
}

const analyzeFuelStatus = (legs?: NavigationLegDto[]): FuelStatus => {
  const status: FuelStatus = {
    hasCriticalFuel: false,
    hasLowFuel: false,
    criticalLegs: [],
    lowFuelLegs: [],
  };

  if (!legs) return status;

  legs.forEach((leg, index) => {
    if (leg.remainingFuelGals !== undefined) {
      if (leg.remainingFuelGals < 0) {
        status.hasCriticalFuel = true;
        status.criticalLegs.push(index);
      } else if (leg.remainingFuelGals < FUEL_WARNING_THRESHOLD) {
        status.hasLowFuel = true;
        status.lowFuelLegs.push(index);
      }
    }
  });

  return status;
};

const getLegFuelSeverity = (
  remainingFuel: number | undefined
): 'critical' | 'warning' | 'normal' => {
  if (remainingFuel === undefined) return 'normal';
  if (remainingFuel < 0) return 'critical';
  if (remainingFuel < FUEL_WARNING_THRESHOLD) return 'warning';
  return 'normal';
};

// Helper functions
const formatTime = (hours?: number): string => {
  if (hours === undefined || hours === null) return '--';
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

const formatLegTime = (start?: Date, end?: Date): string => {
  if (!start || !end) return '--';
  const startTime = dayjs(start).format('HH:mm');
  const endTime = dayjs(end).format('HH:mm');
  return `${startTime}-${endTime}`;
};

const formatWind = (dir?: number, speed?: number): string => {
  if (dir === undefined || speed === undefined) return '--';
  return `${Math.round(dir)}°/${Math.round(speed)}`;
};

const formatHeadwind = (component?: number): { value: string; isHeadwind: boolean } => {
  if (component === undefined || component === null) return { value: '--', isHeadwind: false };
  const isHeadwind = component >= 0;
  return {
    value: `${isHeadwind ? '+' : ''}${Math.round(component)} kt`,
    isHeadwind,
  };
};

// Fuel Warning Alert Component
const FuelWarningAlert: React.FC<{ fuelStatus: FuelStatus; legs?: NavigationLegDto[] }> = ({
  fuelStatus,
  legs,
}) => {
  if (!fuelStatus.hasCriticalFuel && !fuelStatus.hasLowFuel) return null;

  if (fuelStatus.hasCriticalFuel) {
    // Get the names of the problem legs
    const problemLegs = fuelStatus.criticalLegs
      .map((index) => {
        const leg = legs?.[index];
        if (!leg) return null;
        return `${leg.legStartPoint?.name ?? '?'} → ${leg.legEndPoint?.name ?? '?'}`;
      })
      .filter(Boolean);

    return (
      <Alert
        icon={<FiAlertTriangle size={20} />}
        title="Insufficient Fuel"
        color="red"
        variant="filled"
        mb="md"
        styles={{
          root: {
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
          },
        }}
      >
        <Text size="sm" c="white">
          You will run out of fuel before completing this flight. The following leg(s) have
          negative fuel remaining:
        </Text>
        <Text size="sm" fw={600} c="white" mt={4}>
          {problemLegs.join(', ')}
        </Text>
        <Text size="sm" c="white" mt={8}>
          Consider adding a refueling stop or reducing the flight distance.
        </Text>
      </Alert>
    );
  }

  if (fuelStatus.hasLowFuel) {
    return (
      <Alert
        icon={<FiAlertTriangle size={20} />}
        title="Low Fuel Warning"
        color="yellow"
        variant="light"
        mb="md"
      >
        <Text size="sm">
          Some legs will have less than {FUEL_WARNING_THRESHOLD} gallons remaining. Ensure you have
          adequate fuel reserves for unexpected diversions.
        </Text>
      </Alert>
    );
  }

  return null;
};

// Summary Card Component
const NavLogSummary: React.FC<{ navlog: NavlogResponseDto; label?: string }> = ({
  navlog,
  label,
}) => {
  const headwindInfo = formatHeadwind(navlog.averageWindComponent);

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      {label && (
        <Text size="sm" fw={500} c="dimmed" mb="sm">
          {label}
        </Text>
      )}
      <Grid gutter="md">
        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Group gap="xs">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: getIconBgColor('blue'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaRoute size={16} color={METRIC_COLORS.DISTANCE} />
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Distance
              </Text>
              <Text size="lg" fw={600} c="white">
                {navlog.totalRouteDistance?.toFixed(1) ?? '--'} nm
              </Text>
            </Box>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Group gap="xs">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: getIconBgColor('cyan'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiClock size={16} color={METRIC_COLORS.TIME} />
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Flight Time
              </Text>
              <Text size="lg" fw={600} c="white">
                {formatTime(navlog.totalRouteTimeHours)}
              </Text>
            </Box>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Group gap="xs">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: getIconBgColor('teal'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaGasPump size={14} color={METRIC_COLORS.FUEL} />
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Fuel Required
              </Text>
              <Text size="lg" fw={600} c="white">
                {navlog.totalFuelUsed?.toFixed(1) ?? '--'} gal
              </Text>
            </Box>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 3 }}>
          <Group gap="xs">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: getIconBgColor('grape'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiWind size={16} color={METRIC_COLORS.WIND} />
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Avg Wind
              </Text>
              <Text
                size="lg"
                fw={600}
                c={headwindInfo.isHeadwind ? 'red.4' : 'green.4'}
              >
                {headwindInfo.value}
              </Text>
            </Box>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

// Desktop Table View
const LegTable: React.FC<{ legs?: NavigationLegDto[] }> = ({ legs }) => {
  if (!legs || legs.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No leg data available
      </Text>
    );
  }

  return (
    <ScrollArea>
      <Table
        striped
        highlightOnHover
        styles={{
          table: {
            backgroundColor: 'transparent',
          },
          thead: {
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
          },
          th: {
            color: 'var(--mantine-color-gray-4)',
            fontWeight: 500,
            fontSize: 'var(--mantine-font-size-xs)',
            padding: '8px 12px',
            whiteSpace: 'nowrap',
          },
          td: {
            padding: '8px 12px',
            fontSize: 'var(--mantine-font-size-sm)',
          },
          tr: {
            '&[data-striped]': {
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
            },
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Leg</Table.Th>
            <Table.Th>Dist</Table.Th>
            <Table.Th>GS</Table.Th>
            <Table.Th>TC</Table.Th>
            <Table.Th>MH</Table.Th>
            <Table.Th>Wind</Table.Th>
            <Table.Th>Temp</Table.Th>
            <Table.Th>Time</Table.Th>
            <Table.Th>Fuel</Table.Th>
            <Table.Th>Rem</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {legs.map((leg, index) => {
            const fuelSeverity = getLegFuelSeverity(leg.remainingFuelGals);
            const rowStyle =
              fuelSeverity === 'critical'
                ? { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderLeft: '3px solid #ef4444' }
                : fuelSeverity === 'warning'
                  ? { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderLeft: '3px solid #fbbf24' }
                  : undefined;

            return (
              <Table.Tr key={index} style={rowStyle}>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    {fuelSeverity === 'critical' && (
                      <FiAlertTriangle size={14} color="#ef4444" />
                    )}
                    <Text size="sm" fw={500} c={fuelSeverity === 'critical' ? 'red.4' : 'white'}>
                      {leg.legStartPoint?.name ?? '?'} → {leg.legEndPoint?.name ?? '?'}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{leg.legDistance?.toFixed(1) ?? '--'} nm</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{leg.groundSpeed?.toFixed(0) ?? '--'} kt</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{leg.trueCourse?.toFixed(0) ?? '--'}°</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500} c="blue.4">
                    {leg.magneticHeading?.toFixed(0) ?? '--'}°
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatWind(leg.windDir, leg.windSpeed)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{leg.tempC?.toFixed(0) ?? '--'}°C</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatLegTime(leg.startLegTime, leg.endLegTime)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{leg.legFuelBurnGals?.toFixed(1) ?? '--'} gal</Text>
                </Table.Td>
                <Table.Td>
                  <Text
                    size="sm"
                    fw={fuelSeverity !== 'normal' ? 600 : undefined}
                    c={
                      fuelSeverity === 'critical'
                        ? 'red.4'
                        : fuelSeverity === 'warning'
                          ? 'yellow.4'
                          : undefined
                    }
                  >
                    {leg.remainingFuelGals?.toFixed(1) ?? '--'} gal
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

// Mobile Card View
const LegCards: React.FC<{ legs?: NavigationLegDto[] }> = ({ legs }) => {
  if (!legs || legs.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No leg data available
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {legs.map((leg, index) => {
        const fuelSeverity = getLegFuelSeverity(leg.remainingFuelGals);
        const cardStyle =
          fuelSeverity === 'critical'
            ? {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid #ef4444',
              }
            : fuelSeverity === 'warning'
              ? {
                  backgroundColor: 'rgba(251, 191, 36, 0.15)',
                  border: '2px solid #fbbf24',
                }
              : {
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                };

        return (
          <Paper key={index} p="sm" style={cardStyle}>
            {/* Fuel Warning Badge for Critical */}
            {fuelSeverity === 'critical' && (
              <Group gap="xs" mb="xs">
                <Badge color="red" variant="filled" leftSection={<FiAlertTriangle size={10} />}>
                  INSUFFICIENT FUEL
                </Badge>
              </Group>
            )}

            {/* Leg Header */}
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <FaPlane size={12} color={fuelSeverity === 'critical' ? '#ef4444' : 'var(--vfr3d-primary)'} />
                <Text size="sm" fw={600} c={fuelSeverity === 'critical' ? 'red.4' : 'white'}>
                  {leg.legStartPoint?.name ?? '?'} → {leg.legEndPoint?.name ?? '?'}
                </Text>
              </Group>
              <Badge size="sm" variant="light" color="blue">
                {leg.legDistance?.toFixed(1) ?? '--'} nm
              </Badge>
            </Group>

            {/* Leg Details Grid */}
            <Grid gutter="xs">
              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiNavigation size={12} style={{ opacity: 0.5 }} />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Heading
                    </Text>
                    <Text size="sm" fw={500} c="blue.4">
                      {leg.magneticHeading?.toFixed(0) ?? '--'}°
                    </Text>
                  </Box>
                </Group>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiCompass size={12} style={{ opacity: 0.5 }} />
                  <Box>
                    <Text size="xs" c="dimmed">
                      GS
                    </Text>
                    <Text size="sm">{leg.groundSpeed?.toFixed(0) ?? '--'} kt</Text>
                  </Box>
                </Group>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiClock size={12} style={{ opacity: 0.5 }} />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Time
                    </Text>
                    <Text size="sm">{formatLegTime(leg.startLegTime, leg.endLegTime)}</Text>
                  </Box>
                </Group>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiWind size={12} style={{ opacity: 0.5 }} />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Wind
                    </Text>
                    <Text size="sm">{formatWind(leg.windDir, leg.windSpeed)}</Text>
                  </Box>
                </Group>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiThermometer size={12} style={{ opacity: 0.5 }} />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Temp
                    </Text>
                    <Text size="sm">{leg.tempC?.toFixed(0) ?? '--'}°C</Text>
                </Box>
                </Group>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={4}>
                  <FiDroplet
                    size={12}
                    style={{ opacity: fuelSeverity !== 'normal' ? 1 : 0.5 }}
                    color={fuelSeverity === 'critical' ? '#ef4444' : undefined}
                  />
                  <Box>
                    <Text size="xs" c="dimmed">
                      Remaining
                    </Text>
                    <Text
                      size="sm"
                      fw={fuelSeverity !== 'normal' ? 600 : undefined}
                      c={
                        fuelSeverity === 'critical'
                          ? 'red.4'
                          : fuelSeverity === 'warning'
                            ? 'yellow.4'
                            : undefined
                      }
                    >
                      {leg.remainingFuelGals?.toFixed(1) ?? '--'} gal
                    </Text>
                  </Box>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>
        );
      })}
    </Stack>
  );
};

// Main Component
export const NavLogTable: React.FC<NavLogTableProps> = ({ navlog, returnNavlog, isRoundTrip }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Analyze fuel status for outbound and return
  const outboundFuelStatus = useMemo(() => analyzeFuelStatus(navlog.legs), [navlog.legs]);
  const returnFuelStatus = useMemo(
    () => (returnNavlog ? analyzeFuelStatus(returnNavlog.legs) : null),
    [returnNavlog]
  );

  if (isRoundTrip && returnNavlog && returnFuelStatus) {
    // Check if either leg has fuel issues for tab indicators
    const outboundHasIssue = outboundFuelStatus.hasCriticalFuel || outboundFuelStatus.hasLowFuel;
    const returnHasIssue = returnFuelStatus.hasCriticalFuel || returnFuelStatus.hasLowFuel;

    return (
      <Stack gap="md">
        <Tabs
          defaultValue="outbound"
          variant="pills"
          styles={{
            list: {
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              padding: 4,
              borderRadius: 'var(--mantine-radius-md)',
            },
            tab: {
              '&[data-active]': {
                backgroundColor: 'var(--vfr3d-primary)',
              },
            },
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab
              value="outbound"
              leftSection={<FaPlane size={12} />}
              rightSection={
                outboundHasIssue ? (
                  <FiAlertTriangle
                    size={14}
                    color={outboundFuelStatus.hasCriticalFuel ? '#ef4444' : '#fbbf24'}
                  />
                ) : null
              }
            >
              Outbound
            </Tabs.Tab>
            <Tabs.Tab
              value="return"
              leftSection={<FaPlane size={12} style={{ transform: 'scaleX(-1)' }} />}
              rightSection={
                returnHasIssue ? (
                  <FiAlertTriangle
                    size={14}
                    color={returnFuelStatus.hasCriticalFuel ? '#ef4444' : '#fbbf24'}
                  />
                ) : null
              }
            >
              Return
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="outbound" pt="md">
            <Stack gap="md">
              <FuelWarningAlert fuelStatus={outboundFuelStatus} legs={navlog.legs} />
              <NavLogSummary navlog={navlog} />
              {isMobile ? <LegCards legs={navlog.legs} /> : <LegTable legs={navlog.legs} />}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="return" pt="md">
            <Stack gap="md">
              <FuelWarningAlert fuelStatus={returnFuelStatus} legs={returnNavlog.legs} />
              <NavLogSummary navlog={returnNavlog} />
              {isMobile ? (
                <LegCards legs={returnNavlog.legs} />
              ) : (
                <LegTable legs={returnNavlog.legs} />
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <FuelWarningAlert fuelStatus={outboundFuelStatus} legs={navlog.legs} />
      <NavLogSummary navlog={navlog} />
      {isMobile ? <LegCards legs={navlog.legs} /> : <LegTable legs={navlog.legs} />}
    </Stack>
  );
};

// Export fuel analysis helper for use in other components
export { analyzeFuelStatus, type FuelStatus };

export default NavLogTable;
