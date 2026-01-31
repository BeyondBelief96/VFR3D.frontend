import React from 'react';
import { useSelector } from 'react-redux';
import { AirportInfoPopup } from '@/features/Airports/InformationPopup';
import { WaypointInfoPopup } from '@/features/Flights';
import {
  AirportDto,
  AirsigmetDto,
  AirspaceDto,
  GAirmetDto,
  GAirmetHazardType,
  ObstacleDto,
  ObstacleLighting,
  ObstacleMarking,
  PirepDto,
  SpecialUseAirspaceDto,
  WaypointDto,
} from '@/redux/api/vfr3d/dtos';
import type { RootState } from '@/redux/store';
import { Paper, Stack, Text, Badge, Group, ActionIcon, Box, Code, ScrollArea, Divider } from '@mantine/core';
import { FiX, FiInfo } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import classes from './EntitySelectionManager.module.css';

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

// Enhanced popup for Airspace with educational content
const AirspaceInfoPopup: React.FC<{ airspace: AirspaceDto | SpecialUseAirspaceDto }> = ({ airspace }) => {
  const dispatch = useDispatch();
  const isSpecialUse = 'timesOfUse' in airspace;
  const typeCode = isSpecialUse ? (airspace as SpecialUseAirspaceDto).typeCode : undefined;
  const airspaceClass = airspace.class;

  const classInfo = !isSpecialUse ? getAirspaceClassInfo(airspaceClass) : null;
  const specialUseInfo = isSpecialUse ? getSpecialUseAirspaceInfo(typeCode) : null;

  const badgeColor = isSpecialUse ? (specialUseInfo?.color || 'orange') : (classInfo?.color || 'blue');

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  return (
    <Paper shadow="xl" radius="md" p="md" className={classes.popup}>
      <Group justify="space-between" wrap="nowrap" mb="md">
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
        <ActionIcon variant="subtle" color="gray" onClick={handleClose} className={classes.closeButton}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea mah={400}>
        <Stack gap="xs">
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
    <Paper shadow="xl" radius="md" p="md" className={classes.popup}>
      <Group justify="space-between" wrap="nowrap" mb="md">
        <Badge color="violet">PIREP</Badge>
        <ActionIcon variant="subtle" color="gray" onClick={handleClose} className={classes.closeButton}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      {/* Raw Text */}
      {pirep.rawText && (
        <Code block mb="md" className={classes.codeBlock}>
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

// Helper functions for obstacle display
const formatLighting = (lighting?: ObstacleLighting): string => {
  if (!lighting || lighting === ObstacleLighting.Unknown) return 'Unknown';
  switch (lighting) {
    case ObstacleLighting.Red:
      return 'Red';
    case ObstacleLighting.DualMediumWhiteStrobeRed:
      return 'Dual Medium White/Red Strobe';
    case ObstacleLighting.HighIntensityWhiteStrobeRed:
      return 'High Intensity White/Red Strobe';
    case ObstacleLighting.MediumIntensityWhiteStrobe:
      return 'Medium Intensity White Strobe';
    case ObstacleLighting.HighIntensityWhiteStrobe:
      return 'High Intensity White Strobe';
    case ObstacleLighting.Flood:
      return 'Flood';
    case ObstacleLighting.DualMediumCatenary:
      return 'Dual Medium Catenary';
    case ObstacleLighting.SynchronizedRedLighting:
      return 'Synchronized Red';
    case ObstacleLighting.Lighted:
      return 'Lighted';
    case ObstacleLighting.None:
      return 'None';
    default:
      return String(lighting);
  }
};

const formatMarking = (marking?: ObstacleMarking): string => {
  if (!marking || marking === ObstacleMarking.Unknown) return 'Unknown';
  switch (marking) {
    case ObstacleMarking.OrangeOrOrangeWhitePaint:
      return 'Orange/White Paint';
    case ObstacleMarking.WhitePaintOnly:
      return 'White Paint';
    case ObstacleMarking.Marked:
      return 'Marked';
    case ObstacleMarking.FlagMarker:
      return 'Flag Marker';
    case ObstacleMarking.SphericalMarker:
      return 'Spherical Marker';
    case ObstacleMarking.None:
      return 'None';
    default:
      return String(marking);
  }
};

// Simple popup for Obstacle
const ObstacleInfoPopup: React.FC<{ obstacle: ObstacleDto }> = ({ obstacle }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  const isLit =
    obstacle.lighting !== undefined &&
    obstacle.lighting !== ObstacleLighting.None &&
    obstacle.lighting !== ObstacleLighting.Unknown;

  return (
    <Paper shadow="xl" radius="md" p="md" className={classes.popup}>
      <Group justify="space-between" wrap="nowrap" mb="md">
        <Group gap="xs" className={classes.flexGroup}>
          <Badge color="red">Obstacle</Badge>
          {isLit && (
            <Badge color="yellow" variant="outline">
              Lit
            </Badge>
          )}
        </Group>
        <ActionIcon variant="subtle" color="gray" onClick={handleClose} className={classes.closeButton}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea mah={400}>
        <Stack gap="xs">
          {/* Type and Location */}
          {obstacle.obstacleType && (
            <Text size="sm">
              <Text span c="dimmed">Type: </Text>
              <Text span fw={500}>{obstacle.obstacleType}</Text>
            </Text>
          )}

          {obstacle.cityName && (
            <Text size="sm">
              <Text span c="dimmed">Location: </Text>
              {obstacle.cityName}, {obstacle.stateId}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Height Information */}
          <Text size="sm" fw={500} c="white">Height</Text>

          {obstacle.heightAgl !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">AGL: </Text>
              <Text span fw={500} c="orange">{obstacle.heightAgl.toLocaleString()} ft</Text>
            </Text>
          )}

          {obstacle.heightAmsl !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">MSL: </Text>
              {obstacle.heightAmsl.toLocaleString()} ft
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Lighting and Marking */}
          <Text size="sm" fw={500} c="white">Markings & Lighting</Text>

          <Text size="sm">
            <Text span c="dimmed">Lighting: </Text>
            {formatLighting(obstacle.lighting)}
          </Text>

          <Text size="sm">
            <Text span c="dimmed">Marking: </Text>
            {formatMarking(obstacle.marking)}
          </Text>

          {obstacle.quantity && obstacle.quantity > 1 && (
            <Text size="sm">
              <Text span c="dimmed">Quantity: </Text>
              {obstacle.quantity}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Coordinates */}
          <Text size="sm" fw={500} c="white">Position</Text>

          {obstacle.latitude !== undefined && obstacle.longitude !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Coordinates: </Text>
              {obstacle.latitude.toFixed(5)}, {obstacle.longitude.toFixed(5)}
            </Text>
          )}

          {/* OAS Number */}
          {obstacle.oasNumber && (
            <Text size="xs" c="dimmed" mt="xs">
              OAS Number: {obstacle.oasNumber}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

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

// Enhanced popup for AIRMET/SIGMET with educational content
const AirsigmetInfoPopup: React.FC<{ airsigmet: AirsigmetDto }> = ({ airsigmet }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  const hazardTypeStr = airsigmet.hazard?.type !== undefined
    ? String(airsigmet.hazard.type)
    : undefined;

  const isSigmet = airsigmet.airsigmetType === 'SIGMET';

  return (
    <Paper shadow="xl" radius="md" p="md" className={`${classes.popup} ${classes.popupWide}`}>
      <Group justify="space-between" wrap="nowrap" mb="md">
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
        <ActionIcon variant="subtle" color="gray" onClick={handleClose} className={classes.closeButton}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      {/* Raw Text */}
      {airsigmet.rawText && (
        <Code block mb="md" className={classes.codeBlock}>
          {airsigmet.rawText}
        </Code>
      )}

      <ScrollArea mah={350}>
        <Stack gap="xs">
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
              {airsigmet.movementDirDegrees !== undefined && `${airsigmet.movementDirDegrees}°`}
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
    </Paper>
  );
};

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
        description: 'Height of the 0°C isotherm (freezing level).',
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
    // SIERRA hazards
    case GAirmetHazardType.MT_OBSC:
      return 'gray';
    case GAirmetHazardType.IFR:
      return 'green';
    // TANGO hazards
    case GAirmetHazardType.TURB_LO:
      return 'orange';
    case GAirmetHazardType.TURB_HI:
      return 'red';
    case GAirmetHazardType.LLWS:
      return 'yellow';
    case GAirmetHazardType.SFC_WIND:
      return 'violet';
    // ZULU hazards
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

// G-AIRMET Info Popup with educational content
const GAirmetInfoPopup: React.FC<{ gairmet: GAirmetDto }> = ({ gairmet }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  const hazardInfo = getGAirmetHazardDescription(gairmet.hazard);
  const hazardColor = getGAirmetHazardColor(gairmet.hazard);

  return (
    <Paper shadow="xl" radius="md" p="md" className={`${classes.popup} ${classes.popupWide}`}>
      <Group justify="space-between" wrap="nowrap" mb="md">
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
        <ActionIcon variant="subtle" color="gray" onClick={handleClose} className={classes.closeButton}>
          <FiX size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea mah={400}>
        <Stack gap="xs">
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
                // Helper to format altitude value for display
                const formatAltitude = (value: string | undefined, isFzl: boolean = false): string => {
                  if (!value) return isFzl ? 'Unknown' : 'SFC';
                  const upper = value.toUpperCase();
                  if (upper.startsWith('SFC')) return 'Surface';
                  if (upper === 'FZL') return 'Freezing Level';
                  const num = parseFloat(value);
                  return isNaN(num) ? value : `${num.toLocaleString()} ft`;
                };

                // Check if min altitude references freezing level
                const minIsFzl = alt.minFtMsl?.toUpperCase() === 'FZL';
                const maxIsFzl = alt.maxFtMsl?.toUpperCase() === 'FZL';

                return (
                  <Box key={idx} pl="sm">
                    {/* Single level altitude (e.g., FZLVL hazard) */}
                    {alt.levelFtMsl && !alt.minFtMsl && !alt.maxFtMsl && (
                      <Text size="sm">
                        {formatAltitude(alt.levelFtMsl)} MSL
                      </Text>
                    )}
                    {/* Min/Max altitude range */}
                    {(alt.minFtMsl || alt.maxFtMsl) && (
                      <Text size="sm">
                        {minIsFzl ? 'Freezing Level' : formatAltitude(alt.minFtMsl)}
                        {' - '}
                        {maxIsFzl ? 'Freezing Level' : formatAltitude(alt.maxFtMsl)} MSL
                      </Text>
                    )}
                    {/* Freezing level altitude info (when min/max references FZL) */}
                    {alt.fzlAltitude && (minIsFzl || maxIsFzl) && (
                      <Text size="xs" c="cyan.4" pl="sm">
                        (Freezing level: {formatAltitude(alt.fzlAltitude.minFtMsl, true)}
                        {alt.fzlAltitude.maxFtMsl && ` - ${formatAltitude(alt.fzlAltitude.maxFtMsl, true)}`} MSL)
                      </Text>
                    )}
                    {/* Standalone freezing level info (not referenced by min/max) */}
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
              <FiInfo size={12} color="var(--mantine-color-blue-5)" />
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
    case 'GAirmet':
      return <GAirmetInfoPopup gairmet={selectedEntity as GAirmetDto} />;
    case 'Waypoint':
      return <WaypointInfoPopup selectedWaypoint={selectedEntity as WaypointDto} />;
    case 'Obstacle':
      return <ObstacleInfoPopup obstacle={selectedEntity as ObstacleDto} />;
    default:
      return null;
  }
};

export default EntitySelectionManager;
