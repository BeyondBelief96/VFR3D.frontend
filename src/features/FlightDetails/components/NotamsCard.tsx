import { useState, useMemo } from 'react';
import {
  Paper,
  Group,
  Badge,
  Stack,
  Box,
  Text,
  Tooltip,
  ActionIcon,
  Collapse,
  Alert,
} from '@mantine/core';
import { FiChevronDown, FiChevronUp, FiInfo, FiClock } from 'react-icons/fi';
import { NotamDto, NotamResponseDto } from '@/redux/api/vfr3d/dtos';
import {
  translateNotam,
  getNotamSeverityColor,
  categorizeNotam,
} from '../utils/notamAbbreviations';

export interface FlightTimeWindow {
  start: Date;
  end: Date;
}

interface NotamsListProps {
  notamsData?: NotamResponseDto;
  viewMode: 'readable' | 'raw';
  flightTimeWindow?: FlightTimeWindow;
}

type ViewMode = 'readable' | 'raw';

interface ParsedNotam {
  id: string;
  rawText: string;
  translatedText: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  effectiveStartDate?: Date;
  effectiveEndDate?: Date;
  location?: string;
  category: string;
  severityColor: string;
}

/**
 * Parse a NOTAM date string into a Date object
 * Handles formats like "2401151200" (YYMMDDHHMM) and ISO strings
 */
