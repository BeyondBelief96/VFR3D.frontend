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
import { ProtectedRoute, useAuth } from '@/components/Auth';
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
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProfile, setEditingProfile] = useState<WeightBalanceProfileDto | null>(null);
  const [selectedProfileForCalc, setSelectedProfileForCalc] = useState<string | undefined>(undefined);
  const [selectedAircraftForCalc, setSelectedAircraftForCalc] = useState<string | undefined>(undefined);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const { data: profiles = [], isLoading, isError, refetch } = useGetWeightBalanceProfilesQuery(
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
    } catch (error: any) {
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
        py="xl"
        style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<FiArrowLeft size={16} />}
                onClick={handleCancel}
              >
                Back
              </Button>
              <Title order={2} c="white">
                {viewMode === 'create' ? 'Create Weight & Balance Profile' : 'Edit Weight & Balance Profile'}
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
        py="xl"
        style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<FiArrowLeft size={16} />}
              onClick={handleCancel}
            >
              Back to Profiles
            </Button>
          </Group>

          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <WeightBalanceCalculator
              preselectedProfileId={selectedProfileForCalc}
              preselectedAircraftId={selectedAircraftForCalc}
              standaloneState={standaloneState}
              persistCalculations
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
      py="xl"
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }}>
              <FaBalanceScale size={24} />
            </ThemeIcon>
            <Box>
              <Title order={1} c="white">
                Weight & Balance
              </Title>
              <Text size="sm" c="dimmed">
                Manage your W&B profiles and calculate for your flights
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Button
              variant="light"
              leftSection={<FaBalanceScale size={14} />}
              onClick={() => {
                setSelectedProfileForCalc(undefined);
                setSelectedAircraftForCalc(undefined);
                setViewMode('calculator');
              }}
            >
              Open Calculator
            </Button>
            <Button
              leftSection={<FiPlus />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
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
          <Card bg="red.9" p="md">
            <Text c="white">Error loading profiles. Please try again.</Text>
            <Button variant="light" color="white" mt="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </Card>
        )}

        {!isLoading && !isError && profiles.length === 0 && (
          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Stack align="center" gap="lg" py="xl">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaBalanceScale size={32} style={{ opacity: 0.5, color: 'var(--vfr3d-primary)' }} />
              </Box>
              <Text c="white" size="lg" fw={500}>
                No Weight & Balance Profiles
              </Text>
              <Text c="dimmed" ta="center" maw={400}>
                Create a weight & balance profile for your aircraft to calculate takeoff and
                landing weights, and verify CG is within limits.
              </Text>
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                onClick={handleCreateClick}
                leftSection={<FiPlus />}
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
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 'var(--mantine-radius-md)',
                '&[data-active]': {
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                },
              },
              control: {
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.05)',
                },
              },
              chevron: {
                color: 'var(--mantine-color-gray-5)',
              },
            }}
          >
            {profilesByAircraft.map(([aircraftId, { aircraft: aircraftData, profiles: aircraftProfiles }]) => (
              <Accordion.Item key={aircraftId || 'no-aircraft'} value={aircraftId || 'no-aircraft'}>
                <Accordion.Control>
                  <Group gap="md">
                    <ThemeIcon
                      size="md"
                      variant="light"
                      color={aircraftData ? 'blue' : 'gray'}
                    >
                      <FaPlane size={14} />
                    </ThemeIcon>
                    <Box>
                      <Text c="white" fw={500}>
                        {aircraftData
                          ? `${aircraftData.tailNumber || 'N/A'} - ${aircraftData.aircraftType || 'Unknown'}`
                          : 'No Aircraft Assigned'}
                      </Text>
                      {aircraftData?.callSign && (
                        <Text size="xs" c="dimmed">
                          Call Sign: {aircraftData.callSign}
                        </Text>
                      )}
                    </Box>
                    <Badge size="sm" variant="light" color={aircraftData ? 'blue' : 'gray'}>
                      {aircraftProfiles.length} profile{aircraftProfiles.length !== 1 ? 's' : ''}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
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
        title="Delete Weight & Balance Profile"
        centered
        size="md"
        styles={{
          header: {
            backgroundColor: 'var(--vfr3d-surface)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            padding: '16px 20px',
          },
          title: {
            fontWeight: 600,
            color: 'white',
          },
          body: {
            backgroundColor: 'var(--vfr3d-surface)',
            padding: '20px',
          },
          content: {
            backgroundColor: 'var(--vfr3d-surface)',
          },
          close: {
            color: 'var(--mantine-color-gray-4)',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
          },
        }}
      >
        <Stack gap="md">
          {profileBeingDeleted && (
            <Box
              p="md"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <Group gap="sm">
                <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                  <FaBalanceScale size={16} />
                </ThemeIcon>
                <Box>
                  <Text c="white" fw={600}>
                    {profileBeingDeleted.profileName || 'Unnamed Profile'}
                  </Text>
                  {aircraftForDeletedProfile && (
                    <Text c="dimmed" size="sm">
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
            icon={<FiAlertTriangle size={18} />}
            title="This action will permanently delete:"
          >
            <Text size="sm" c="orange.3">
              This weight & balance profile and all its configuration data including loading stations and CG envelopes.
            </Text>
          </Alert>

          <Text c="dimmed" size="sm">
            This action cannot be undone.
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm} loading={isDeleting}>
              Delete Profile
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
