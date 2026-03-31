import React, { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Box,
  Badge,
  ActionIcon,
  Collapse,
  Button,
  Paper,
  SimpleGrid,
  Modal,
  Alert,
} from '@mantine/core';
import { notifyError, notifySuccess } from '@/utility/notifications';
import { Link } from '@tanstack/react-router';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPlus, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { BUTTON_COLORS, ACTION_ICON_COLORS } from '@/constants/colors';
import { SURFACE, SURFACE_INNER, BORDER, ICON_BG, THEME_COLORS, MODAL_STYLES } from '@/constants/surfaces';
import { FaPlane, FaBalanceScale } from 'react-icons/fa';
import { AircraftDto, AircraftCategory, AircraftPerformanceProfileDto, WeightBalanceProfileDto } from '@/redux/api/vfr3d/dtos';
import { useDeleteAircraftPerformanceProfileMutation } from '@/redux/api/vfr3d/performanceProfiles.api';
import { getAirspeedUnitLabel } from '@/utility/unitConversionUtils';
import { useGetWeightBalanceProfilesForAircraftQuery } from '@/redux/api/vfr3d/weightBalance.api';
import { useAuth0 } from '@auth0/auth0-react';
import { useIsPhone, useIsTablet } from '@/hooks';
import { PerformanceProfileDrawerForm } from '@/features/Flights/FlightPlanningDrawer/PerformanceProfiles/PerformanceProfileDrawerForm';
import { AircraftDocumentsSection } from './AircraftDocuments';

interface AircraftCardProps {
  aircraft: AircraftDto;
  onEdit: (aircraft: AircraftDto) => void;
  onDelete: (aircraftId: string) => void;
  isDeleting: boolean;
}

const getCategoryLabel = (category?: AircraftCategory): string => {
  switch (category) {
    case AircraftCategory.SingleEngine:
      return 'Single Engine';
    case AircraftCategory.MultiEngine:
      return 'Multi Engine';
    case AircraftCategory.Helicopter:
      return 'Helicopter';
    case AircraftCategory.Glider:
      return 'Glider';
    case AircraftCategory.Balloon:
      return 'Balloon';
    case AircraftCategory.Ultralight:
      return 'Ultralight';
    case AircraftCategory.LightSport:
      return 'Light Sport';
    case AircraftCategory.Gyroplane:
      return 'Gyroplane';
    default:
      return 'Unknown';
  }
};

