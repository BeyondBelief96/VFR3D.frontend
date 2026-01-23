import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/components/Auth';
import { RootState, AppDispatch } from '@/redux/store';
import { updateDraftPlanSettings } from '@/redux/slices/flightPlanningSlice';
import {
  useGetAircraftPerformanceProfilesQuery,
  useDeleteAircraftPerformanceProfileMutation,
} from '@/redux/api/vfr3d/performanceProfiles.api';
import { AircraftPerformanceProfileDto } from '@/redux/api/vfr3d/dtos';
import { AircraftProfileLoading } from './AircraftProfileLoading';
import { AircraftPerformanceProfileErrors } from './AircraftPerformanceProfileErrors';
import { AircraftPerformanceProfileSelection } from './AircraftPerformanceProfileSelection';
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
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [editingProfile, setEditingProfile] = useState<AircraftPerformanceProfileDto | null>(null);

  const { selectedPerformanceProfileId } = useSelector(
    (state: RootState) => state.flightPlanning.draftFlightPlan
  );

  const {
    data: profiles,
    isLoading,
    isError,
    refetch,
  } = useGetAircraftPerformanceProfilesQuery(userId, {
    skip: !userId,
  });

  const [deleteProfile, { isLoading: isDeleting }] = useDeleteAircraftPerformanceProfileMutation();

  // Notify parent when editing state changes
  useEffect(() => {
    const isEditing = viewMode === 'create' || viewMode === 'edit';
    onEditingStateChange?.(isEditing);
  }, [viewMode, onEditingStateChange]);

  // Auto-select first profile if none selected
  useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedPerformanceProfileId) {
      dispatch(updateDraftPlanSettings({ selectedPerformanceProfileId: profiles[0].id }));
    }
  }, [profiles, selectedPerformanceProfileId, dispatch]);

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
        message: 'The aircraft profile has been deleted.',
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
          ? 'Your new aircraft profile has been created.'
          : 'Your aircraft profile has been updated.',
      color: 'green',
    });
  };

  const handleFormCancel = () => {
    setViewMode('selection');
    setEditingProfile(null);
  };

  // Loading state
  if (isLoading) {
    return <AircraftProfileLoading />;
  }

  // Error state
  if (isError) {
    return <AircraftPerformanceProfileErrors onRetry={refetch} />;
  }

  // Form view (create or edit)
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <PerformanceProfileDrawerForm
        mode={viewMode}
        existingProfile={editingProfile}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Selection view
  return (
    <AircraftPerformanceProfileSelection
      profiles={profiles || []}
      selectedProfileId={selectedPerformanceProfileId}
      onSelect={handleSelectProfile}
      onCreate={handleCreateProfile}
      onEdit={handleEditProfile}
      onDelete={handleDeleteProfile}
      disabled={disabled || isDeleting}
    />
  );
};

export default DrawerAircraftPerformanceProfiles;
