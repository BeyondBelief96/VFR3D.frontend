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
  Modal,
  Alert,
  List,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { ProtectedRoute, useAuth } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useGetAircraftQuery, useDeleteAircraftMutation } from '@/redux/api/vfr3d/aircraft.api';
import { useGetWeightBalanceProfilesQuery } from '@/redux/api/vfr3d/weightBalance.api';
import { AircraftDto } from '@/redux/api/vfr3d/dtos';
import { AircraftCard } from '@/features/Aircraft/AircraftCard';
import { AircraftForm } from '@/features/Aircraft/AircraftForm';

export const Route = createFileRoute('/aircraft')({
  component: AircraftPage,
});

function AircraftPage() {
  return (
    <ProtectedRoute>
      <AircraftContent />
    </ProtectedRoute>
  );
}

function AircraftContent() {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<AircraftDto | null>(null);
  const [aircraftToDelete, setAircraftToDelete] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { data: aircraft, isLoading, isError, isFetching, refetch } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  const { data: weightBalanceProfiles = [] } = useGetWeightBalanceProfilesQuery(userId, {
    skip: !userId,
  });

  const [deleteAircraft, { isLoading: isDeleting }] = useDeleteAircraftMutation();

  const handleCreateClick = () => {
    setEditingAircraft(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleEditClick = (aircraftItem: AircraftDto) => {
    setEditingAircraft(aircraftItem);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDeleteClick = (aircraftId: string) => {
    setAircraftToDelete(aircraftId);
    setDeleteModalOpen(true);
  };

  // Get the aircraft being deleted for display purposes
  const aircraftBeingDeleted = useMemo(() => {
    if (!aircraftToDelete || !aircraft) return null;
    return aircraft.find((a) => a.id === aircraftToDelete);
  }, [aircraftToDelete, aircraft]);

  // Count weight balance profiles for the aircraft being deleted
  const weightBalanceProfileCount = useMemo(() => {
    if (!aircraftToDelete) return 0;
    return weightBalanceProfiles.filter((p) => p.aircraftId === aircraftToDelete).length;
  }, [aircraftToDelete, weightBalanceProfiles]);

  const handleDeleteConfirm = async () => {
    if (!aircraftToDelete || !userId) return;

    try {
      await deleteAircraft({ userId, aircraftId: aircraftToDelete }).unwrap();
      notifications.show({
        title: 'Aircraft Deleted',
        message: 'The aircraft and all associated profiles have been deleted.',
        color: 'green',
      });
      setDeleteModalOpen(false);
      setAircraftToDelete(null);
    } catch (error: any) {
      // Check if it's a conflict error (409) - aircraft has flights
      const status = error?.status;
      const errorMessage = error?.data || error?.message || '';

      if (status === 409) {
        notifications.show({
          title: 'Cannot Delete Aircraft',
          message: 'This aircraft has flights associated with it. Delete or reassign those flights before deleting this aircraft.',
          color: 'orange',
          autoClose: 8000,
        });
      } else if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('flight')) {
        notifications.show({
          title: 'Cannot Delete Aircraft',
          message: errorMessage,
          color: 'orange',
          autoClose: 8000,
        });
      } else {
        notifications.show({
          title: 'Delete Failed',
          message: 'Unable to delete the aircraft. Please try again.',
          color: 'red',
        });
      }
      setDeleteModalOpen(false);
      setAircraftToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    notifications.show({
      title: formMode === 'create' ? 'Aircraft Added' : 'Aircraft Updated',
      message:
        formMode === 'create'
          ? 'Your new aircraft has been added.'
          : 'Your aircraft has been updated.',
      color: 'green',
    });
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
            My Aircraft
          </Title>
          <Button
            leftSection={<FiPlus />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            onClick={handleCreateClick}
          >
            Add Aircraft
          </Button>
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" color="blue" />
          </Center>
        )}

        {isError && (
          <PageErrorState
            title="Unable to Load Aircraft"
            message="We couldn't load your aircraft. This might be a temporary issue with our servers."
            onRetry={() => refetch()}
            isRetrying={isFetching}
            fullPage={false}
          />
        )}

        {aircraft && aircraft.length === 0 && (
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
                No Aircraft Configured
              </Text>
              <Text c="dimmed" ta="center" maw={400}>
                Add your aircraft to manage performance profiles and calculate accurate navigation
                logs for your flights.
              </Text>
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                onClick={handleCreateClick}
                leftSection={<FiPlus />}
              >
                Add Your First Aircraft
              </Button>
            </Stack>
          </Card>
        )}

        {aircraft && aircraft.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {aircraft.map((aircraftItem) => (
              <AircraftCard
                key={aircraftItem.id}
                aircraft={aircraftItem}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting && aircraftToDelete === aircraftItem.id}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Create/Edit Form Modal */}
      <AircraftForm
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        existingAircraft={editingAircraft}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Aircraft"
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
          {aircraftBeingDeleted && (
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
                  <FaPlane size={16} />
                </ThemeIcon>
                <Box>
                  <Text c="white" fw={600}>
                    {aircraftBeingDeleted.aircraftType || 'Unnamed Aircraft'}
                  </Text>
                  {aircraftBeingDeleted.tailNumber && (
                    <Text c="dimmed" size="sm">
                      {aircraftBeingDeleted.tailNumber}
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
            <List size="sm" spacing="xs" c="orange.3">
              <List.Item>This aircraft and all its data</List.Item>
              <List.Item>
                {aircraftBeingDeleted?.performanceProfiles?.length || 0} performance profile
                {(aircraftBeingDeleted?.performanceProfiles?.length || 0) !== 1 ? 's' : ''} associated with this aircraft
              </List.Item>
              <List.Item>
                {weightBalanceProfileCount} weight & balance profile
                {weightBalanceProfileCount !== 1 ? 's' : ''} associated with this aircraft
              </List.Item>
            </List>
          </Alert>

          <Alert color="blue" variant="light" title="Note">
            <Text size="sm">
              Aircraft with flights cannot be deleted. You must first delete or reassign any flights
              using this aircraft.
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
              Delete Aircraft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
