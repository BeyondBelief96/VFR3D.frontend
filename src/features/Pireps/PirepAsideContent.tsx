import { Box, Stack, Text, Badge, Group, ActionIcon, Code, ScrollArea } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { PirepDto } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';
import { ACTION_ICON_COLORS } from '@/constants/colors';

interface PirepAsideContentProps {
  pirep: PirepDto;
  onClose: () => void;
}

const PirepAsideContent: React.FC<PirepAsideContentProps> = ({ pirep, onClose }) => {
  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <Badge color="violet">PIREP</Badge>
          <ActionIcon variant="subtle" color={ACTION_ICON_COLORS.CLOSE} onClick={onClose} className={classes.closeButton}>
            <FiX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Scrollable content */}
      <ScrollArea flex={1} scrollbarSize={6}>
        <Stack gap="xs" p="md">
          {/* Raw Text */}
          {pirep.rawText && (
            <Code block className={classes.codeBlock}>
              {pirep.rawText}
            </Code>
          )}

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
              {pirep.tempC}C
            </Text>
          )}
          {pirep.windDirDegrees !== undefined && pirep.windSpeedKt !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Wind: </Text>
              {pirep.windDirDegrees} @ {pirep.windSpeedKt}kt
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
    </Stack>
  );
};

export default PirepAsideContent;
