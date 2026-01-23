import { useState, useEffect, useRef } from 'react';
import { TextInput, Paper, Stack, Text, Group, Badge, Box, Loader, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { useGetAirportsByPrefixQuery } from '@/redux/api/vfr3d/airports.api';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setSearchAirportQuery, triggerSearch } from '@/redux/slices/searchSlice';
import { AirportDto } from '@/redux/api/vfr3d/dtos';

interface AirportSearchProps {
  onAirportSelect?: (airport: AirportDto) => void;
  placeholder?: string;
}

export function AirportSearch({
  onAirportSelect,
  placeholder = 'Search airports (ICAO, name, city)...',
}: AirportSearchProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: airports, isLoading, isFetching } = useGetAirportsByPrefixQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    dispatch(setSearchAirportQuery(value));
    setShowDropdown(true);
  };

  const handleAirportClick = (airport: AirportDto) => {
    const identifier = airport.icaoId || airport.arptId || '';
    setQuery(identifier);
    setShowDropdown(false);
    dispatch(setSearchAirportQuery(identifier));
    dispatch(triggerSearch());
    onAirportSelect?.(airport);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowDropdown(false);
    }
    if (event.key === 'Enter' && query.length >= 2) {
      dispatch(triggerSearch());
      setShowDropdown(false);
    }
  };

  const displayedAirports = airports?.slice(0, 8) || [];

  return (
    <Box style={{ position: 'relative' }}>
      <TextInput
        ref={inputRef}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        leftSection={<FiSearch size={16} />}
        rightSection={isFetching ? <Loader size="xs" /> : null}
        styles={{
          input: {
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(148, 163, 184, 0.3)',
            color: 'white',
            '&:focus': {
              borderColor: 'var(--vfr3d-primary)',
            },
            '&::placeholder': {
              color: 'rgba(148, 163, 184, 0.6)',
            },
          },
        }}
      />

      {showDropdown && debouncedQuery.length >= 2 && (
        <Paper
          ref={dropdownRef}
          shadow="lg"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            backgroundColor: 'var(--vfr3d-surface)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {isLoading ? (
            <Group justify="center" p="md">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Searching...
              </Text>
            </Group>
          ) : displayedAirports.length > 0 ? (
            <Stack gap={0}>
              {displayedAirports.map((airport) => (
                <UnstyledButton
                  key={airport.siteNo}
                  onClick={() => handleAirportClick(airport)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background-color 150ms',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      },
                    },
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <FiMapPin size={16} color="var(--vfr3d-primary)" />
                      <Box>
                        <Group gap="xs">
                          <Text size="sm" fw={600} c="white">
                            {airport.icaoId || airport.arptId}
                          </Text>
                          {airport.icaoId && airport.arptId && airport.icaoId !== airport.arptId && (
                            <Badge size="xs" variant="outline" color="gray">
                              {airport.arptId}
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {airport.arptName}
                        </Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      {airport.city}, {airport.stateCode}
                    </Text>
                  </Group>
                </UnstyledButton>
              ))}
              {airports && airports.length > 8 && (
                <Text size="xs" c="dimmed" ta="center" p="xs">
                  {airports.length - 8} more results...
                </Text>
              )}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" p="md" ta="center">
              No airports found for "{debouncedQuery}"
            </Text>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default AirportSearch;
