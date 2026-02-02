import { Box, Stack, Text, Badge, Group, ActionIcon, Code, ScrollArea, Divider } from '@mantine/core';
import { FiX, FiInfo } from 'react-icons/fi';
import { AirsigmetDto } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';

// Helper to get hazard description for SIGMETs
const getHazardDescription = (hazardType?: string): string => {
  switch (hazardType) {
    case 'CONVECTIVE':
      return 'Thunderstorms with potential for severe turbulence, icing, hail, and low-level wind shear. Avoid areas of convective activity.';
    case 'ICE':
      return 'Moderate to severe icing conditions. Ice accumulation can affect aircraft performance and control.';
    case 'TURB':
      return 'Moderate to severe turbulence. May cause significant changes in altitude and/or attitude.';
    case 'IFR':
      return 'Instrument Flight Rules conditions with visibility below 3 SM and/or ceilings below 1000 ft AGL.';
    case 'MTN OBSCN':
    case 'MTN_OBSCN':
      return 'Mountains obscured by clouds, fog, or precipitation. Terrain may not be visible.';
    default:
      return 'Weather hazard affecting flight safety.';
  }
};

interface AirsigmetAsideContentProps {
  airsigmet: AirsigmetDto;
  onClose: () => void;
}

const AirsigmetAsideContent: React.FC<AirsigmetAsideContentProps> = ({ airsigmet, onClose }) => {
  const hazardTypeStr = airsigmet.hazard?.type !== undefined
    ? String(airsigmet.hazard.type)
    : undefined;

  const isSigmet = airsigmet.airsigmetType === 'SIGMET';

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" className={classes.flexGroup}>
            <Badge color={isSigmet ? 'red' : 'orange'}>
              {airsigmet.airsigmetType}
            </Badge>
            {hazardTypeStr && (
              <Badge variant="outline" color={isSigmet ? 'red' : 'orange'}>
                {hazardTypeStr}
              </Badge>
            )}
            {airsigmet.hazard?.severity && (
              <Badge
                size="xs"
                color={airsigmet.hazard.severity === 'SEV' ? 'red' : 'yellow'}
              >
                {airsigmet.hazard.severity}
              </Badge>
            )}
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} className={classes.closeButton}>
            <FiX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Scrollable content */}
      <ScrollArea flex={1} scrollbarSize={6}>
        <Stack gap="xs" p="md">
          {/* Raw Text */}
          {airsigmet.rawText && (
            <Code block className={classes.codeBlock}>
              {airsigmet.rawText}
            </Code>
          )}

          {/* Hazard Details */}
          {airsigmet.hazard && (
            <>
              {hazardTypeStr && (
                <Text size="sm">
                  <Text span c="dimmed">Hazard: </Text>
                  {hazardTypeStr}
                  {airsigmet.hazard.severity && ` (${airsigmet.hazard.severity})`}
                </Text>
              )}
            </>
          )}

          {/* Altitude */}
          {airsigmet.altitude && (
            <Text size="sm">
              <Text span c="dimmed">Altitude: </Text>
              {airsigmet.altitude.minFtMsl?.toLocaleString() || 'SFC'} - {airsigmet.altitude.maxFtMsl?.toLocaleString() || 'UNL'} ft MSL
            </Text>
          )}

          {/* Movement */}
          {(airsigmet.movementDirDegrees !== undefined || airsigmet.movementSpeedKt !== undefined) && (
            <Text size="sm">
              <Text span c="dimmed">Movement: </Text>
              {airsigmet.movementDirDegrees !== undefined && `${airsigmet.movementDirDegrees}`}
              {airsigmet.movementSpeedKt !== undefined && ` @ ${airsigmet.movementSpeedKt}kt`}
            </Text>
          )}

          {/* Valid Time */}
          {(airsigmet.validTimeFrom || airsigmet.validTimeTo) && (
            <Text size="sm">
              <Text span c="dimmed">Valid: </Text>
              {airsigmet.validTimeFrom && new Date(airsigmet.validTimeFrom).toLocaleString()}
              {airsigmet.validTimeTo && ` - ${new Date(airsigmet.validTimeTo).toLocaleString()}`}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Educational Section */}
          <Box p="xs" className={classes.infoBox}>
            <Group gap={4} mb={4}>
              <FiInfo size={12} color="var(--mantine-color-blue-5)" />
              <Text size="xs" fw={500} c="blue.4">
                What is this?
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {isSigmet
                ? 'A SIGMET (Significant Meteorological Information) warns of weather potentially hazardous to ALL aircraft. SIGMETs are valid for 4 hours (6 hours for hurricanes).'
                : 'An AIRMET (Airmen\'s Meteorological Information) advises of weather potentially hazardous to light aircraft and VFR pilots. AIRMETs are valid for 6 hours.'}
            </Text>
            {hazardTypeStr && (
              <Text size="xs" c="dimmed" mt={4}>
                {getHazardDescription(hazardTypeStr)}
              </Text>
            )}
          </Box>
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default AirsigmetAsideContent;
