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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { FaBalanceScale, FaPlane } from 'react-icons/fa';
import { ProtectedRoute, useAuth } from '@/components/Auth';
import {
  useGetWeightBalanceProfilesQuery,
  useDeleteWeightBalanceProfileMutation,
} from '@/redux/api/vfr3d/weightBalance.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { WeightBalanceProfileDto, AircraftDto } from '@/redux/api/vfr3d/dtos';
import {
  WeightBalanceProfileForm,
  WeightBalanceProfileCard,
  WeightBalanceCalculator,
} from '@/features/WeightBalance';

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

  const { data: profiles = [], isLoading, isError, refetch } = useGetWeightBalanceProfilesQuery(
    userId,
    { skip: !userId }
  );

  const { data: aircraft = [] } = useGetAircraftQuery(userId, {
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

  const handleCreateClick = () => {
    setEditingProfile(null);
    setViewMode('create');
  };

  const handleEditClick = (profile: WeightBalanceProfileDto) => {
    setEditingProfile(profile);
    setViewMode('edit');
  };

  const handleDeleteClick = async (profileId: string) => {
    if (!userId) return;

    try {
      await deleteProfile({ userId, profileId }).unwrap();
      notifications.show({
        title: 'Profile Deleted',
        message: 'The weight & balance profile has been deleted.',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Delete Failed',
        message: 'Unable to delete the profile. Please try again.',
        color: 'red',
      });
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

  // Render form view (create or edit)
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

          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <WeightBalanceProfileForm
              mode={viewMode === 'create' ? 'create' : 'edit'}
              existingProfile={editingProfile}
              onCancel={handleCancel}
              onSuccess={handleFormSuccess}
            />
          </Card>
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
    </Container>
  );
}
