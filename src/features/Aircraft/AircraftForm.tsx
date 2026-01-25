import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Modal,
  Alert,
  Loader,
} from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import {
  AircraftDto,
  AircraftCategory,
  CreateAircraftRequestDto,
  UpdateAircraftRequestDto,
} from '@/redux/api/vfr3d/dtos';
import {
  useCreateAircraftMutation,
  useUpdateAircraftMutation,
} from '@/redux/api/vfr3d/aircraft.api';
import { useAuth } from '@/components/Auth';

const inputStyles = {
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: 'white',
    '&:focus': {
      borderColor: 'var(--vfr3d-primary)',
    },
  },
  label: {
    color: 'var(--mantine-color-gray-4)',
    marginBottom: 4,
  },
};

const aircraftCategoryOptions = [
  { value: AircraftCategory.SingleEngine, label: 'Single Engine' },
  { value: AircraftCategory.MultiEngine, label: 'Multi Engine' },
  { value: AircraftCategory.Helicopter, label: 'Helicopter' },
  { value: AircraftCategory.Glider, label: 'Glider' },
  { value: AircraftCategory.Balloon, label: 'Balloon' },
  { value: AircraftCategory.Ultralight, label: 'Ultralight' },
  { value: AircraftCategory.LightSport, label: 'Light Sport' },
  { value: AircraftCategory.Gyroplane, label: 'Gyroplane' },
];

interface AircraftFormProps {
  opened: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  existingAircraft?: AircraftDto | null;
  onSuccess?: () => void;
}

interface FormData {
  aircraftType: string;
  tailNumber: string;
  category: AircraftCategory | '';
}

const defaultFormData: FormData = {
  aircraftType: '',
  tailNumber: '',
  category: '',
};

export const AircraftForm: React.FC<AircraftFormProps> = ({
  opened,
  onClose,
  mode,
  existingAircraft,
  onSuccess,
}) => {
  const { user } = useAuth();
  const userId = user?.sub || '';

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [createAircraft, { isLoading: isCreating, isError: isCreateError, reset: resetCreate }] =
    useCreateAircraftMutation();
  const [updateAircraft, { isLoading: isUpdating, isError: isUpdateError, reset: resetUpdate }] =
    useUpdateAircraftMutation();

  const isLoading = isCreating || isUpdating;
  const hasError = isCreateError || isUpdateError;

  // Initialize form with existing aircraft data when editing
  useEffect(() => {
    if (mode === 'edit' && existingAircraft) {
      setFormData({
        aircraftType: existingAircraft.aircraftType || '',
        tailNumber: existingAircraft.tailNumber || '',
        category: existingAircraft.category || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [mode, existingAircraft, opened]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (hasError) {
      resetCreate();
      resetUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aircraftType.trim()) return;

    try {
      if (mode === 'create') {
        const request: CreateAircraftRequestDto = {
          aircraftType: formData.aircraftType,
          tailNumber: formData.tailNumber || undefined,
          category: formData.category || undefined,
        };
        await createAircraft({ userId, request }).unwrap();
      } else if (mode === 'edit' && existingAircraft?.id) {
        const request: UpdateAircraftRequestDto = {
          aircraftType: formData.aircraftType,
          tailNumber: formData.tailNumber || undefined,
          category: formData.category || undefined,
        };
        await updateAircraft({ userId, aircraftId: existingAircraft.id, request }).unwrap();
      }
      onSuccess?.();
      handleClose();
    } catch {
      // Error is handled by RTK Query isError state
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    resetCreate();
    resetUpdate();
    onClose();
  };

  const isValid = formData.aircraftType.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={mode === 'create' ? 'Add Aircraft' : 'Edit Aircraft'}
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
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {hasError && (
            <Alert color="red" icon={<FiAlertCircle size={16} />}>
              {mode === 'create'
                ? 'Failed to create aircraft. Please try again.'
                : 'Failed to update aircraft. Please try again.'}
            </Alert>
          )}

          <TextInput
            label="Aircraft Name / Type"
            placeholder="e.g., Cessna 172S"
            value={formData.aircraftType}
            onChange={(e) => handleInputChange('aircraftType', e.target.value)}
            required
            styles={inputStyles}
          />

          <TextInput
            label="Tail Number"
            placeholder="e.g., N12345"
            value={formData.tailNumber}
            onChange={(e) => handleInputChange('tailNumber', e.target.value.toUpperCase())}
            styles={inputStyles}
          />

          <Select
            label="Category"
            placeholder="Select category"
            value={formData.category}
            onChange={(value) => handleInputChange('category', value || '')}
            data={aircraftCategoryOptions}
            styles={{
              ...inputStyles,
              dropdown: {
                backgroundColor: 'var(--vfr3d-surface)',
                borderColor: 'rgba(148, 163, 184, 0.2)',
              },
              option: {
                color: 'white',
                '&[data-selected]': {
                  backgroundColor: 'var(--vfr3d-primary)',
                },
                '&[data-hovered]': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                },
              },
            }}
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" color="gray" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            >
              {isLoading ? (
                <Loader size="xs" color="white" />
              ) : mode === 'create' ? (
                'Add Aircraft'
              ) : (
                'Save Changes'
              )}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AircraftForm;
