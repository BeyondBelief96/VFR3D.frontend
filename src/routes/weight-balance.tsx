import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Center,
  Loader,
  Stack,
  Card,
  Group,
  Button,
  SimpleGrid,
  Box,
  Accordion,
  ThemeIcon,
  Badge,
  Modal,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiPlus, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { FaBalanceScale, FaPlane } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useIsPhone, useIsTablet } from '@/hooks';
import {
  useGetWeightBalanceProfilesQuery,
  useDeleteWeightBalanceProfileMutation,
  useGetLatestStandaloneStateQuery,
} from '@/redux/api/vfr3d/weightBalance.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { WeightBalanceProfileDto, AircraftDto } from '@/redux/api/vfr3d/dtos';
import {
  WeightBalanceProfileCard,
  WeightBalanceCalculator,
} from '@/features/WeightBalance';
import { WeightBalanceWizard } from '@/features/WeightBalance/components/wizard/WeightBalanceWizard';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';
import { SURFACE, SURFACE_INNER, BORDER, ICON_BG, MODAL_STYLES, THEME_COLORS } from '@/constants/surfaces';

export const Route = createFileRoute('/weight-balance')({
  component: WeightBalancePage,
});

function WeightBalancePage() {
  return (
    <ProtectedRoute>
      <WeightBalanceContent />
    </ProtectedRoute>
  );
}

type ViewMode = 'list' | 'create' | 'edit' | 'calculator';

