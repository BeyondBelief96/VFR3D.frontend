import { useState } from 'react';
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
  Badge,
  SimpleGrid,
  Box,
  ActionIcon,
  Modal,
  Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { ProtectedRoute, useAuth } from '@/components/Auth';
import {
  useGetAircraftPerformanceProfilesQuery,
  useDeleteAircraftPerformanceProfileMutation,
} from '@/redux/api/vfr3d/performanceProfiles.api';
import { AircraftPerformanceProfileDto } from '@/redux/api/vfr3d/dtos';
import { PerformanceProfileDrawerForm } from '@/features/Flights/FlightPlanningDrawer/PerformanceProfiles/PerformanceProfileDrawerForm';

export const Route = createFileRoute('/profiles')({
  component: AircraftProfilesPage,
});

function AircraftProfilesPage() {
  return (
    <ProtectedRoute>
      <ProfilesContent />
    </ProtectedRoute>
  );
}

interface ProfileCardProps {
  profile: AircraftPerformanceProfileDto;
  onEdit: (profile: AircraftPerformanceProfileDto) => void;
  onDelete: (profileId: string) => void;
  isDeleting: boolean;
}

function ProfileCard({ profile, onEdit, onDelete, isDeleting }: ProfileCardProps) {
  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        transition: 'all 0.2s ease',
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaPlane size={20} color="var(--vfr3d-primary)" />
            </Box>
            <Box>
              <Text c="white" fw={600} size="lg" lineClamp={1}>
                {profile.profileName || 'Unnamed Profile'}
              </Text>
              <Text c="dimmed" size="sm">
                Aircraft Performance Profile
              </Text>
            </Box>
          </Group>
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="blue"
              size="lg"
              onClick={() => onEdit(profile)}
            >
              <FiEdit2 size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              onClick={() => profile.id && onDelete(profile.id)}
              loading={isDeleting}
            >
              <FiTrash2 size={18} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={2} spacing="sm">
          <Paper
            p="sm"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text size="xs" c="dimmed" mb={2}>
              Cruise Speed
            </Text>
            <Text c="white" fw={600} size="lg">
              {profile.cruiseTrueAirspeed} kts
            </Text>
          </Paper>
          <Paper
            p="sm"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text size="xs" c="dimmed" mb={2}>
              Cruise Fuel Burn
            </Text>
            <Text c="white" fw={600} size="lg">
              {profile.cruiseFuelBurn} gph
            </Text>
          </Paper>
          <Paper
            p="sm"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text size="xs" c="dimmed" mb={2}>
              Climb Rate
            </Text>
            <Text c="white" fw={600} size="lg">
              {profile.climbFpm} fpm
            </Text>
          </Paper>
          <Paper
            p="sm"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <Text size="xs" c="dimmed" mb={2}>
              Fuel Capacity
            </Text>
            <Text c="white" fw={600} size="lg">
              {profile.fuelOnBoardGals} gal
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Footer badges */}
        <Group gap="xs">
          <Badge size="sm" variant="light" color="blue">
            Climb: {profile.climbTrueAirspeed} kts
          </Badge>
          <Badge size="sm" variant="light" color="cyan">
            Descent: {profile.descentTrueAirspeed} kts
          </Badge>
          <Badge size="sm" variant="light" color="teal">
            STT Fuel: {profile.sttFuelGals} gal
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}

function ProfilesContent() {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AircraftPerformanceProfileDto | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: profiles, isLoading, isError, refetch } = useGetAircraftPerformanceProfilesQuery(userId, {
    skip: !userId,
  });

  const [deleteProfile, { isLoading: isDeleting }] = useDeleteAircraftPerformanceProfileMutation();

  const handleCreateClick = () => {
    setEditingProfile(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleEditClick = (profile: AircraftPerformanceProfileDto) => {
    setEditingProfile(profile);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDeleteClick = (profileId: string) => {
    setProfileToDelete(profileId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete || !userId) return;

    try {
      await deleteProfile({ userId, aircraftPerformanceProfileId: profileToDelete }).unwrap();
      notifications.show({
        title: 'Profile Deleted',
        message: 'The aircraft profile has been deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Delete Failed',
        message: 'Unable to delete the profile. Please try again.',
        color: 'red',
      });
    } finally {
      setDeleteModalOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setEditingProfile(null);
    notifications.show({
      title: formMode === 'create' ? 'Profile Created' : 'Profile Updated',
      message:
        formMode === 'create'
          ? 'Your new aircraft profile has been created.'
          : 'Your aircraft profile has been updated.',
      color: 'green',
    });
  };

  const handleFormCancel = () => {
    setFormModalOpen(false);
    setEditingProfile(null);
  };

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} c="white">
            Aircraft Profiles
          </Title>
          <Button
            leftSection={<FiPlus />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            onClick={handleCreateClick}
          >
            New Profile
          </Button>
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

        {profiles && profiles.length === 0 && (
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
                <FaPlane size={32} style={{ opacity: 0.5, color: 'var(--vfr3d-primary)' }} />
              </Box>
              <Text c="white" size="lg" fw={500}>
                No Aircraft Profiles
              </Text>
              <Text c="dimmed" ta="center" maw={400}>
                Create an aircraft performance profile to calculate accurate navigation logs for
                your flights.
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

        {profiles && profiles.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting && profileToDelete === profile.id}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Create/Edit Form Modal */}
      <Modal
        opened={formModalOpen}
        onClose={handleFormCancel}
        title={formMode === 'create' ? 'Create Aircraft Profile' : 'Edit Aircraft Profile'}
        centered
        size="lg"
        styles={{
          header: { backgroundColor: 'var(--vfr3d-surface)' },
          body: { backgroundColor: 'var(--vfr3d-surface)', padding: 0 },
        }}
      >
        <PerformanceProfileDrawerForm
          mode={formMode}
          existingProfile={editingProfile}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Profile"
        centered
        styles={{
          header: { backgroundColor: 'var(--vfr3d-surface)' },
          body: { backgroundColor: 'var(--vfr3d-surface)' },
        }}
      >
        <Stack gap="md">
          <Text c="dimmed">
            Are you sure you want to delete this aircraft profile? This action cannot be undone.
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