export const AircraftCard: React.FC<AircraftCardProps> = ({
  aircraft,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const { user } = useAuth0();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [expanded, setExpanded] = useState(false);
  const [wbExpanded, setWbExpanded] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AircraftPerformanceProfileDto | null>(null);
  const [profileFormMode, setProfileFormMode] = useState<'create' | 'edit'>('create');
  const [deleteProfileModalOpen, setDeleteProfileModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const [deleteProfile, { isLoading: isDeletingProfile }] = useDeleteAircraftPerformanceProfileMutation();

  // Fetch W&B profiles for this aircraft
  const { data: wbProfiles = [] } = useGetWeightBalanceProfilesForAircraftQuery(
    { userId, aircraftId: aircraft.id || '' },
    { skip: !userId || !aircraft.id }
  );

  const profiles = aircraft.performanceProfiles || [];
  const profileCount = profiles.length;

  const handleAddProfile = () => {
    setEditingProfile(null);
    setProfileFormMode('create');
    setProfileModalOpen(true);
  };

  const handleEditProfile = (profile: AircraftPerformanceProfileDto) => {
    setEditingProfile(profile);
    setProfileFormMode('edit');
    setProfileModalOpen(true);
  };

  const handleDeleteProfileClick = (profileId: string) => {
    setProfileToDelete(profileId);
    setDeleteProfileModalOpen(true);
  };

  // Get the profile being deleted for display
  const profileBeingDeleted = profileToDelete
    ? profiles.find((p) => p.id === profileToDelete)
    : null;

  const handleDeleteProfileConfirm = async () => {
    if (!profileToDelete || !userId) return;

    try {
      await deleteProfile({ userId, aircraftPerformanceProfileId: profileToDelete }).unwrap();
      notifySuccess('Profile Deleted', 'The performance profile has been deleted.');
    } catch (error) {
      notifyError({ error, operation: 'delete profile' });
    } finally {
      setDeleteProfileModalOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleProfileFormSuccess = () => {
    setProfileModalOpen(false);
    setEditingProfile(null);
    notifySuccess(
      profileFormMode === 'create' ? 'Profile Created' : 'Profile Updated',
      profileFormMode === 'create'
        ? 'Your new performance profile has been created.'
        : 'Your performance profile has been updated.'
    );
  };

  return (
    <>
      <Card
        padding={isPhone ? 'md' : 'lg'}
        radius="md"
        style={{
          backgroundColor: SURFACE.CARD,
          border: `1px solid ${BORDER.CARD}`,
          transition: 'all 0.2s ease',
        }}
      >
        <Stack gap={isPhone ? 'sm' : 'md'}>
          {/* Header */}
          <Group justify="space-between" wrap="nowrap" gap={isPhone ? 'xs' : 'sm'}>
            <Group gap={isPhone ? 'xs' : 'sm'} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <Box
                style={{
                  width: isPhone ? 40 : 48,
                  height: isPhone ? 40 : 48,
                  minWidth: isPhone ? 40 : 48,
                  borderRadius: '50%',
                  backgroundColor: ICON_BG.BLUE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaPlane size={isPhone ? 16 : 20} color={THEME_COLORS.PRIMARY} />
              </Box>
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Text c="white" fw={600} size={isPhone ? 'md' : 'lg'} lineClamp={1}>
                  {aircraft.aircraftType || 'Unnamed Aircraft'}
                </Text>
                {aircraft.tailNumber && (
                  <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
                    {aircraft.tailNumber}
                  </Text>
                )}
              </Box>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <ActionIcon
                variant="light"
                color={ACTION_ICON_COLORS.EDIT}
                size={isPhone ? 'xl' : 'lg'}
                onClick={() => onEdit(aircraft)}
              >
                <FiEdit2 size={isPhone ? 20 : 18} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color={ACTION_ICON_COLORS.DELETE}
                size={isPhone ? 'xl' : 'lg'}
                onClick={() => aircraft.id && onDelete(aircraft.id)}
                loading={isDeleting}
              >
                <FiTrash2 size={isPhone ? 20 : 18} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Category Badge */}
          {aircraft.category && (
            <Badge size={isPhone ? 'xs' : 'sm'} variant="light" color="blue">
              {getCategoryLabel(aircraft.category)}
            </Badge>
          )}

          {/* Profiles Expandable Section */}
          <Box>
            <Button
              variant="subtle"
              color="gray"
              size={isPhone ? 'xs' : 'sm'}
              fullWidth
              justify="space-between"
              rightSection={expanded ? <FiChevronUp size={isPhone ? 14 : 16} /> : <FiChevronDown size={isPhone ? 14 : 16} />}
              onClick={() => setExpanded(!expanded)}
              styles={{
                root: {
                  backgroundColor: SURFACE_INNER.DEFAULT,
                  padding: isPhone ? '8px 12px' : undefined,
                  '&:hover': {
                    backgroundColor: SURFACE.INPUT,
                  },
                },
              }}
            >
              <Text size={isPhone ? 'xs' : 'sm'} c="white">
                Performance Profiles ({profileCount})
              </Text>
            </Button>

            <Collapse in={expanded}>
              <Stack gap={isPhone ? 'xs' : 'sm'} mt={isPhone ? 'xs' : 'sm'}>
                {profiles.length === 0 ? (
                  <Text size={isPhone ? 'xs' : 'sm'} c="dimmed" ta="center" py={isPhone ? 'sm' : 'md'}>
                    No performance profiles configured
                  </Text>
                ) : (
                  <SimpleGrid cols={1} spacing="xs">
                    {profiles.map((profile) => (
                      <Paper
                        key={profile.id}
                        p={isPhone ? 'xs' : 'sm'}
                        style={{
                          backgroundColor: SURFACE_INNER.DEFAULT,
                          borderRadius: 'var(--mantine-radius-md)',
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap" gap={isPhone ? 'xs' : 'sm'}>
                          <Box style={{ minWidth: 0, flex: 1 }}>
                            <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white" lineClamp={1}>
                              {profile.profileName}
                            </Text>
                            <Group gap="xs" mt={isPhone ? 2 : 4}>
                              <Text size="xs" c="dimmed">
                                {profile.cruiseTrueAirspeed} {getAirspeedUnitLabel(aircraft.airspeedUnits)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {profile.cruiseFuelBurn} gph
                              </Text>
                            </Group>
                          </Box>
                          <Group gap="sm" wrap="nowrap">
                            <ActionIcon
                              size={isPhone ? 'xl' : 'lg'}
                              variant="light"
                              color={ACTION_ICON_COLORS.EDIT}
                              onClick={() => handleEditProfile(profile)}
                            >
                              <FiEdit2 size={isPhone ? 20 : 18} />
                            </ActionIcon>
                            <ActionIcon
                              size={isPhone ? 'xl' : 'lg'}
                              variant="light"
                              color={ACTION_ICON_COLORS.DELETE}
                              onClick={() => profile.id && handleDeleteProfileClick(profile.id)}
                              loading={isDeletingProfile && profileToDelete === profile.id}
                            >
                              <FiTrash2 size={isPhone ? 20 : 18} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}

                <Button
                  variant="light"
                  color={ACTION_ICON_COLORS.ADD}
                  size="xs"
                  leftSection={<FiPlus size={isPhone ? 12 : 14} />}
                  onClick={handleAddProfile}
                  fullWidth={isPhone}
                >
                  Add Profile
                </Button>
              </Stack>
            </Collapse>
          </Box>

          {/* Weight & Balance Section */}
          <Box>
            <Button
              variant="subtle"
              color="gray"
              size={isPhone ? 'xs' : 'sm'}
              fullWidth
              justify="space-between"
              rightSection={wbExpanded ? <FiChevronUp size={isPhone ? 14 : 16} /> : <FiChevronDown size={isPhone ? 14 : 16} />}
              onClick={() => setWbExpanded(!wbExpanded)}
              styles={{
                root: {
                  backgroundColor: SURFACE_INNER.DEFAULT,
                  padding: isPhone ? '8px 12px' : undefined,
                  '&:hover': {
                    backgroundColor: SURFACE.INPUT,
                  },
                },
              }}
            >
              <Group gap="xs">
                <FaBalanceScale size={isPhone ? 12 : 14} />
                <Text size={isPhone ? 'xs' : 'sm'} c="white">
                  Weight & Balance ({wbProfiles.length})
                </Text>
              </Group>
            </Button>

            <Collapse in={wbExpanded}>
              <Stack gap={isPhone ? 'xs' : 'sm'} mt={isPhone ? 'xs' : 'sm'}>
                {wbProfiles.length === 0 ? (
                  <Text size={isPhone ? 'xs' : 'sm'} c="dimmed" ta="center" py={isPhone ? 'sm' : 'md'}>
                    No weight & balance profiles configured
                  </Text>
                ) : (
                  <SimpleGrid cols={1} spacing="xs">
                    {wbProfiles.map((profile: WeightBalanceProfileDto) => (
                      <Paper
                        key={profile.id}
                        p={isPhone ? 'xs' : 'sm'}
                        style={{
                          backgroundColor: SURFACE_INNER.DEFAULT,
                          borderRadius: 'var(--mantine-radius-md)',
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Box style={{ minWidth: 0, flex: 1 }}>
                            <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white" lineClamp={1}>
                              {profile.profileName || 'Unnamed Profile'}
                            </Text>
                            <Group gap="xs" mt={isPhone ? 2 : 4} wrap={isPhone ? 'wrap' : 'nowrap'}>
                              <Text size="xs" c="dimmed">
                                {profile.emptyWeight?.toLocaleString()} lbs empty
                              </Text>
                              <Text size="xs" c="dimmed">
                                {profile.maxTakeoffWeight?.toLocaleString()} lbs MTOW
                              </Text>
                            </Group>
                          </Box>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}

                <Button
                  variant="filled"
                  color={BUTTON_COLORS.PRIMARY}
                  component={Link}
                  to="/weight-balance"
                  size="xs"
                  leftSection={<FiExternalLink size={isPhone ? 12 : 14} />}
                  fullWidth={isPhone}
                >
                  Manage W&B Profiles
                </Button>
              </Stack>
            </Collapse>
          </Box>

          {/* Documents Section */}
          {aircraft.id && userId && (
            <AircraftDocumentsSection
              userId={userId}
              aircraftId={aircraft.id}
              expanded={docsExpanded}
              onToggle={() => setDocsExpanded(!docsExpanded)}
            />
          )}
        </Stack>
      </Card>

      {/* Profile Create/Edit Modal */}
      <Modal
        opened={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={profileFormMode === 'create' ? 'Create Performance Profile' : 'Edit Performance Profile'}
        centered
        size={isPhone ? '100%' : isTablet ? 'xl' : 'lg'}
        fullScreen={isPhone}
        styles={{
          header: {
            ...MODAL_STYLES.header,
            padding: isPhone ? '12px 16px' : '16px 20px',
          },
          title: {
            fontWeight: 600,
            color: 'white',
            fontSize: isPhone ? '1rem' : undefined,
          },
          body: {
            ...MODAL_STYLES.body,
            padding: isPhone ? '16px' : '20px',
            maxHeight: isPhone ? undefined : 'calc(100vh - 200px)',
            overflowY: 'auto',
          },
          content: MODAL_STYLES.content,
          close: MODAL_STYLES.close,
        }}
      >
        <PerformanceProfileDrawerForm
          mode={profileFormMode}
          existingProfile={editingProfile}
          aircraftId={aircraft.id}
          airspeedUnits={aircraft.airspeedUnits}
          onCancel={() => setProfileModalOpen(false)}
          onSuccess={handleProfileFormSuccess}
          isModal
        />
      </Modal>

      {/* Delete Profile Confirmation Modal */}
      <Modal
        opened={deleteProfileModalOpen}
        onClose={() => setDeleteProfileModalOpen(false)}
        title="Delete Performance Profile"
        centered
        size={isPhone ? '100%' : isTablet ? 'lg' : 'md'}
        fullScreen={isPhone}
        styles={{
          header: {
            ...MODAL_STYLES.header,
            padding: isPhone ? '12px 16px' : '16px 20px',
          },
          title: {
            fontWeight: 600,
            color: 'white',
            fontSize: isPhone ? '1rem' : undefined,
          },
          body: {
            ...MODAL_STYLES.body,
            padding: isPhone ? '16px' : '20px',
          },
          content: MODAL_STYLES.content,
          close: MODAL_STYLES.close,
        }}
      >
        <Stack gap={isPhone ? 'sm' : 'md'}>
          {profileBeingDeleted && (
            <Box
              p={isPhone ? 'sm' : 'md'}
              style={{
                backgroundColor: SURFACE_INNER.DEFAULT,
                borderRadius: 'var(--mantine-radius-md)',
                border: `1px solid ${BORDER.SUBTLE}`,
              }}
            >
              <Text c="white" fw={600} size={isPhone ? 'sm' : 'md'}>
                {profileBeingDeleted.profileName || 'Unnamed Profile'}
              </Text>
              <Group gap="xs" mt={4} wrap="wrap">
                <Badge size="xs" variant="light" color="blue">
                  {profileBeingDeleted.cruiseTrueAirspeed} {getAirspeedUnitLabel(aircraft.airspeedUnits)}
                </Badge>
                <Badge size="xs" variant="light" color="cyan">
                  {profileBeingDeleted.cruiseFuelBurn} gph
                </Badge>
              </Group>
            </Box>
          )}

          <Alert
            color="orange"
            variant="light"
            icon={<FiAlertTriangle size={isPhone ? 14 : 16} />}
          >
            <Text size={isPhone ? 'xs' : 'sm'}>
              Flights using this profile will no longer have performance data associated with them.
              You may need to assign a new profile to those flights.
            </Text>
          </Alert>

          <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
            This action cannot be undone.
          </Text>

          <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone}>
            <Button
              variant="subtle"
              color={BUTTON_COLORS.SECONDARY}
              onClick={() => setDeleteProfileModalOpen(false)}
              size={isPhone ? 'sm' : 'md'}
            >
              Cancel
            </Button>
            <Button
              variant="light"
              color={BUTTON_COLORS.DESTRUCTIVE}
              onClick={handleDeleteProfileConfirm}
              loading={isDeletingProfile}
              size={isPhone ? 'sm' : 'md'}
            >
              Delete Profile
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AircraftCard;