function WeightBalanceContent() {
  const { user } = useAuth0();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProfile, setEditingProfile] = useState<WeightBalanceProfileDto | null>(null);
  const [selectedProfileForCalc, setSelectedProfileForCalc] = useState<string | undefined>(undefined);
  const [selectedAircraftForCalc, setSelectedAircraftForCalc] = useState<string | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const { data: profiles = [], isLoading, isError, isFetching, refetch } = useGetWeightBalanceProfilesQuery(
    userId,
    { skip: !userId }
  );

  const { data: aircraft = [] } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  // Fetch the latest standalone calculation state for form repopulation
  const { data: standaloneState } = useGetLatestStandaloneStateQuery(userId, {
    skip: !userId,
  });

  const [deleteProfile, { isLoading: isDeleting }] = useDeleteWeightBalanceProfileMutation();

  // Group profiles by aircraft
  const profilesByAircraft = useMemo(() => {
    const grouped: Map<string | undefined, { aircraft: AircraftDto | null; profiles: WeightBalanceProfileDto[] }> = new Map();

    // Create groups for each aircraft
    aircraft.forEach((a) => {
      grouped.set(a.id, { aircraft: a, profiles: [] });
    });

    // Add "No Aircraft" group
    grouped.set(undefined, { aircraft: null, profiles: [] });

    // Assign profiles to groups
    profiles.forEach((profile) => {
      const group = grouped.get(profile.aircraftId) || grouped.get(undefined)!;
      group.profiles.push(profile);
    });

    // Convert to array and filter out empty groups
    return Array.from(grouped.entries())
      .filter(([_, value]) => value.profiles.length > 0)
      .sort((a, b) => {
        // Put aircraft with profiles first, "No Aircraft" last
        if (!a[1].aircraft && b[1].aircraft) return 1;
        if (a[1].aircraft && !b[1].aircraft) return -1;
        return (a[1].aircraft?.tailNumber || '').localeCompare(b[1].aircraft?.tailNumber || '');
      });
  }, [profiles, aircraft]);

  // Get the profile being deleted for display purposes
  const profileBeingDeleted = useMemo(() => {
    if (!profileToDelete || !profiles) return null;
    return profiles.find((p) => p.id === profileToDelete);
  }, [profileToDelete, profiles]);

  // Get the aircraft for the profile being deleted
  const aircraftForDeletedProfile = useMemo(() => {
    if (!profileBeingDeleted?.aircraftId || !aircraft) return null;
    return aircraft.find((a) => a.id === profileBeingDeleted.aircraftId);
  }, [profileBeingDeleted, aircraft]);

  const handleCreateClick = () => {
    setEditingProfile(null);
    setViewMode('create');
  };

  const handleEditClick = (profile: WeightBalanceProfileDto) => {
    setEditingProfile(profile);
    setViewMode('edit');
  };

  const handleDeleteClick = (profileId: string) => {
    setProfileToDelete(profileId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete || !userId) return;

    try {
      await deleteProfile({ userId, profileId: profileToDelete }).unwrap();
      notifications.show({
        title: 'Profile Deleted',
        message: 'The weight & balance profile has been deleted.',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setProfileToDelete(null);
    } catch (_error: unknown) {
      notifications.show({
        title: 'Delete Failed',
        message: 'Unable to delete the profile. Please try again.',
        color: 'red',
      });
      setDeleteModalOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleCalculateClick = (profile: WeightBalanceProfileDto) => {
    setSelectedProfileForCalc(profile.id);
    setSelectedAircraftForCalc(profile.aircraftId);
    setViewMode('calculator');
  };

  const handleFormSuccess = () => {
    notifications.show({
      title: viewMode === 'create' ? 'Profile Created' : 'Profile Updated',
      message:
        viewMode === 'create'
          ? 'Your new weight & balance profile has been created.'
          : 'Your weight & balance profile has been updated.',
      color: 'green',
    });
    setViewMode('list');
    setEditingProfile(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingProfile(null);
    setSelectedProfileForCalc(undefined);
    setSelectedAircraftForCalc(undefined);
  };

  // Render wizard view (create or edit)
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <Container
        size="xl"
        py={isPhone ? 'md' : 'xl'}
        px={isPhone ? 'sm' : undefined}
        style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: THEME_COLORS.SURFACE_9 }}
      >
        <Stack gap={isPhone ? 'md' : 'lg'}>
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="sm" wrap={isPhone ? 'wrap' : 'nowrap'}>
              <Button
                variant="subtle"
                color={BUTTON_COLORS.BACK}
                leftSection={<FiArrowLeft size={isPhone ? 14 : 16} />}
                onClick={handleCancel}
                size={isPhone ? 'sm' : 'md'}
              >
                Back
              </Button>
              <Title order={isPhone ? 3 : 2} c="white">
                {viewMode === 'create' ? 'Create W&B Profile' : 'Edit W&B Profile'}
              </Title>
            </Group>
          </Group>

          <WeightBalanceWizard
            mode={viewMode === 'create' ? 'create' : 'edit'}
            existingProfile={editingProfile}
            onCancel={handleCancel}
            onSuccess={handleFormSuccess}
          />
        </Stack>
      </Container>
    );
  }

  // Render calculator view
  if (viewMode === 'calculator') {
    return (
      <Container
        size="xl"
        py={isPhone ? 'md' : 'xl'}
        px={isPhone ? 'sm' : undefined}
        style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: THEME_COLORS.SURFACE_9 }}
      >
        <Stack gap={isPhone ? 'md' : 'lg'}>
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              color={BUTTON_COLORS.BACK}
              leftSection={<FiArrowLeft size={isPhone ? 14 : 16} />}
              onClick={handleCancel}
              size={isPhone ? 'sm' : 'md'}
            >
              {isPhone ? 'Back' : 'Back to Profiles'}
            </Button>
          </Group>

          <Card
            padding={isPhone ? 'sm' : 'xl'}
            radius="md"
            style={{
              backgroundColor: SURFACE.CARD,
              border: `1px solid ${BORDER.SUBTLE}`,
            }}
          >
            <WeightBalanceCalculator
              preselectedProfileId={selectedProfileForCalc}
              preselectedAircraftId={selectedAircraftForCalc}
              standaloneState={standaloneState}
              persistCalculations
              compact={isPhone}
            />
          </Card>
        </Stack>
      </Container>
    );
  }

  // Render list view (default)
  return (
    <Container
      size="xl"
      py={isPhone ? 'md' : 'xl'}
      px={isPhone ? 'sm' : undefined}
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: THEME_COLORS.SURFACE_9 }}
    >
      <Stack gap={isPhone ? 'md' : 'lg'}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap={isPhone ? 'xs' : 'md'}>
          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            {!isPhone && (
              <ThemeIcon size="xl" radius="md" variant="gradient" gradient={BUTTON_GRADIENTS.PRIMARY}>
                <FaBalanceScale size={24} />
              </ThemeIcon>
            )}
            <Box>
              <Title order={isPhone ? 2 : 1} c="white">
                Weight & Balance
              </Title>
              {!isPhone && (
                <Text size="sm" c="dimmed">
                  Manage your W&B profiles and calculate for your flights
                </Text>
              )}
            </Box>
          </Group>
          <Group gap={isPhone ? 'xs' : 'sm'} wrap="wrap" grow={isPhone} style={isPhone ? { width: '100%' } : undefined}>
            <Button
              variant="gradient"
              gradient={BUTTON_GRADIENTS.PRIMARY}
              size={isPhone ? 'sm' : 'md'}
              leftSection={<FaBalanceScale size={isPhone ? 12 : 14} />}
              onClick={() => {
                setSelectedProfileForCalc(undefined);
                setSelectedAircraftForCalc(undefined);
                setViewMode('calculator');
              }}
            >
              {isPhone ? 'Calculator' : 'Open Calculator'}
            </Button>
            <Button
              leftSection={<FiPlus size={isPhone ? 14 : 16} />}
              size={isPhone ? 'sm' : 'md'}
              variant="gradient"
              gradient={BUTTON_GRADIENTS.PRIMARY}
              onClick={handleCreateClick}
            >
              New Profile
            </Button>
          </Group>
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" color="blue" />
          </Center>
        )}

        {isError && (
          <PageErrorState
            title="Unable to Load Profiles"
            message="We couldn't load your weight & balance profiles. This might be a temporary issue with our servers."
            onRetry={() => refetch()}
            isRetrying={isFetching}
            fullPage={false}
          />
        )}

        {!isLoading && !isError && profiles.length === 0 && (
          <Card
            padding={isPhone ? 'md' : 'xl'}
            radius="md"
            style={{
              backgroundColor: SURFACE.CARD,
              border: `1px solid ${BORDER.SUBTLE}`,
            }}
          >
            <Stack align="center" gap={isPhone ? 'md' : 'lg'} py={isPhone ? 'md' : 'xl'}>
              <Box
                style={{
                  width: isPhone ? 64 : 80,
                  height: isPhone ? 64 : 80,
                  borderRadius: '50%',
                  backgroundColor: ICON_BG.BLUE_LIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaBalanceScale size={isPhone ? 24 : 32} style={{ opacity: 0.5, color: THEME_COLORS.PRIMARY }} />
              </Box>
              <Text c="white" size={isPhone ? 'md' : 'lg'} fw={500}>
                No Weight & Balance Profiles
              </Text>
              <Text c="dimmed" ta="center" maw={400} size={isPhone ? 'sm' : 'md'} px={isPhone ? 'xs' : undefined}>
                Create a weight & balance profile for your aircraft to calculate takeoff and
                landing weights, and verify CG is within limits.
              </Text>
              <Button
                variant="gradient"
                gradient={BUTTON_GRADIENTS.PRIMARY}
                onClick={handleCreateClick}
                leftSection={<FiPlus />}
                size={isPhone ? 'sm' : 'md'}
                fullWidth={isPhone}
              >
                Create Your First Profile
              </Button>
            </Stack>
          </Card>
        )}

        {/* Profiles grouped by aircraft */}
        {profilesByAircraft.length > 0 && (
          <Accordion
            variant="separated"
            defaultValue={profilesByAircraft.map(([id]) => id || 'no-aircraft')}
            multiple
            styles={{
              item: {
                backgroundColor: SURFACE.CARD,
                border: `1px solid ${BORDER.SUBTLE}`,
                borderRadius: 'var(--mantine-radius-md)',
                '&[data-active]': {
                  backgroundColor: SURFACE.INSET,
                },
              },
              control: {
                padding: isPhone ? 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)' : undefined,
                '&:hover': {
                  backgroundColor: BORDER.MINIMAL,
                },
              },
              chevron: {
                color: THEME_COLORS.TEXT_MUTED,
              },
              content: {
                padding: isPhone ? 'var(--mantine-spacing-xs)' : undefined,
              },
            }}
          >
            {profilesByAircraft.map(([aircraftId, { aircraft: aircraftData, profiles: aircraftProfiles }]) => (
              <Accordion.Item key={aircraftId || 'no-aircraft'} value={aircraftId || 'no-aircraft'}>
                <Accordion.Control>
                  <Group gap={isPhone ? 'xs' : 'md'} wrap="nowrap">
                    <ThemeIcon
                      size={isPhone ? 'sm' : 'md'}
                      variant="light"
                      color={aircraftData ? 'blue' : 'gray'}
                    >
                      <FaPlane size={isPhone ? 12 : 14} />
                    </ThemeIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text c="white" fw={500} size={isPhone ? 'sm' : 'md'} lineClamp={1}>
                        {aircraftData
                          ? `${aircraftData.tailNumber || 'N/A'} - ${aircraftData.aircraftType || 'Unknown'}`
                          : 'No Aircraft Assigned'}
                      </Text>
                      {aircraftData?.callSign && !isPhone && (
                        <Text size="xs" c="dimmed">
                          Call Sign: {aircraftData.callSign}
                        </Text>
                      )}
                    </Box>
                    <Badge size={isPhone ? 'xs' : 'sm'} variant="light" color={aircraftData ? 'blue' : 'gray'}>
                      {aircraftProfiles.length} profile{aircraftProfiles.length !== 1 ? 's' : ''}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing={isPhone ? 'xs' : 'md'}>
                    {aircraftProfiles.map((profile) => (
                      <WeightBalanceProfileCard
                        key={profile.id}
                        profile={profile}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onCalculate={handleCalculateClick}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </SimpleGrid>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete W&B Profile"
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
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon size={isPhone ? 'md' : 'lg'} radius="xl" color="blue" variant="light">
                  <FaBalanceScale size={isPhone ? 14 : 16} />
                </ThemeIcon>
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Text c="white" fw={600} size={isPhone ? 'sm' : 'md'} lineClamp={1}>
                    {profileBeingDeleted.profileName || 'Unnamed Profile'}
                  </Text>
                  {aircraftForDeletedProfile && (
                    <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
                      {aircraftForDeletedProfile.tailNumber} - {aircraftForDeletedProfile.aircraftType}
                    </Text>
                  )}
                </Box>
              </Group>
            </Box>
          )}

          <Alert
            color="orange"
            variant="light"
            icon={<FiAlertTriangle size={isPhone ? 16 : 18} />}
            title="This action will permanently delete:"
            styles={{
              title: { fontSize: isPhone ? '0.875rem' : undefined },
            }}
          >
            <Text size={isPhone ? 'xs' : 'sm'} c="orange.3">
              This weight & balance profile and all its configuration data including loading stations and CG envelopes.
            </Text>
          </Alert>

          <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
            This action cannot be undone.
          </Text>

          <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone}>
            <Button
              variant="subtle"
              color={BUTTON_COLORS.SECONDARY}
              onClick={() => setDeleteModalOpen(false)}
              size={isPhone ? 'sm' : 'md'}
            >
              Cancel
            </Button>
            <Button
              color={BUTTON_COLORS.DESTRUCTIVE}
              onClick={handleDeleteConfirm}
              loading={isDeleting}
              size={isPhone ? 'sm' : 'md'}
            >
              Delete Profile
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
