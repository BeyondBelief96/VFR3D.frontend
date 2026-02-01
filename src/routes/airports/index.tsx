import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  TextInput,
  Group,
  Badge,
  Box,
  Loader,
  UnstyledButton,
  Center,
  ThemeIcon,
  Paper,
  ActionIcon,
} from '@mantine/core';
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks';
import { FiSearch, FiMapPin, FiClock, FiX } from 'react-icons/fi';
import { TbPlane } from 'react-icons/tb';
import { ProtectedRoute } from '@/components/Auth';
import { useSearchAirportsQuery } from '@/redux/api/vfr3d/airports.api';
import { AirportDto } from '@/redux/api/vfr3d/dtos';

export const Route = createFileRoute('/airports/')({
  component: AirportsPage,
});

function AirportsPage() {
  return (
    <ProtectedRoute>
      <AirportsContent />
    </ProtectedRoute>
  );
}

interface RecentSearch {
  code: string;
  name: string;
  city: string;
  stateCode: string;
  timestamp: number;
}

function AirportsContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>({
    key: 'vfr3d-recent-airport-searches',
    defaultValue: [],
  });

  const { data: airports, isLoading, isFetching } = useSearchAirportsQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const handleAirportSelect = (airport: AirportDto) => {
    const code = airport.icaoId || airport.arptId || '';

    // Add to recent searches
    const newRecent: RecentSearch = {
      code,
      name: airport.arptName || '',
      city: airport.city || '',
      stateCode: airport.stateCode || '',
      timestamp: Date.now(),
    };

    // Remove duplicate and add to front, keep max 10
    const filtered = recentSearches.filter((r) => r.code !== code);
    setRecentSearches([newRecent, ...filtered].slice(0, 10));

    // Navigate to airport detail page
    navigate({ to: '/airports/$airportId', params: { airportId: code } });
  };

  const handleRemoveRecent = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter((r) => r.code !== code));
  };

  const displayedAirports = airports?.slice(0, 20) || [];
  const showResults = debouncedQuery.length >= 2;
  const showRecent = !showResults && recentSearches.length > 0;

  return (
    <Container
      size="md"
      py="xl"
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
      }}
    >
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="xs" align="center">
          <ThemeIcon size={60} radius="xl" variant="light" color="blue">
            <TbPlane size={30} />
          </ThemeIcon>
          <Title order={1} c="white" ta="center">
            Airport Lookup
          </Title>
          <Text c="dimmed" ta="center" maw={400}>
            Search for airports by ICAO code, FAA identifier, name, or city
          </Text>
        </Stack>

        {/* Search Input */}
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search airports (e.g., KJFK, LAX, Chicago)..."
          size="xl"
          leftSection={<FiSearch size={24} />}
          rightSection={isFetching ? <Loader size="sm" /> : null}
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-vfr3dSurface-7)',
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: 'white',
              fontSize: '1.1rem',
              height: 60,
              paddingLeft: 50,
            },
            section: {
              paddingLeft: 16,
            },
          }}
        />

        {/* Loading State */}
        {isLoading && showResults && (
          <Center py="xl">
            <Group gap="sm">
              <Loader size="md" />
              <Text c="dimmed">Searching airports...</Text>
            </Group>
          </Center>
        )}

        {/* Search Results */}
        {showResults && !isLoading && (
          <Stack gap="sm">
            {displayedAirports.length > 0 ? (
              <>
                <Text size="sm" c="dimmed">
                  {airports?.length} airport{airports?.length !== 1 ? 's' : ''} found
                </Text>
                {displayedAirports.map((airport) => (
                  <AirportCard
                    key={airport.siteNo}
                    airport={airport}
                    onClick={() => handleAirportSelect(airport)}
                  />
                ))}
                {airports && airports.length > 20 && (
                  <Text size="sm" c="dimmed" ta="center">
                    Showing first 20 results. Refine your search for more specific results.
                  </Text>
                )}
              </>
            ) : (
              <Card
                padding="xl"
                radius="md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Stack align="center" gap="md">
                  <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                    <FiSearch size={24} />
                  </ThemeIcon>
                  <Text c="white" fw={500}>
                    No airports found
                  </Text>
                  <Text c="dimmed" ta="center" size="sm">
                    No airports match "{debouncedQuery}". Try a different search term.
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        )}

        {/* Recent Searches */}
        {showRecent && (
          <Stack gap="sm">
            <Group gap="xs">
              <FiClock size={16} color="var(--mantine-color-dimmed)" />
              <Text size="sm" c="dimmed" fw={500}>
                Recent Searches
              </Text>
            </Group>
            {recentSearches.map((recent) => (
              <Paper
                key={recent.code}
                p="md"
                radius="md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  navigate({ to: '/airports/$airportId', params: { airportId: recent.code } })
                }
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <FiMapPin size={18} color="var(--mantine-color-blue-4)" />
                    <Box>
                      <Group gap="xs">
                        <Text size="sm" fw={600} c="white">
                          {recent.code}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {recent.name} - {recent.city}, {recent.stateCode}
                      </Text>
                    </Box>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={(e) => handleRemoveRecent(recent.code, e)}
                  >
                    <FiX size={14} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Empty State - No Search, No Recent */}
        {!showResults && !showRecent && (
          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                <FiMapPin size={28} />
              </ThemeIcon>
              <Text c="white" fw={500} ta="center">
                Start typing to search
              </Text>
              <Text c="dimmed" ta="center" size="sm" maw={300}>
                Enter at least 2 characters to search for airports by code, name, or location.
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

interface AirportCardProps {
  airport: AirportDto;
  onClick: () => void;
}

function AirportCard({ airport, onClick }: AirportCardProps) {
  return (
    <UnstyledButton onClick={onClick} style={{ width: '100%' }}>
      <Card
        padding="md"
        radius="md"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          transition: 'all 0.2s ease',
        }}
        styles={{
          root: {
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            },
          },
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <ThemeIcon size={44} radius="md" variant="light" color="blue">
              <FiMapPin size={22} />
            </ThemeIcon>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <Text size="lg" fw={600} c="white">
                  {airport.icaoId || airport.arptId}
                </Text>
                {airport.icaoId && airport.arptId && airport.icaoId !== airport.arptId && (
                  <Badge size="sm" variant="outline" color="gray">
                    {airport.arptId}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {airport.arptName}
              </Text>
            </Box>
          </Group>
          <Box ta="right" style={{ flexShrink: 0 }}>
            <Text size="sm" c="white">
              {airport.city}
            </Text>
            <Text size="xs" c="dimmed">
              {airport.stateCode}
            </Text>
          </Box>
        </Group>
      </Card>
    </UnstyledButton>
  );
}
