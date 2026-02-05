import { Box, Stack, Text, Badge, Group, ActionIcon, ScrollArea, Divider } from '@mantine/core';
import { FiX, FiInfo } from 'react-icons/fi';
import { GAirmetDto, GAirmetHazardType } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';
import { THEME_COLORS } from '@/constants/surfaces';

// Helper to get G-AIRMET hazard description
const getGAirmetHazardDescription = (hazard?: GAirmetHazardType): { name: string; description: string; category: string } => {
  switch (hazard) {
    case GAirmetHazardType.MT_OBSC:
      return {
        name: 'Mountain Obscuration',
        description: 'Mountains hidden by clouds, precipitation, or widespread haze.',
        category: 'SIERRA',
      };
    case GAirmetHazardType.IFR:
      return {
        name: 'IFR Conditions',
        description: 'Ceilings below 1000 ft AGL and/or visibility below 3 statute miles.',
        category: 'SIERRA',
      };
    case GAirmetHazardType.TURB_LO:
      return {
        name: 'Low-Level Turbulence',
        description: 'Moderate turbulence below FL180 (18,000 ft).',
        category: 'TANGO',
      };
    case GAirmetHazardType.TURB_HI:
      return {
        name: 'High-Level Turbulence',
        description: 'Moderate turbulence at or above FL180 (18,000 ft).',
        category: 'TANGO',
      };
    case GAirmetHazardType.LLWS:
      return {
        name: 'Low-Level Wind Shear',
        description: 'Non-convective low-level wind shear below 2000 ft AGL.',
        category: 'TANGO',
      };
    case GAirmetHazardType.SFC_WIND:
      return {
        name: 'Strong Surface Winds',
        description: 'Sustained surface winds of 30 knots or greater.',
        category: 'TANGO',
      };
    case GAirmetHazardType.ICE:
      return {
        name: 'Icing',
        description: 'Moderate icing conditions in clouds or precipitation.',
        category: 'ZULU',
      };
    case GAirmetHazardType.FZLVL:
      return {
        name: 'Freezing Level',
        description: 'Height of the 0C isotherm (freezing level).',
        category: 'ZULU',
      };
    case GAirmetHazardType.M_FZLVL:
      return {
        name: 'Multiple Freezing Levels',
        description: 'Multiple freezing levels due to temperature inversions.',
        category: 'ZULU',
      };
    default:
      return {
        name: 'Unknown',
        description: 'G-AIRMET weather advisory.',
        category: 'Unknown',
      };
  }
};

// Get color for G-AIRMET hazard badge
const getGAirmetHazardColor = (hazard?: GAirmetHazardType): string => {
  switch (hazard) {
    case GAirmetHazardType.MT_OBSC:
      return 'gray';
    case GAirmetHazardType.IFR:
      return 'green';
    case GAirmetHazardType.TURB_LO:
      return 'orange';
    case GAirmetHazardType.TURB_HI:
      return 'red';
    case GAirmetHazardType.LLWS:
      return 'yellow';
    case GAirmetHazardType.SFC_WIND:
      return 'violet';
    case GAirmetHazardType.ICE:
      return 'cyan';
    case GAirmetHazardType.FZLVL:
      return 'blue';
    case GAirmetHazardType.M_FZLVL:
      return 'indigo';
    default:
      return 'blue';
  }
};

interface GAirmetAsideContentProps {
  gairmet: GAirmetDto;
  onClose: () => void;
}

