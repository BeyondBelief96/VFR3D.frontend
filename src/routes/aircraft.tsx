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
import { notifyError, notifySuccess } from '@/utility/notifications';
import { FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';
import { SURFACE, SURFACE_INNER, BORDER, ICON_BG, MODAL_STYLES, THEME_COLORS } from '@/constants/surfaces';
import { FaPlane } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useIsPhone, useIsTablet } from '@/hooks';
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
  const { user } = useAuth0();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

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
      notifySuccess('Aircraft Deleted', 'The aircraft and all associated profiles have been deleted.');
      setDeleteModalOpen(false);
      setAircraftToDelete(null);
    } catch (error) {
      // notifyError handles conflict (409) and other errors with appropriate messages
      notifyError({ error, operation: 'delete aircraft' });
      setDeleteModalOpen(false);
      setAircraftToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    notifySuccess(
      formMode === 'create' ? 'Aircraft Added' : 'Aircraft Updated',
      formMode === 'create'
        ? 'Your new aircraft has been added.'
        : 'Your aircraft has been updated.'
    );
  };

  return (
    <Container
      size="lg"
      py={isPhone ? 'md' : 'xl'}
      px={isPhone ? 'sm' : undefined}
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: THEME_COLORS.SURFACE_9 }}
    >
      <Stack gap={isPhone ? 'md' : 'lg'}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Title order={isPhone ? 2 : 1} c="white">
            My Aircraft
          </Title>
          <Button
            leftSection={<FiPlus />}
            variant="gradient"
            gradient={BUTTON_GRADIENTS.PRIMARY}
            onClick={handleCreateClick}
            size={isPhone ? 'sm' : 'md'}
            fullWidth={isPhone}
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
                <FaPlane size={isPhone ? 24 : 32} style={{ opacity: 0.5, color: THEME_COLORS.PRIMARY }} />
              </Box>
              <Text c="white" size={isPhone ? 'md' : 'lg'} fw={500}>
                No Aircraft Configured
              </Text>
              <Text c="dimmed" ta="center" maw={400} size={isPhone ? 'sm' : 'md'} px={isPhone ? 'xs' : undefined}>
                Add your aircraft to manage performance profiles and calculate accurate navigation
                logs for your flights.
              </Text>
              <Button
                variant="gradient"
                gradient={BUTTON_GRADIENTS.PRIMARY}
                onClick={handleCreateClick}
                leftSection={<FiPlus />}
                size={isPhone ? 'sm' : 'md'}
                fullWidth={isPhone}
              >
                Add Your First Aircraft
              </Button>
            </Stack>
          </Card>
        )}

        {aircraft && aircraft.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 1, md: 2 }} spacing={isPhone ? 'sm' : 'md'}>
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
          {aircraftBeingDeleted && (
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
                  <FaPlane size={isPhone ? 14 : 16} />
                </ThemeIcon>
                <Box style={{ minWidth: 0, flex: 1 }}>
                  <Text c="white" fw={600} size={isPhone ? 'sm' : 'md'} lineClamp={1}>
                    {aircraftBeingDeleted.aircraftType || 'Unnamed Aircraft'}
                  </Text>
                  {aircraftBeingDeleted.tailNumber && (
                    <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
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
            icon={<FiAlertTriangle size={isPhone ? 16 : 18} />}
            title="This action will permanently delete:"
            styles={{
              title: { fontSize: isPhone ? '0.875rem' : undefined },
            }}
          >
            <List size={isPhone ? 'xs' : 'sm'} spacing="xs" c="orange.3">
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

          <Alert color="blue" variant="light" title="Note" styles={{ title: { fontSize: isPhone ? '0.875rem' : undefined } }}>
            <Text size={isPhone ? 'xs' : 'sm'}>
              Aircraft with flights cannot be deleted. You must first delete or reassign any flights
              using this aircraft.
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
              variant="light"
              color={BUTTON_COLORS.DESTRUCTIVE}
              onClick={handleDeleteConfirm}
              loading={isDeleting}
              size={isPhone ? 'sm' : 'md'}
            >
              Delete Aircraft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
