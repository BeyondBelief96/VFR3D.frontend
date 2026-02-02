import { Box, Stack, Text, Badge, Group, ActionIcon, ScrollArea, Divider } from '@mantine/core';
import { FiX, FiInfo } from 'react-icons/fi';
import { AirspaceDto, SpecialUseAirspaceDto } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';

// Helper to get airspace class info (based on FAA definitions)
const getAirspaceClassInfo = (airspaceClass: string | undefined): { color: string; description: string; requirements: string } => {
  switch (airspaceClass?.toUpperCase()) {
    case 'A':
      return {
        color: 'gray',
        description: 'Class A airspace is generally airspace from 18,000 ft MSL up to and including FL600. All operations must be conducted under IFR.',
        requirements: 'IFR flight plan and ATC clearance required. Instrument rating required.',
      };
    case 'B':
      return {
        color: 'blue',
        description: 'Class B airspace is generally airspace from the surface to 10,000 ft MSL surrounding the nation\'s busiest airports. Configuration is individually tailored and may resemble an upside-down wedding cake.',
        requirements: 'ATC clearance required for all aircraft to operate in the area. All cleared aircraft receive separation services.',
      };
    case 'C':
      return {
        color: 'violet',
        description: 'Class C airspace is generally airspace from the surface to 4,000 ft above the airport elevation surrounding airports with an operational control tower and radar approach control.',
        requirements: 'Two-way radio communications with ATC must be established prior to entry and maintained while in the airspace.',
      };
    case 'D':
      return {
        color: 'cyan',
        description: 'Class D airspace is generally airspace from the surface to 2,500 ft above the airport elevation surrounding airports with an operational control tower.',
        requirements: 'Two-way radio communications with ATC must be established prior to entry.',
      };
    case 'E':
      return {
        color: 'green',
        description: 'Class E is controlled airspace that is not Class A, B, C, or D. It may begin at the surface or at a designated altitude.',
        requirements: 'No specific entry requirements for VFR flight. IFR flights require ATC clearance.',
      };
    case 'G':
      return {
        color: 'gray',
        description: 'Class G is uncontrolled airspace where ATC has no authority or responsibility for exercising control over air traffic.',
        requirements: 'No ATC requirements. Pilots are responsible for see-and-avoid.',
      };
    default:
      return {
        color: 'gray',
        description: 'Controlled airspace.',
        requirements: 'Check applicable regulations.',
      };
  }
};

// Helper to get special use airspace info
const getSpecialUseAirspaceInfo = (typeCode: string | undefined): { color: string; description: string; caution: string } => {
  switch (typeCode?.toUpperCase()) {
    case 'MOA':
      return {
        color: 'orange',
        description: 'Military Operations Area - Airspace for military training activities including aerobatics and air combat tactics.',
        caution: 'VFR flight is permitted but exercise extreme caution. Military aircraft may not see you.',
      };
    case 'R':
      return {
        color: 'red',
        description: 'Restricted Area - Contains hazardous activities such as artillery firing, aerial gunnery, or guided missiles.',
        caution: 'Entry prohibited without permission from the controlling agency. Check NOTAMs for active times.',
      };
    case 'P':
      return {
        color: 'red',
        description: 'Prohibited Area - Flight is completely prohibited for national security or other reasons.',
        caution: 'Entry is NEVER permitted. No exceptions for civilian aircraft.',
      };
    case 'W':
      return {
        color: 'yellow',
        description: 'Warning Area - Similar to restricted areas but located in international airspace.',
        caution: 'May contain hazards to nonparticipating aircraft. U.S. government has no jurisdiction to prohibit entry.',
      };
    case 'A':
      return {
        color: 'grape',
        description: 'Alert Area - High volume of pilot training or unusual aerial activity.',
        caution: 'All pilots are equally responsible for collision avoidance. Extra vigilance required.',
      };
    case 'D':
      return {
        color: 'pink',
        description: 'Danger Area - Airspace where activities dangerous to aircraft may exist.',
        caution: 'Not prohibited but use extreme caution. Often found on international charts.',
      };
    case 'TFR':
      return {
        color: 'red',
        description: 'Temporary Flight Restriction - Temporary airspace restriction for special events or emergencies.',
        caution: 'Check NOTAMs before every flight. Violations can result in enforcement action.',
      };
    default:
      return {
        color: 'orange',
        description: 'Special use airspace with restricted or hazardous activities.',
        caution: 'Check NOTAMs and contact ATC for current status.',
      };
  }
};