const GAirmetAsideContent: React.FC<GAirmetAsideContentProps> = ({ gairmet, onClose }) => {
  const hazardInfo = getGAirmetHazardDescription(gairmet.hazard);
  const hazardColor = getGAirmetHazardColor(gairmet.hazard);

  // Helper to format altitude value for display
  const formatAltitude = (value: string | undefined, isFzl: boolean = false): string => {
    if (!value) return isFzl ? 'Unknown' : 'SFC';
    const upper = value.toUpperCase();
    if (upper.startsWith('SFC')) return 'Surface';
    if (upper === 'FZL') return 'Freezing Level';
    const num = parseFloat(value);
    return isNaN(num) ? value : `${num.toLocaleString()} ft`;
  };

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" className={classes.flexGroup}>
            <Badge color={hazardColor}>G-AIRMET</Badge>
            <Badge variant="outline" color={hazardColor}>
              {hazardInfo.name}
            </Badge>
            {gairmet.hazardSeverity && (
              <Badge size="xs" color={gairmet.hazardSeverity === 'MOD' ? 'yellow' : 'orange'}>
                {gairmet.hazardSeverity}
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
          {/* Hazard Type */}
          {gairmet.hazard !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Hazard: </Text>
              <Text span fw={500}>{hazardInfo.name}</Text>
              {gairmet.hazardSeverity && ` (${gairmet.hazardSeverity})`}
            </Text>
          )}

          {/* Category */}
          <Text size="sm">
            <Text span c="dimmed">Category: </Text>
            {hazardInfo.category}
          </Text>

          {/* Due To */}
          {gairmet.dueTo && (
            <Text size="sm">
              <Text span c="dimmed">Due To: </Text>
              {gairmet.dueTo}
            </Text>
          )}

          {/* Altitude Information */}
          {gairmet.altitudes && gairmet.altitudes.length > 0 && (
            <Box>
              <Text size="sm" c="dimmed" mb={2}>Altitude:</Text>
              {gairmet.altitudes.map((alt, idx) => {
                const minIsFzl = alt.minFtMsl?.toUpperCase() === 'FZL';
                const maxIsFzl = alt.maxFtMsl?.toUpperCase() === 'FZL';

                return (
                  <Box key={idx} pl="sm">
                    {alt.levelFtMsl && !alt.minFtMsl && !alt.maxFtMsl && (
                      <Text size="sm">
                        {formatAltitude(alt.levelFtMsl)} MSL
                      </Text>
                    )}
                    {(alt.minFtMsl || alt.maxFtMsl) && (
                      <Text size="sm">
                        {minIsFzl ? 'Freezing Level' : formatAltitude(alt.minFtMsl)}
                        {' - '}
                        {maxIsFzl ? 'Freezing Level' : formatAltitude(alt.maxFtMsl)} MSL
                      </Text>
                    )}
                    {alt.fzlAltitude && (minIsFzl || maxIsFzl) && (
                      <Text size="xs" c="cyan.4" pl="sm">
                        (Freezing level: {formatAltitude(alt.fzlAltitude.minFtMsl, true)}
                        {alt.fzlAltitude.maxFtMsl && ` - ${formatAltitude(alt.fzlAltitude.maxFtMsl, true)}`} MSL)
                      </Text>
                    )}
                    {alt.fzlAltitude && !minIsFzl && !maxIsFzl && (
                      <Text size="sm" c="cyan.4">
                        <Text span c="dimmed">Freezing Level: </Text>
                        {formatAltitude(alt.fzlAltitude.minFtMsl, true)}
                        {alt.fzlAltitude.maxFtMsl && ` - ${formatAltitude(alt.fzlAltitude.maxFtMsl, true)}`} MSL
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Forecast Hour */}
          {gairmet.forecastHour !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Forecast Hour: </Text>
              +{gairmet.forecastHour}h
            </Text>
          )}

          {/* Valid Time */}
          {gairmet.validTime && (
            <Text size="sm">
              <Text span c="dimmed">Valid Time: </Text>
              {new Date(gairmet.validTime).toLocaleString()}
            </Text>
          )}

          {/* Issue/Expire Times */}
          {gairmet.issueTime && (
            <Text size="sm">
              <Text span c="dimmed">Issued: </Text>
              {new Date(gairmet.issueTime).toLocaleString()}
            </Text>
          )}
          {gairmet.expireTime && (
            <Text size="sm">
              <Text span c="dimmed">Expires: </Text>
              {new Date(gairmet.expireTime).toLocaleString()}
            </Text>
          )}

          {/* Tag */}
          {gairmet.tag && (
            <Text size="xs" c="dimmed">
              Tag: {gairmet.tag}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Educational Section */}
          <Box p="xs" className={classes.infoBox}>
            <Group gap={4} mb={4}>
              <FiInfo size={12} color={THEME_COLORS.ICON_BLUE} />
              <Text size="xs" fw={500} c="blue.4">
                What is this?
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {hazardInfo.description}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              G-AIRMETs are graphical weather advisories issued every 6 hours with snapshots valid at 3-hour intervals. The {hazardInfo.category} category covers {hazardInfo.category === 'SIERRA' ? 'IFR and mountain obscuration' : hazardInfo.category === 'TANGO' ? 'turbulence and wind' : 'icing and freezing levels'}.
            </Text>
          </Box>
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default GAirmetAsideContent;
