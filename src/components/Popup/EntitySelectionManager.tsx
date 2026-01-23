import React from 'react';
import { useSelector } from 'react-redux';
import { AirportInfoPopup } from '@/features/Airports/InformationPopup';
import { AirportDto, AirsigmetDto, AirspaceDto, PirepDto, SpecialUseAirspaceDto } from '@/redux/api/vfr3d/dtos';
import type { RootState } from '@/redux/store';
import { Paper, Stack, Text, Badge, Group, ActionIcon, Box, Code, ScrollArea } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';

// Simple popup for Airspace
const AirspaceInfoPopup: React.FC<{ airspace: AirspaceDto | SpecialUseAirspaceDto }> = ({ airspace }) => {
  const dispatch = useDispatch();
  const isSpecialUse = 'timesOfUse' in airspace;

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  return (
    <Paper
      shadow="xl"
      radius="md"
      p="md"
      style={{
        position: 'fixed',
        top: 70,
        right: 16,
        width: 350,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: 'rgba(37, 38, 43, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto',
        zIndex: 1000,
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Badge color={isSpecialUse ? 'orange' : 'blue'}>
            {isSpecialUse ? 'Special Use Airspace' : 'Airspace'}
          </Badge>
          <Text fw={600}>{airspace.name}</Text>
        </Group>
        <ActionIcon variant="subtle" color="gray" onClick={handleClose}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea mah={400}>
        <Stack gap="xs">
          <Text size="sm">
            <Text span c="dimmed">Class/Type: </Text>
            {airspace.class || (airspace as SpecialUseAirspaceDto).typeCode}
          </Text>
          <Text size="sm">
            <Text span c="dimmed">Lower: </Text>
            {airspace.lowerVal} {airspace.lowerCode} {airspace.lowerUom}
          </Text>
          <Text size="sm">
            <Text span c="dimmed">Upper: </Text>
            {airspace.upperVal} {airspace.upperCode} {airspace.upperUom}
          </Text>
          {isSpecialUse && (airspace as SpecialUseAirspaceDto).timesOfUse && (
            <Text size="sm">
              <Text span c="dimmed">Times: </Text>
              {(airspace as SpecialUseAirspaceDto).timesOfUse}
            </Text>
          )}
          {airspace.city && (
            <Text size="sm">
              <Text span c="dimmed">City: </Text>
              {airspace.city}
            </Text>
          )}
          {airspace.state && (
            <Text size="sm">
              <Text span c="dimmed">State: </Text>
              {airspace.state}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

// Simple popup for PIREP
const PirepInfoPopup: React.FC<{ pirep: PirepDto }> = ({ pirep }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  return (
    <Paper
      shadow="xl"
      radius="md"
      p="md"
      style={{
        position: 'fixed',
        top: 70,
        right: 16,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: 'rgba(37, 38, 43, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto',
        zIndex: 1000,
      }}
    >
      <Group justify="space-between" mb="md">
        <Badge color="violet">PIREP</Badge>
        <ActionIcon variant="subtle" color="gray" onClick={handleClose}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      {/* Raw Text */}
      {pirep.rawText && (
        <Code block mb="md" style={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
          {pirep.rawText}
        </Code>
      )}

      <ScrollArea mah={300}>
        <Stack gap="xs">
          {pirep.reportType && (
            <Text size="sm">
              <Text span c="dimmed">Type: </Text>
              <Badge size="xs" color={pirep.reportType === 'URGENT' ? 'red' : 'blue'}>
                {pirep.reportType}
              </Badge>
            </Text>
          )}
          {pirep.altitudeFtMsl && (
            <Text size="sm">
              <Text span c="dimmed">Altitude: </Text>
              {pirep.altitudeFtMsl.toLocaleString()} ft MSL
            </Text>
          )}
          {pirep.aircraftRef && (
            <Text size="sm">
              <Text span c="dimmed">Aircraft: </Text>
              {pirep.aircraftRef}
            </Text>
          )}
          {pirep.tempC !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Temperature: </Text>
              {pirep.tempC}°C
            </Text>
          )}
          {pirep.windDirDegrees !== undefined && pirep.windSpeedKt !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Wind: </Text>
              {pirep.windDirDegrees}° @ {pirep.windSpeedKt}kt
            </Text>
          )}
          {pirep.wxString && (
            <Text size="sm">
              <Text span c="dimmed">Weather: </Text>
              {pirep.wxString}
            </Text>
          )}
          {pirep.turbulenceConditions && pirep.turbulenceConditions.length > 0 && (
            <Box>
              <Text size="sm" c="dimmed">Turbulence:</Text>
              {pirep.turbulenceConditions.map((turb, idx) => (
                <Text key={idx} size="sm" pl="sm">
                  {turb.turbulenceIntensity} {turb.turbulenceType}
                  {turb.turbulenceBaseFtMsl && turb.turbulenceTopFtMsl && ` (${turb.turbulenceBaseFtMsl}-${turb.turbulenceTopFtMsl} ft)`}
                </Text>
              ))}
            </Box>
          )}
          {pirep.icingConditions && pirep.icingConditions.length > 0 && (
            <Box>
              <Text size="sm" c="dimmed">Icing:</Text>
              {pirep.icingConditions.map((ice, idx) => (
                <Text key={idx} size="sm" pl="sm">
                  {ice.icingIntensity} {ice.icingType}
                  {ice.icingBaseFtMsl && ice.icingTopFtMsl && ` (${ice.icingBaseFtMsl}-${ice.icingTopFtMsl} ft)`}
                </Text>
              ))}
            </Box>
          )}
          {pirep.skyConditions && pirep.skyConditions.length > 0 && (
            <Box>
              <Text size="sm" c="dimmed">Sky:</Text>
              {pirep.skyConditions.map((sky, idx) => (
                <Text key={idx} size="sm" pl="sm">
                  {sky.skyCover}
                  {sky.cloudBaseFtMsl && ` @ ${sky.cloudBaseFtMsl.toLocaleString()} ft`}
                </Text>
              ))}
            </Box>
          )}
          {pirep.observationTime && (
            <Text size="xs" c="dimmed" mt="xs">
              Observed: {new Date(pirep.observationTime).toLocaleString()}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

// Simple popup for AIRMET/SIGMET
const AirsigmetInfoPopup: React.FC<{ airsigmet: AirsigmetDto }> = ({ airsigmet }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  return (
    <Paper
      shadow="xl"
      radius="md"
      p="md"
      style={{
        position: 'fixed',
        top: 70,
        right: 16,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: 'rgba(37, 38, 43, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto',
        zIndex: 1000,
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Badge color={airsigmet.airsigmetType === 'SIGMET' ? 'red' : 'orange'}>
            {airsigmet.airsigmetType}
          </Badge>
          {airsigmet.hazard?.type && (
            <Badge variant="outline">{airsigmet.hazard.type}</Badge>
          )}
        </Group>
        <ActionIcon variant="subtle" color="gray" onClick={handleClose}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      {/* Raw Text */}
      {airsigmet.rawText && (
        <Code block mb="md" style={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
          {airsigmet.rawText}
        </Code>
      )}

      <ScrollArea mah={300}>
        <Stack gap="xs">
          {airsigmet.hazard && (
            <>
              {airsigmet.hazard.type && (
                <Text size="sm">
                  <Text span c="dimmed">Hazard: </Text>
                  {airsigmet.hazard.type}
                  {airsigmet.hazard.severity && ` (${airsigmet.hazard.severity})`}
                </Text>
              )}
            </>
          )}
          {airsigmet.altitude && (
            <Text size="sm">
              <Text span c="dimmed">Altitude: </Text>
              {airsigmet.altitude.minFtMsl?.toLocaleString()} - {airsigmet.altitude.maxFtMsl?.toLocaleString()} ft MSL
            </Text>
          )}
          {(airsigmet.movementDirDegrees || airsigmet.movementSpeedKt) && (
            <Text size="sm">
              <Text span c="dimmed">Movement: </Text>
              {airsigmet.movementDirDegrees}° @ {airsigmet.movementSpeedKt}kt
            </Text>
          )}
          {(airsigmet.validTimeFrom || airsigmet.validTimeTo) && (
            <Text size="sm">
              <Text span c="dimmed">Valid: </Text>
              {airsigmet.validTimeFrom && new Date(airsigmet.validTimeFrom).toLocaleString()}
              {airsigmet.validTimeTo && ` - ${new Date(airsigmet.validTimeTo).toLocaleString()}`}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

/**
 * EntitySelectionManager - Renders the appropriate popup based on selected entity type
 */
const EntitySelectionManager: React.FC = () => {
  const selectedEntity = useSelector((state: RootState) => state.selectedEntity.entity);
  const selectedEntityType = useSelector((state: RootState) => state.selectedEntity.type);

  if (!selectedEntity || !selectedEntityType) return null;

  switch (selectedEntityType) {
    case 'Airport':
      return <AirportInfoPopup selectedAirport={selectedEntity as AirportDto} />;
    case 'Airspace':
      return <AirspaceInfoPopup airspace={selectedEntity as AirspaceDto} />;
    case 'SpecialUseAirspace':
      return <AirspaceInfoPopup airspace={selectedEntity as SpecialUseAirspaceDto} />;
    case 'Pirep':
      return <PirepInfoPopup pirep={selectedEntity as PirepDto} />;
    case 'Airsigmet':
      return <AirsigmetInfoPopup airsigmet={selectedEntity as AirsigmetDto} />;
    default:
      return null;
  }
};

export default EntitySelectionManager;