interface AirspaceAsideContentProps {
  airspace: AirspaceDto | SpecialUseAirspaceDto;
  onClose: () => void;
}

const AirspaceAsideContent: React.FC<AirspaceAsideContentProps> = ({ airspace, onClose }) => {
  const isSpecialUse = 'timesOfUse' in airspace;
  const typeCode = isSpecialUse ? (airspace as SpecialUseAirspaceDto).typeCode : undefined;
  const airspaceClass = airspace.class;

  const classInfo = !isSpecialUse ? getAirspaceClassInfo(airspaceClass) : null;
  const specialUseInfo = isSpecialUse ? getSpecialUseAirspaceInfo(typeCode) : null;

  const badgeColor = isSpecialUse ? (specialUseInfo?.color || 'orange') : (classInfo?.color || 'blue');

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <Box className={classes.flexGroup}>
            <Group gap="xs" mb={4}>
              <Badge color={badgeColor}>
                {isSpecialUse ? 'Special Use Airspace' : `Class ${airspaceClass}`}
              </Badge>
              {isSpecialUse && typeCode && (
                <Badge variant="outline" color={badgeColor}>
                  {typeCode}
                </Badge>
              )}
            </Group>
            <Text fw={600} lineClamp={2}>{airspace.name}</Text>
          </Box>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} className={classes.closeButton}>
            <FiX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Scrollable content */}
      <ScrollArea flex={1} scrollbarSize={6}>
        <Stack gap="xs" p="md">
          {/* Altitude Information */}
          <Box>
            <Text size="sm" fw={500} c="white" mb={4}>Altitude Limits</Text>
            <Group gap="lg">
              <Box>
                <Text size="xs" c="dimmed">Floor</Text>
                <Text size="sm" fw={500}>
                  {airspace.lowerVal || '0'} {airspace.lowerCode} {airspace.lowerUom || 'ft'}
                </Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Ceiling</Text>
                <Text size="sm" fw={500}>
                  {airspace.upperVal} {airspace.upperCode} {airspace.upperUom || 'ft'}
                </Text>
              </Box>
            </Group>
          </Box>

          {/* Times of Use (Special Use only) */}
          {isSpecialUse && (airspace as SpecialUseAirspaceDto).timesOfUse && (
            <Text size="sm">
              <Text span c="dimmed">Times of Use: </Text>
              {(airspace as SpecialUseAirspaceDto).timesOfUse}
            </Text>
          )}

          {/* Location */}
          {(airspace.city || airspace.state) && (
            <Text size="sm">
              <Text span c="dimmed">Location: </Text>
              {[airspace.city, airspace.state].filter(Boolean).join(', ')}
            </Text>
          )}

          {/* Contact Information */}
          {airspace.commName && (
            <Text size="sm">
              <Text span c="dimmed">Contact: </Text>
              {airspace.commName}
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
              {isSpecialUse ? specialUseInfo?.description : classInfo?.description}
            </Text>
            <Text size="xs" c={isSpecialUse ? 'yellow.5' : 'dimmed'} mt={4} fw={isSpecialUse ? 500 : 400}>
              {isSpecialUse ? specialUseInfo?.caution : classInfo?.requirements}
            </Text>
            <Text size="xs" c="dimmed" mt={6} fs="italic">
              Always consult the current FAR/AIM for complete and up-to-date airspace regulations.
            </Text>
          </Box>
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default AirspaceAsideContent;
