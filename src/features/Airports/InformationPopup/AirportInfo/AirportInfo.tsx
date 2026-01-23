import React from 'react';
import { Accordion, Text, Stack, Group, Badge } from '@mantine/core';
import { AirportDto } from '@/redux/api/vfr3d/dtos';

interface AirportInfoProps {
  airport: AirportDto;
}

const InfoItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({
  label,
  value,
}) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} ta="right">
        {value}
      </Text>
    </Group>
  );
};

const AirportInfo: React.FC<AirportInfoProps> = ({ airport }) => {
  return (
    <Accordion defaultValue={['general', 'location']} multiple variant="separated">
      {/* General Information */}
      <Accordion.Item value="general">
        <Accordion.Control>
          <Text fw={500}>General Information</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            <InfoItem label="ICAO Code" value={airport.icaoId} />
            <InfoItem label="FAA ID" value={airport.arptId} />
            <InfoItem label="Airport Name" value={airport.arptName} />
            <InfoItem label="Site Type" value={airport.siteTypeCode} />
            <InfoItem label="Status" value={airport.arptStatus} />
            <InfoItem label="Fuel Types" value={airport.fuelTypes} />
            <InfoItem label="Chart Name" value={airport.chartName} />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      {/* Location */}
      <Accordion.Item value="location">
        <Accordion.Control>
          <Text fw={500}>Location</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            <InfoItem label="City" value={airport.city} />
            <InfoItem label="State" value={airport.stateCode} />
            <InfoItem label="State Name" value={airport.stateName} />
            <InfoItem label="Country" value={airport.countryCode} />
            <InfoItem
              label="Coordinates"
              value={
                airport.latDecimal && airport.longDecimal
                  ? `${airport.latDecimal.toFixed(4)}°, ${airport.longDecimal.toFixed(4)}°`
                  : null
              }
            />
            <InfoItem
              label="Elevation"
              value={airport.elev ? `${airport.elev.toLocaleString()} ft MSL` : null}
            />
            <InfoItem 
              label="Magnetic Variation" 
              value={airport.magVarn ? `${airport.magVarn}° ${airport.magHemis || ''}` : null} 
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      {/* Operational */}
      <Accordion.Item value="operational">
        <Accordion.Control>
          <Text fw={500}>Operational</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            <InfoItem label="Status" value={airport.arptStatus} />
            <InfoItem label="Fuel Types" value={airport.fuelTypes} />
            <InfoItem 
              label="Last Inspection" 
              value={airport.lastInspection ? new Date(airport.lastInspection).toLocaleDateString() : null} 
            />
            <Group gap="xs" wrap="wrap">
              {airport.customsFlag === 'Y' && (
                <Badge color="blue" size="sm">Customs</Badge>
              )}
              {airport.jointUseFlag === 'Y' && (
                <Badge color="green" size="sm">Joint Use</Badge>
              )}
              {airport.milLndgFlag === 'Y' && (
                <Badge color="orange" size="sm">Military Landing</Badge>
              )}
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      {/* Contact */}
      <Accordion.Item value="contact">
        <Accordion.Control>
          <Text fw={500}>Contact</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            <InfoItem label="Contact Name" value={airport.contactName} />
            <InfoItem label="Contact Title" value={airport.contactTitle} />
            <InfoItem label="Phone" value={airport.contactPhoneNumber} />
            {(airport.contactAddress1 || airport.contactCity) && (
              <Text size="sm">
                <Text span c="dimmed">Address: </Text>
                {[
                  airport.contactAddress1,
                  airport.contactAddress2,
                  airport.contactCity,
                  airport.contactState,
                  airport.contactZipCode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default AirportInfo;