function parseNotamDateString(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;

  try {
    // Handle NOTAM date formats (YYMMDDHHMM)
    if (/^\d{10}$/.test(dateStr)) {
      const year = 2000 + parseInt(dateStr.slice(0, 2));
      const month = parseInt(dateStr.slice(2, 4)) - 1;
      const day = parseInt(dateStr.slice(4, 6));
      const hour = parseInt(dateStr.slice(6, 8));
      const min = parseInt(dateStr.slice(8, 10));
      return new Date(Date.UTC(year, month, day, hour, min));
    }

    // Try ISO format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if a NOTAM's effective period overlaps with the flight time window
 */
function notamOverlapsFlightTime(
  notam: ParsedNotam,
  flightWindow?: FlightTimeWindow
): boolean {
  if (!flightWindow) return false;

  const notamStart = notam.effectiveStartDate;
  const notamEnd = notam.effectiveEndDate;

  // If no dates, assume it's always active
  if (!notamStart && !notamEnd) return true;

  // If only start date, check if it starts before flight ends
  if (notamStart && !notamEnd) {
    return notamStart <= flightWindow.end;
  }

  // If only end date, check if it ends after flight starts
  if (!notamStart && notamEnd) {
    return notamEnd >= flightWindow.start;
  }

  // Both dates present - check for overlap
  // Overlap exists if: notamStart <= flightEnd AND notamEnd >= flightStart
  return notamStart! <= flightWindow.end && notamEnd! >= flightWindow.start;
}

function parseNotam(notam: NotamDto): ParsedNotam | null {
  const detail = notam.properties?.coreNOTAMData?.notam;

  // Get raw text from the NOTAM
  const rawText = detail?.text || '';

  if (!rawText) return null;

  // Always translate the raw text using our abbreviation dictionary
  const translatedText = translateNotam(rawText);

  // Parse dates
  const effectiveStartDate = parseNotamDateString(detail?.effectiveStart);
  const effectiveEndDate = parseNotamDateString(detail?.effectiveEnd);

  return {
    id: detail?.id || notam.id || `notam-${Math.random()}`,
    rawText: rawText,
    translatedText: translatedText,
    effectiveStart: detail?.effectiveStart,
    effectiveEnd: detail?.effectiveEnd,
    effectiveStartDate,
    effectiveEndDate,
    location: detail?.location || detail?.icaoLocation,
    category: categorizeNotam(rawText),
    severityColor: getNotamSeverityColor(rawText),
  };
}

function formatNotamDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown';

  try {
    // Handle NOTAM date formats (often in format like "2401151200" or ISO)
    if (/^\d{10}$/.test(dateStr)) {
      // Format: YYMMDDHHMM
      const year = 2000 + parseInt(dateStr.slice(0, 2));
      const month = parseInt(dateStr.slice(2, 4)) - 1;
      const day = parseInt(dateStr.slice(4, 6));
      const hour = parseInt(dateStr.slice(6, 8));
      const min = parseInt(dateStr.slice(8, 10));
      return new Date(year, month, day, hour, min).toLocaleString();
    }

    // Try ISO format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }

    return dateStr;
  } catch {
    return dateStr;
  }
}

function NotamItem({
  notam,
  viewMode,
  defaultExpanded = false,
  appliesToFlight = false,
}: {
  notam: ParsedNotam;
  viewMode: ViewMode;
  defaultExpanded?: boolean;
  appliesToFlight?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const displayText = viewMode === 'raw' ? notam.rawText : notam.translatedText;

  // Determine if NOTAM is currently active (not expired)
  const isActive = useMemo(() => {
    if (!notam.effectiveEndDate) return true;
    return notam.effectiveEndDate > new Date();
  }, [notam.effectiveEndDate]);

  return (
    <Paper
      p="sm"
      style={{
        backgroundColor: appliesToFlight
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(15, 23, 42, 0.6)',
        border: appliesToFlight
          ? '1px solid rgba(59, 130, 246, 0.3)'
          : '1px solid rgba(148, 163, 184, 0.15)',
        borderLeft: `3px solid var(--mantine-color-${notam.severityColor}-6)`,
      }}
    >
      <Group justify="space-between" mb={expanded ? 'xs' : 0} wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1, overflow: 'hidden' }}>
          <Badge
            variant="light"
            color={notam.severityColor}
            size="sm"
            style={{ flexShrink: 0 }}
          >
            {notam.category}
          </Badge>
          {appliesToFlight && (
            <Tooltip label="This NOTAM is in effect during your planned flight time">
              <Badge
                variant="filled"
                color="blue"
                size="xs"
                style={{ flexShrink: 0 }}
                leftSection={<FiClock size={10} />}
              >
                During Flight
              </Badge>
            </Tooltip>
          )}
          {!isActive && (
            <Badge variant="outline" color="gray" size="xs" style={{ flexShrink: 0 }}>
              Expired
            </Badge>
          )}
          {!expanded && (
            <Text
              size="xs"
              c="gray.4"
              lineClamp={1}
              style={{ flex: 1 }}
            >
              {displayText.slice(0, 100)}...
            </Text>
          )}
        </Group>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </ActionIcon>
      </Group>

      <Collapse in={expanded}>
        <Stack gap="xs">
          <Text
            size="sm"
            c="gray.3"
            style={{
              fontFamily: viewMode === 'raw' ? 'monospace' : 'inherit',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '10px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {displayText}
          </Text>

          <Group gap="lg">
            {notam.effectiveStart && (
              <Box>
                <Text size="xs" c="dimmed">Effective From</Text>
                <Text size="xs" c="gray.4">
                  {formatNotamDate(notam.effectiveStart)}
                </Text>
              </Box>
            )}
            {notam.effectiveEnd && (
              <Box>
                <Text size="xs" c="dimmed">Until</Text>
                <Text size="xs" c="gray.4">
                  {formatNotamDate(notam.effectiveEnd)}
                </Text>
              </Box>
            )}
            {notam.id && (
              <Box>
                <Text size="xs" c="dimmed">NOTAM ID</Text>
                <Text size="xs" c="gray.5" style={{ fontFamily: 'monospace' }}>
                  {notam.id}
                </Text>
              </Box>
            )}
          </Group>
        </Stack>
      </Collapse>
    </Paper>
  );
}

const CATEGORY_ORDER = [
  'Runway',
  'Taxiway',
  'Apron',
  'Lighting',
  'Navigation',
  'Obstruction',
  'Airspace',
  'Communications',
  'Services',
  'Aerodrome',
  'General',
];

export function NotamsList({
  notamsData,
  viewMode,
  flightTimeWindow,
}: NotamsListProps) {
  // Parse and group NOTAMs by category
  const { notamsByCategory, sortedCategories, severityCounts, duringFlightCount } = useMemo(() => {
    if (!notamsData?.notams) {
      return {
        notamsByCategory: {} as Record<string, ParsedNotam[]>,
        sortedCategories: [] as string[],
        severityCounts: { red: 0, orange: 0, yellow: 0, blue: 0, gray: 0 },
        duringFlightCount: 0,
      };
    }

    const parsed = notamsData.notams
      .map(parseNotam)
      .filter((n): n is ParsedNotam => n !== null);

    // Group by category
    const byCategory = parsed.reduce((acc, notam) => {
      if (!acc[notam.category]) {
        acc[notam.category] = [];
      }
      acc[notam.category].push(notam);
      return acc;
    }, {} as Record<string, ParsedNotam[]>);

    // Sort NOTAMs within each category by severity
    const severityOrder: Record<string, number> = { red: 0, orange: 1, yellow: 2, blue: 3, gray: 4 };
    Object.values(byCategory).forEach((notams) => {
      notams.sort((a, b) => {
        const aSeverity = severityOrder[a.severityColor] ?? 5;
        const bSeverity = severityOrder[b.severityColor] ?? 5;
        if (aSeverity !== bSeverity) return aSeverity - bSeverity;

        const aApplies = notamOverlapsFlightTime(a, flightTimeWindow);
        const bApplies = notamOverlapsFlightTime(b, flightTimeWindow);
        if (aApplies && !bApplies) return -1;
        if (!aApplies && bApplies) return 1;
        return 0;
      });
    });

    // Sort categories
    const categories = Object.keys(byCategory).sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Count severities
    const counts = { red: 0, orange: 0, yellow: 0, blue: 0, gray: 0 };
    parsed.forEach((n) => {
      counts[n.severityColor as keyof typeof counts]++;
    });

    // Count during flight
    const flightCount = flightTimeWindow
      ? parsed.filter((n) => notamOverlapsFlightTime(n, flightTimeWindow)).length
      : 0;

    return {
      notamsByCategory: byCategory,
      sortedCategories: categories,
      severityCounts: counts,
      duringFlightCount: flightCount,
    };
  }, [notamsData?.notams, flightTimeWindow]);

  if (sortedCategories.length === 0) {
    return (
      <Alert
        icon={<FiInfo size={16} />}
        color="blue"
        variant="light"
      >
        No NOTAMs found for this location.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Summary bar */}
      <Group gap="md">
        {flightTimeWindow && duringFlightCount > 0 && (
          <Tooltip label="NOTAMs in effect during your planned flight time">
            <Badge variant="filled" color="blue" size="sm" leftSection={<FiClock size={10} />}>
              {duringFlightCount} during flight
            </Badge>
          </Tooltip>
        )}
        {severityCounts.red > 0 && (
          <Tooltip label="Closed/Inoperative">
            <Badge variant="filled" color="red" size="sm">
              {severityCounts.red} critical
            </Badge>
          </Tooltip>
        )}
        {severityCounts.orange > 0 && (
          <Tooltip label="Caution/Warning">
            <Badge variant="light" color="orange" size="sm">
              {severityCounts.orange} caution
            </Badge>
          </Tooltip>
        )}
      </Group>

      {/* NOTAMs grouped by category */}
      {sortedCategories.map((category) => {
        const categoryNotams = notamsByCategory[category];
        const hasCritical = categoryNotams.some((n) => n.severityColor === 'red');
        const hasCaution = categoryNotams.some((n) => n.severityColor === 'orange');

        return (
          <Box key={category}>
            {/* Category header */}
            <Group
              gap="sm"
              mb="sm"
              pb={6}
              style={{
                borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
              }}
            >
              <Text size="md" fw={700} c="gray.3" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                {category}
              </Text>
              <Badge
                size="sm"
                variant="filled"
                color={hasCritical ? 'red' : hasCaution ? 'orange' : 'gray'}
              >
                {categoryNotams.length}
              </Badge>
            </Group>

            {/* NOTAMs in this category */}
            <Stack gap="xs">
              {categoryNotams.map((notam, idx) => {
                const appliesToFlight = notamOverlapsFlightTime(notam, flightTimeWindow);
                return (
                  <NotamItem
                    key={notam.id || idx}
                    notam={notam}
                    viewMode={viewMode}
                    defaultExpanded={notam.severityColor === 'red' || appliesToFlight}
                    appliesToFlight={appliesToFlight}
                  />
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
