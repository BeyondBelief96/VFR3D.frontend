import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  TextInput,
  Stack,
  Text,
  Group,
  Badge,
  Box,
  Loader,
  UnstyledButton,
  Card,
  ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { useSearchAirportsQuery } from '@/redux/api/vfr3d/airports.api';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { SURFACE, BORDER, THEME_COLORS } from '@/constants/surfaces';

interface MobileAirportSearchProps {
  placeholder?: string;
  onAirportSelect?: (airport: AirportDto) => void;
}

/**
 * Enhanced airport search component optimized for mobile/touch interfaces.
 * Navigates to the airport detail page on selection.
 */
export function MobileAirportSearch({
  placeholder = 'Search airports...',
  onAirportSelect,
}: MobileAirportSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);

  const { data: airports, isLoading, isFetching } = useSearchAirportsQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const handleAirportClick = (airport: AirportDto) => {
    const code = airport.icaoId || airport.arptId || '';
    setQuery('');

    if (onAirportSelect) {
      onAirportSelect(airport);
    } else {
      // Navigate to airport detail page
      navigate({ to: '/airports/$airportId', params: { airportId: code } });
    }
  };

  const displayedAirports = airports?.slice(0, 10) || [];
  const showResults = debouncedQuery.length >= 2;

  return (
    <Stack gap="sm">
      {/* Search Input - Large touch target */}
      <TextInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        size="lg"
        leftSection={<FiSearch size={20} />}
        rightSection={isFetching ? <Loader size="sm" /> : null}
        styles={{
          input: {
            backgroundColor: THEME_COLORS.SURFACE_7,
            borderColor: BORDER.STRONG,
            color: 'white',
            fontSize: '1rem',
            height: 52,
          },
        }}
      />

      {/* Results */}
      {showResults && (
        <Stack gap="xs">
          {isLoading ? (
            <Card
              padding="md"
              radius="md"
              style={{
                backgroundColor: SURFACE.CARD,
                border: `1px solid ${BORDER.SUBTLE}`,
              }}
            >
              <Group justify="center" gap="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Searching...
                </Text>
              </Group>
            </Card>
          ) : displayedAirports.length > 0 ? (
            displayedAirports.map((airport) => (
              <UnstyledButton
                key={airport.siteNo}
                onClick={() => handleAirportClick(airport)}
                style={{ width: '100%' }}
              >
                <Card
                  padding="md"
                  radius="md"
                  style={{
                    backgroundColor: SURFACE.CARD,
                    border: `1px solid ${BORDER.CARD}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <ThemeIcon size={40} radius="md" variant="light" color="blue">
                        <FiMapPin size={20} />
                      </ThemeIcon>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs">
                          <Text size="md" fw={600} c="white">
                            {airport.icaoId || airport.arptId}
                          </Text>
                          {airport.icaoId &&
                            airport.arptId &&
                            airport.icaoId !== airport.arptId && (
                              <Badge size="xs" variant="outline" color="gray">
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
            ))
          ) : (
            <Card
              padding="md"
              radius="md"
              style={{
                backgroundColor: SURFACE.CARD,
                border: `1px solid ${BORDER.SUBTLE}`,
              }}
            >
              <Text size="sm" c="dimmed" ta="center">
                No airports found for "{debouncedQuery}"
              </Text>
            </Card>
          )}

          {airports && airports.length > 10 && (
            <Text size="xs" c="dimmed" ta="center">
              {airports.length - 10} more results...
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export default MobileAirportSearch;
