import { useState, useEffect, useRef } from 'react';
import { TextInput, Paper, Stack, Text, Group, Badge, Box, Loader, UnstyledButton, Portal } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { useSearchAirportsQuery } from '@/redux/api/vfr3d/airports.api';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setSearchAirportQuery, triggerSearch } from '@/redux/slices/searchSlice';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { setSearchedAirportState } from '@/redux/slices/airportsSlice';
import { AirportDto } from '@/redux/api/vfr3d/dtos';

interface AirportSearchProps {
  onAirportSelect?: (airport: AirportDto) => void;
  placeholder?: string;
  /** If true, clears the input after selecting an airport (default: false for normal search, true for route building) */
  clearOnSelect?: boolean;
  /** If true, will set the selected entity and trigger fly-to (default: true when no onAirportSelect provided) */
  setAsSelectedEntity?: boolean;
}

export function AirportSearch({
  onAirportSelect,
  placeholder = 'Search airports (ICAO, name, city)...',
  clearOnSelect = false,
  setAsSelectedEntity,
}: AirportSearchProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Default: set as selected entity if no custom handler is provided
  const shouldSetAsSelectedEntity = setAsSelectedEntity ?? !onAirportSelect;

  // Search airports by ICAO, FAA ID, name, or city
  const { data: airports, isLoading, isFetching } = useSearchAirportsQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [airports]);

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

  // Update dropdown position when showing
  useEffect(() => {
    if (showDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showDropdown, query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    dispatch(setSearchAirportQuery(value));
    setShowDropdown(true);
  };

  const selectAirport = (airport: AirportDto) => {
    const identifier = airport.icaoId || airport.arptId || '';
    
    // Clear or set query based on clearOnSelect
    if (clearOnSelect) {
      setQuery('');
    } else {
      setQuery(identifier);
    }
    
    setShowDropdown(false);
    dispatch(setSearchAirportQuery(identifier));
    dispatch(triggerSearch());
    
    // Set the searched airport's state to show all airports in that state
    if (shouldSetAsSelectedEntity && airport.stateCode) {
      dispatch(setSearchedAirportState(airport.stateCode));
    }
    
    // Set as selected entity if configured (for fly-to functionality)
    if (shouldSetAsSelectedEntity) {
      dispatch(setSelectedEntity({ entity: airport, type: 'Airport' }));
    }
    
    // Call custom handler if provided
    onAirportSelect?.(airport);
  };

  const handleAirportClick = (airport: AirportDto) => {
    selectAirport(airport);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const displayedAirports = airports?.slice(0, 8) || [];
    
    if (event.key === 'Escape') {
      setShowDropdown(false);
      return;
    }
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => 
        Math.min(prev + 1, displayedAirports.length - 1)
      );
      return;
    }
    
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    
    if (event.key === 'Enter') {
      event.preventDefault();
      if (displayedAirports.length > 0) {
        // Select the highlighted airport
        selectAirport(displayedAirports[highlightedIndex]);
      } else if (query.length >= 2) {
        // No results but query exists - just trigger search
        dispatch(triggerSearch());
        setShowDropdown(false);
      }
      return;
    }
  };

  const displayedAirports = airports?.slice(0, 8) || [];

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
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
            backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
            borderColor: 'rgba(148, 163, 184, 0.3)',
            color: 'white',
          },
        }}
      />

      {showDropdown && debouncedQuery.length >= 2 && (
        <Portal>
          <Paper
            ref={dropdownRef}
            shadow="lg"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 10000,
              backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
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
              {displayedAirports.map((airport, index) => (
                <UnstyledButton
                  key={airport.siteNo}
                  onClick={() => handleAirportClick(airport)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background-color 150ms',
                    backgroundColor: index === highlightedIndex ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      },
                    },
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <FiMapPin size={16} color="var(--mantine-color-vfr3dBlue-5)" />
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
                        <Text size="xs" c="white" lineClamp={1}>
                          {airport.arptName}
                        </Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="white" style={{ whiteSpace: 'nowrap' }}>
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
        </Portal>
      )}
    </Box>
  );
}

export default AirportSearch;
