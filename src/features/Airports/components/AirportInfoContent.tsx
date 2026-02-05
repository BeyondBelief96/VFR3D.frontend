import { Stack, Paper, Group, ThemeIcon, Text, SimpleGrid } from '@mantine/core';
import { FiInfo, FiMapPin, FiRadio } from 'react-icons/fi';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { SURFACE_INNER } from '@/constants/surfaces';

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" c="white" ta="right" fw={500}>
        {value}
      </Text>
    </Group>
  );
}

interface AirportInfoContentProps {
  airport: AirportDto;
}

export function AirportInfoContent({ airport }: AirportInfoContentProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {/* General Info */}
      <Paper p="md" style={{ backgroundColor: SURFACE_INNER.DEFAULT }}>
        <Group gap="sm" mb="md">
          <ThemeIcon size="md" variant="light" color="blue">
            <FiInfo size={16} />
          </ThemeIcon>
          <Text fw={600} c="white">
            General Information
          </Text>
        </Group>
        <Stack gap="sm">
          {airport.icaoId && <InfoRow label="ICAO Code" value={airport.icaoId} />}
          {airport.arptId && <InfoRow label="FAA ID" value={airport.arptId} />}
          {airport.siteTypeCode && <InfoRow label="Type" value={airport.siteTypeCode} />}
          {airport.fuelTypes && <InfoRow label="Fuel Available" value={airport.fuelTypes} />}
          {airport.arptStatus && <InfoRow label="Status" value={airport.arptStatus} />}
        </Stack>
      </Paper>

      {/* Location */}
      <Paper p="md" style={{ backgroundColor: SURFACE_INNER.DEFAULT }}>
        <Group gap="sm" mb="md">
          <ThemeIcon size="md" variant="light" color="green">
            <FiMapPin size={16} />
          </ThemeIcon>
          <Text fw={600} c="white">
            Location
          </Text>
        </Group>
        <Stack gap="sm">
          {airport.city && <InfoRow label="City" value={airport.city} />}
          {airport.stateName && <InfoRow label="State" value={airport.stateName} />}
          {airport.latDecimal && airport.longDecimal && (
            <InfoRow label="Coordinates" value={`${airport.latDecimal.toFixed(4)}°, ${airport.longDecimal.toFixed(4)}°`} />
          )}
          {airport.magVarn && <InfoRow label="Mag Variation" value={`${airport.magVarn}° ${airport.magHemis || ''}`} />}
          {airport.elev && <InfoRow label="Field Elevation" value={`${airport.elev.toLocaleString()} ft MSL`} />}
        </Stack>
      </Paper>

      {/* Contact Info (if available) */}
      {(airport.contactName || airport.contactPhoneNumber) && (
        <Paper p="md" style={{ backgroundColor: SURFACE_INNER.DEFAULT }}>
          <Group gap="sm" mb="md">
            <ThemeIcon size="md" variant="light" color="grape">
              <FiRadio size={16} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Contact
            </Text>
          </Group>
          <Stack gap="sm">
            {airport.contactName && <InfoRow label="Name" value={airport.contactName} />}
            {airport.contactPhoneNumber && <InfoRow label="Phone" value={airport.contactPhoneNumber} />}
          </Stack>
        </Paper>
      )}
    </SimpleGrid>
  );
}
