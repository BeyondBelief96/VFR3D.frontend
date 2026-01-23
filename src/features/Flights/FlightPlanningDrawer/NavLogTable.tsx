import React from 'react';
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
} from 'react-icons/fi';
import { FaPlane, FaGasPump, FaRoute } from 'react-icons/fa';
import { NavlogResponseDto, NavigationLegDto } from '@/redux/api/vfr3d/dtos';

interface NavLogTableProps {
  navlog: NavlogResponseDto;
  returnNavlog?: NavlogResponseDto;
  isRoundTrip: boolean;
}

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
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaRoute size={16} color="var(--vfr3d-primary)" />
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
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiClock size={16} color="#22c55e" />
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
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaGasPump size={14} color="#a855f7" />
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
                backgroundColor: headwindInfo.isHeadwind
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiWind size={16} color={headwindInfo.isHeadwind ? '#ef4444' : '#22c55e'} />
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
          {legs.map((leg, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="sm" fw={500} c="white">
                  {leg.legStartPoint?.name ?? '?'} → {leg.legEndPoint?.name ?? '?'}
                </Text>
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
                  c={
                    leg.remainingFuelGals !== undefined && leg.remainingFuelGals < 10
                      ? 'red.4'
                      : undefined
                  }
                >
                  {leg.remainingFuelGals?.toFixed(1) ?? '--'} gal
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
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
      {legs.map((leg, index) => (
        <Paper
          key={index}
          p="sm"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          {/* Leg Header */}
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <FaPlane size={12} color="var(--vfr3d-primary)" />
              <Text size="sm" fw={600} c="white">
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
                <FiDroplet size={12} style={{ opacity: 0.5 }} />
                <Box>
                  <Text size="xs" c="dimmed">
                    Fuel
                  </Text>
                  <Text
                    size="sm"
                    c={
                      leg.remainingFuelGals !== undefined && leg.remainingFuelGals < 10
                        ? 'red.4'
                        : undefined
                    }
                  >
                    {leg.legFuelBurnGals?.toFixed(1) ?? '--'} gal
                  </Text>
                </Box>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>
      ))}
    </Stack>
  );
};

// Main Component
export const NavLogTable: React.FC<NavLogTableProps> = ({ navlog, returnNavlog, isRoundTrip }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isRoundTrip && returnNavlog) {
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
            <Tabs.Tab value="outbound" leftSection={<FaPlane size={12} />}>
              Outbound
            </Tabs.Tab>
            <Tabs.Tab
              value="return"
              leftSection={<FaPlane size={12} style={{ transform: 'scaleX(-1)' }} />}
            >
              Return
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="outbound" pt="md">
            <Stack gap="md">
              <NavLogSummary navlog={navlog} />
              {isMobile ? <LegCards legs={navlog.legs} /> : <LegTable legs={navlog.legs} />}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="return" pt="md">
            <Stack gap="md">
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
      <NavLogSummary navlog={navlog} />
      {isMobile ? <LegCards legs={navlog.legs} /> : <LegTable legs={navlog.legs} />}
    </Stack>
  );
};

export default NavLogTable;
