import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from '@tanstack/react-router';
import {
  Stack,
  Group,
  Text,
  Box,
  Badge,
  Button,
  SimpleGrid,
  Center,
  Loader,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiAlertCircle } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { RootState, AppDispatch } from '@/redux/store';
import { updateDraftPlanSettings } from '@/redux/slices/flightPlanningSlice';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import { useDeleteAircraftPerformanceProfileMutation } from '@/redux/api/vfr3d/performanceProfiles.api';
import { AircraftPerformanceProfileDto } from '@/redux/api/vfr3d/dtos';
import { getAirspeedUnitLabel } from '@/utility/unitConversionUtils';
import { PerformanceProfileDrawerForm } from './PerformanceProfileDrawerForm';

type ViewMode = 'selection' | 'create' | 'edit';

interface DrawerAircraftPerformanceProfilesProps {
  disabled?: boolean;
  /** Callback when the editing/creating state changes */
  onEditingStateChange?: (isEditing: boolean) => void;
}

export const DrawerAircraftPerformanceProfiles: React.FC<DrawerAircraftPerformanceProfilesProps> = ({
  disabled = false,
  onEditingStateChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth0();
  const userId = user?.sub || '';

  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<AircraftPerformanceProfileDto | null>(null);

  const { selectedPerformanceProfileId } = useSelector(
    (state: RootState) => state.flightPlanning.draftFlightPlan
  );

  const {
    data: aircraftList,
    isLoading,
    isError,
    refetch,
  } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  const [deleteProfile, { isLoading: isDeleting }] = useDeleteAircraftPerformanceProfileMutation();

  // Get the selected aircraft
  const selectedAircraft = aircraftList?.find((a) => a.id === selectedAircraftId);
  const profiles = selectedAircraft?.performanceProfiles || [];

  // Notify parent when editing state changes
  useEffect(() => {
    const isEditing = viewMode === 'create' || viewMode === 'edit';
    onEditingStateChange?.(isEditing);
  }, [viewMode, onEditingStateChange]);

  // Auto-select aircraft if profile is already selected
  useEffect(() => {
    if (aircraftList && selectedPerformanceProfileId && !selectedAircraftId) {
      // Find which aircraft has the selected profile
      const aircraftWithProfile = aircraftList.find((a) =>
        a.performanceProfiles?.some((p) => p.id === selectedPerformanceProfileId)
      );
      if (aircraftWithProfile?.id) {
        setSelectedAircraftId(aircraftWithProfile.id);
      }
    }
  }, [aircraftList, selectedPerformanceProfileId, selectedAircraftId]);

  // Auto-select first aircraft if none selected and no profile is selected
  useEffect(() => {
    if (aircraftList && aircraftList.length > 0 && !selectedAircraftId && !selectedPerformanceProfileId) {
      const firstAircraftWithProfiles = aircraftList.find(
        (a) => a.performanceProfiles && a.performanceProfiles.length > 0
      );
      if (firstAircraftWithProfiles?.id) {
        setSelectedAircraftId(firstAircraftWithProfiles.id);
        // Also auto-select first profile
        const firstProfile = firstAircraftWithProfiles.performanceProfiles?.[0];
        if (firstProfile?.id) {
          dispatch(updateDraftPlanSettings({ selectedPerformanceProfileId: firstProfile.id }));
        }
      } else if (aircraftList[0]?.id) {
        setSelectedAircraftId(aircraftList[0].id);
      }
    }
  }, [aircraftList, selectedAircraftId, selectedPerformanceProfileId, dispatch]);

  const handleSelectAircraft = (aircraftId: string) => {
    setSelectedAircraftId(aircraftId);
    // Clear profile selection when switching aircraft
    dispatch(updateDraftPlanSettings({ selectedPerformanceProfileId: null }));
  };

  const handleSelectProfile = (profileId: string) => {
    dispatch(updateDraftPlanSettings({ selectedPerformanceProfileId: profileId }));
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setViewMode('create');
  };

  const handleEditProfile = (profileId: string) => {
    const profile = profiles?.find((p) => p.id === profileId);
    if (profile) {
      setEditingProfile(profile);
      setViewMode('edit');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!userId) return;

    try {
      await deleteProfile({ userId, aircraftPerformanceProfileId: profileId }).unwrap();
      notifications.show({
        title: 'Profile Deleted',
        message: 'The performance profile has been deleted.',
        color: 'green',
      });

      // If deleted profile was selected, clear selection
      if (profileId === selectedPerformanceProfileId) {
        dispatch(updateDraftPlanSettings({ selectedPerformanceProfileId: null }));
      }
    } catch {
      notifications.show({
        title: 'Delete Failed',
        message: 'Unable to delete the profile. Please try again.',
        color: 'red',
      });
    }
  };

  const handleFormSuccess = () => {
    setViewMode('selection');
    setEditingProfile(null);
    notifications.show({
      title: viewMode === 'create' ? 'Profile Created' : 'Profile Updated',
      message:
        viewMode === 'create'
          ? 'Your new performance profile has been created.'
          : 'Your performance profile has been updated.',
      color: 'green',
    });
  };

  const handleFormCancel = () => {
    setViewMode('selection');
    setEditingProfile(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" color="blue" />
      </Center>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert color="red" icon={<FiAlertCircle size={16} />}>
        <Text size="sm">Failed to load aircraft. Please try again.</Text>
        <Button variant="light" color="red" size="xs" mt="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  // Form view (create or edit)
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <PerformanceProfileDrawerForm
        mode={viewMode}
        existingProfile={editingProfile}
        aircraftId={selectedAircraftId || undefined}
        airspeedUnits={selectedAircraft?.airspeedUnits}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // No aircraft configured state
  if (!aircraftList || aircraftList.length === 0) {
    return (
      <Stack align="center" py="xl">
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
          <FaPlane size={32} style={{ opacity: 0.5, color: 'var(--mantine-color-vfr3dBlue-5)' }} />
        </Box>
        <Text size="lg" fw={500} c="white">
          No Aircraft Configured
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={300}>
          Configure your aircraft to calculate accurate navigation logs for your flights.
        </Text>
        <Button
          component={Link}
          to="/aircraft"
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
        >
          Go to Aircraft Page
        </Button>
      </Stack>
    );
  }

  // Selection view with aircraft-first flow
  return (
    <Stack gap="md">
      {/* Aircraft Selection */}
      <Box>
        <Text fw={600} c="white" mb="sm">
          Select Aircraft
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {aircraftList.map((aircraft) => {
            const isSelected = aircraft.id === selectedAircraftId;
            const profileCount = aircraft.performanceProfiles?.length || 0;
            return (
              <Box
                key={aircraft.id}
                onClick={() => !disabled && aircraft.id && handleSelectAircraft(aircraft.id)}
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'rgba(30, 41, 59, 0.8)',
                  border: isSelected
                    ? '2px solid var(--mantine-color-vfr3dBlue-5)'
                    : '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 'var(--mantine-radius-md)',
                  padding: 'var(--mantine-spacing-sm)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <Group gap="xs" wrap="nowrap">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isSelected
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(148, 163, 184, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FaPlane
                      size={14}
                      color={isSelected ? 'var(--mantine-color-vfr3dBlue-5)' : 'var(--mantine-color-gray-5)'}
                    />
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} c="white" lineClamp={1}>
                      {aircraft.aircraftType || 'Unnamed Aircraft'}
                    </Text>
                    <Group gap={4}>
                      {aircraft.tailNumber && (
                        <Text size="xs" c="dimmed">
                          {aircraft.tailNumber}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        {profileCount} profile{profileCount !== 1 ? 's' : ''}
                      </Text>
                    </Group>
                  </Box>
                </Group>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Profile Selection - only show if aircraft is selected */}
      {selectedAircraftId && (
        <Box>
          <Group justify="space-between" mb="sm">
            <Text fw={600} c="white">
              Select Performance Profile
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={handleCreateProfile}
              disabled={disabled}
            >
              New Profile
            </Button>
          </Group>

          {profiles.length === 0 ? (
            <Box
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 'var(--mantine-radius-md)',
                padding: 'var(--mantine-spacing-lg)',
              }}
            >
              <Stack align="center" gap="sm">
                <Text size="sm" c="dimmed" ta="center">
                  No performance profiles for this aircraft
                </Text>
                <Button size="xs" variant="light" onClick={handleCreateProfile}>
                  Create First Profile
                </Button>
              </Stack>
            </Box>
          ) : (
            <SimpleGrid cols={1} spacing="xs">
              {profiles.map((profile) => {
                const isSelected = profile.id === selectedPerformanceProfileId;
                return (
                  <Box
                    key={profile.id}
                    onClick={() => !disabled && profile.id && handleSelectProfile(profile.id)}
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(30, 41, 59, 0.8)',
                      border: isSelected
                        ? '2px solid var(--mantine-color-vfr3dBlue-5)'
                        : '1px solid rgba(148, 163, 184, 0.1)',
                      borderRadius: 'var(--mantine-radius-md)',
                      padding: 'var(--mantine-spacing-sm)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} c="white" lineClamp={1}>
                          {profile.profileName}
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Badge size="xs" variant="light" color="blue">
                            {profile.cruiseTrueAirspeed} {getAirspeedUnitLabel(selectedAircraft?.airspeedUnits)}
                          </Badge>
                          <Badge size="xs" variant="light" color="cyan">
                            {profile.cruiseFuelBurn} gph
                          </Badge>
                        </Group>
                      </Box>
                      {isSelected && (
                        <Group gap={4}>
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            color="blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              profile.id && handleEditProfile(profile.id);
                            }}
                            disabled={disabled}
                          >
                            Edit
                          </Button>
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              profile.id && handleDeleteProfile(profile.id);
                            }}
                            disabled={disabled}
                            loading={isDeleting}
                          >
                            Delete
                          </Button>
                        </Group>
                      )}
                    </Group>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default DrawerAircraftPerformanceProfiles;
