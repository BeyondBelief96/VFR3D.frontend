import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  Select,
  ColorInput,
  Modal,
  Alert,
  Loader,
  Text,
  Paper,
  Box,
  Accordion,
  ScrollArea,
  Badge,
} from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';
import { FaPlane, FaPalette, FaTachometerAlt, FaCog } from 'react-icons/fa';
import {
  AircraftDto,
  AircraftCategory,
  AirspeedUnits,
  LengthUnits,
  CreateAircraftRequestDto,
  UpdateAircraftRequestDto,
} from '@/redux/api/vfr3d/dtos';
import {
  useCreateAircraftMutation,
  useUpdateAircraftMutation,
} from '@/redux/api/vfr3d/aircraft.api';
import { useAuth0 } from '@auth0/auth0-react';
import { useIsPhone, useIsTablet } from '@/hooks';
import { notifyError } from '@/utility/notifications';

const inputStyles = {
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    color: 'white',
    '&:focus': {
      borderColor: 'var(--mantine-color-vfr3dBlue-5)',
    },
  },
  label: {
    color: 'var(--mantine-color-gray-4)',
    marginBottom: 4,
  },
  description: {
    color: 'var(--mantine-color-gray-6)',
  },
};

const selectStyles = {
  ...inputStyles,
  dropdown: {
    backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  option: {
    color: 'white',
    '&[data-selected]': {
      backgroundColor: 'var(--mantine-color-vfr3dBlue-5)',
    },
    '&[data-hovered]': {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
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

const airspeedUnitsOptions = [
  { value: AirspeedUnits.Knots, label: 'Knots (kts)' },
  { value: AirspeedUnits.MPH, label: 'Miles per Hour (mph)' },
  { value: AirspeedUnits.KPH, label: 'Kilometers per Hour (kph)' },
];

const lengthUnitsOptions = [
  { value: LengthUnits.Feet, label: 'Feet (ft)' },
  { value: LengthUnits.Meters, label: 'Meters (m)' },
];

interface AircraftFormProps {
  opened: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  existingAircraft?: AircraftDto | null;
  onSuccess?: () => void;
}

interface FormData {
  // Required fields
  aircraftType: string;
  tailNumber: string;
  category: AircraftCategory | '';
  // Identification (optional)
  callSign: string;
  serialNumber: string;
  aircraftHome: string;
  // Colors (optional)
  primaryColor: string;
  color2: string;
  color3: string;
  color4: string;
  // Performance (optional)
  defaultCruiseAltitude: number | '';
  maxCeiling: number | '';
  glideSpeed: number | '';
  glideRatio: number | '';
  // Preferences (optional)
  airspeedUnits: AirspeedUnits | '';
  lengthUnits: LengthUnits | '';
}

const defaultFormData: FormData = {
  aircraftType: '',
  tailNumber: '',
  category: '',
  callSign: '',
  serialNumber: '',
  aircraftHome: '',
  primaryColor: '',
  color2: '',
  color3: '',
  color4: '',
  defaultCruiseAltitude: '',
  maxCeiling: '',
  glideSpeed: '',
  glideRatio: '',
  airspeedUnits: '',
  lengthUnits: '',
};

export const AircraftForm: React.FC<AircraftFormProps> = ({
  opened,
  onClose,
  mode,
  existingAircraft,
  onSuccess,
}) => {
  const { user } = useAuth0();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [createAircraft, { isLoading: isCreating, isError: isCreateError, reset: resetCreate }] =
    useCreateAircraftMutation();
  const [updateAircraft, { isLoading: isUpdating, isError: isUpdateError, reset: resetUpdate }] =
    useUpdateAircraftMutation();

  const isLoading = isCreating || isUpdating;
  const hasError = isCreateError || isUpdateError;

  // Check if current category is glider-related (for showing glide fields)
  const isGlider = formData.category === AircraftCategory.Glider;

  // Initialize form with existing aircraft data when editing
  useEffect(() => {
    if (mode === 'edit' && existingAircraft) {
      setFormData({
        aircraftType: existingAircraft.aircraftType || '',
        tailNumber: existingAircraft.tailNumber || '',
        category: existingAircraft.category || '',
        callSign: existingAircraft.callSign || '',
        serialNumber: existingAircraft.serialNumber || '',
        aircraftHome: existingAircraft.aircraftHome || '',
        primaryColor: existingAircraft.primaryColor || '',
        color2: existingAircraft.color2 || '',
        color3: existingAircraft.color3 || '',
        color4: existingAircraft.color4 || '',
        defaultCruiseAltitude: existingAircraft.defaultCruiseAltitude ?? '',
        maxCeiling: existingAircraft.maxCeiling ?? '',
        glideSpeed: existingAircraft.glideSpeed ?? '',
        glideRatio: existingAircraft.glideRatio ?? '',
        airspeedUnits: existingAircraft.airspeedUnits || '',
        lengthUnits: existingAircraft.lengthUnits || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [mode, existingAircraft, opened]);

  const handleInputChange = (field: keyof FormData, value: string | number | '') => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (hasError) {
      resetCreate();
      resetUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.aircraftType.trim() || !formData.tailNumber.trim() || !formData.category) {
      return;
    }

    try {
      const requestData = {
        aircraftType: formData.aircraftType,
        tailNumber: formData.tailNumber,
        category: formData.category || undefined,
        callSign: formData.callSign || undefined,
        serialNumber: formData.serialNumber || undefined,
        aircraftHome: formData.aircraftHome || undefined,
        primaryColor: formData.primaryColor || undefined,
        color2: formData.color2 || undefined,
        color3: formData.color3 || undefined,
        color4: formData.color4 || undefined,
        defaultCruiseAltitude: formData.defaultCruiseAltitude || undefined,
        maxCeiling: formData.maxCeiling || undefined,
        glideSpeed: formData.glideSpeed || undefined,
        glideRatio: formData.glideRatio || undefined,
        airspeedUnits: formData.airspeedUnits || undefined,
        lengthUnits: formData.lengthUnits || undefined,
      };

      if (mode === 'create') {
        await createAircraft({ userId, request: requestData as CreateAircraftRequestDto }).unwrap();
      } else if (mode === 'edit' && existingAircraft?.id) {
        await updateAircraft({
          userId,
          aircraftId: existingAircraft.id,
          request: requestData as UpdateAircraftRequestDto,
        }).unwrap();
      }
      onSuccess?.();
      handleClose();
    } catch (error) {
      notifyError({ error, operation: mode === 'create' ? 'create aircraft' : 'update aircraft' });
    }
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    resetCreate();
    resetUpdate();
    onClose();
  };

  const isValid =
    formData.aircraftType.trim().length > 0 &&
    formData.tailNumber.trim().length > 0 &&
    formData.category !== '';

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={mode === 'create' ? 'Add Aircraft' : 'Edit Aircraft'}
      centered
      size={isPhone ? '100%' : isTablet ? 'xl' : 'lg'}
      fullScreen={isPhone}
      styles={{
        header: {
          backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          padding: isPhone ? '12px 16px' : '16px 20px',
        },
        title: {
          fontWeight: 600,
          color: 'white',
          fontSize: isPhone ? '1rem' : undefined,
        },
        body: {
          backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
          padding: 0,
        },
        content: {
          backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
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
        <ScrollArea.Autosize mah={isPhone ? undefined : 'calc(100vh - 200px)'} offsetScrollbars={!isPhone}>
          <Stack gap={isPhone ? 'sm' : 'md'} p={isPhone ? 'md' : 'lg'}>
            {hasError && (
              <Alert color="red" icon={<FiAlertCircle size={isPhone ? 14 : 16} />}>
                <Text size={isPhone ? 'xs' : 'sm'}>
                  {mode === 'create'
                    ? 'Failed to create aircraft. Please try again.'
                    : 'Failed to update aircraft. Please try again.'}
                </Text>
              </Alert>
            )}

            {/* Required Fields Section */}
            <Paper
              p={isPhone ? 'sm' : 'md'}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <Group gap="xs" mb={isPhone ? 'sm' : 'md'}>
                <Box
                  style={{
                    width: isPhone ? 24 : 28,
                    height: isPhone ? 24 : 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaPlane size={isPhone ? 10 : 12} color="var(--mantine-color-vfr3dBlue-5)" />
                </Box>
                <Text size={isPhone ? 'xs' : 'sm'} fw={600} c="white">
                  Basic Information
                </Text>
                <Badge size="xs" color="red" variant="light">
                  Required
                </Badge>
              </Group>

              <Stack gap={isPhone ? 'xs' : 'sm'}>
                <TextInput
                  label="Aircraft Type / Model"
                  description={isPhone ? undefined : 'e.g., Cessna 172S, Piper PA-28-181'}
                  placeholder="Enter aircraft type"
                  value={formData.aircraftType}
                  onChange={(e) => handleInputChange('aircraftType', e.target.value)}
                  required
                  withAsterisk
                  styles={inputStyles}
                  size={isPhone ? 'sm' : 'md'}
                />

                <Stack gap={isPhone ? 'xs' : 'sm'}>
                  <TextInput
                    label="Tail Number"
                    description={isPhone ? undefined : 'Aircraft registration number'}
                    placeholder="e.g., N12345"
                    value={formData.tailNumber}
                    onChange={(e) => handleInputChange('tailNumber', e.target.value.toUpperCase())}
                    required
                    withAsterisk
                    styles={inputStyles}
                    size={isPhone ? 'sm' : 'md'}
                  />

                  <Select
                    label="Category"
                    description={isPhone ? undefined : 'Aircraft classification'}
                    placeholder="Select category"
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value || '')}
                    data={aircraftCategoryOptions}
                    required
                    withAsterisk
                    styles={selectStyles}
                    size={isPhone ? 'sm' : 'md'}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Optional Fields in Accordion */}
            <Accordion
              variant="separated"
              radius="md"
              styles={{
                item: {
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  '&[data-active]': {
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  },
                },
                control: {
                  padding: isPhone ? 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)' : undefined,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                },
                content: {
                  padding: isPhone ? 'var(--mantine-spacing-sm)' : 'var(--mantine-spacing-md)',
                },
              }}
            >
              {/* Identification Section */}
              <Accordion.Item value="identification">
                <Accordion.Control>
                  <Group gap="xs">
                    <FaPlane size={isPhone ? 12 : 14} color="var(--mantine-color-cyan-4)" />
                    <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white">
                      Identification
                    </Text>
                    <Badge size="xs" color="gray" variant="light">
                      Optional
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={isPhone ? 'xs' : 'sm'}>
                    <Stack gap={isPhone ? 'xs' : 'sm'}>
                      <TextInput
                        label="Call Sign"
                        description={isPhone ? undefined : 'Radio call sign if different from tail number'}
                        placeholder="e.g., Skyhawk 123"
                        value={formData.callSign}
                        onChange={(e) => handleInputChange('callSign', e.target.value)}
                        styles={inputStyles}
                        size={isPhone ? 'sm' : 'md'}
                      />

                      <TextInput
                        label="Serial Number"
                        description={isPhone ? undefined : 'Aircraft serial/manufacturer number'}
                        placeholder="e.g., 17265432"
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        styles={inputStyles}
                        size={isPhone ? 'sm' : 'md'}
                      />
                    </Stack>

                    <TextInput
                      label="Home Airport"
                      description={isPhone ? undefined : 'Where this aircraft is normally based'}
                      placeholder="e.g., KJFK or Kennedy Intl"
                      value={formData.aircraftHome}
                      onChange={(e) => handleInputChange('aircraftHome', e.target.value.toUpperCase())}
                      styles={inputStyles}
                      size={isPhone ? 'sm' : 'md'}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Appearance Section */}
              <Accordion.Item value="appearance">
                <Accordion.Control>
                  <Group gap="xs">
                    <FaPalette size={isPhone ? 12 : 14} color="var(--mantine-color-grape-4)" />
                    <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white">
                      Appearance (Colors)
                    </Text>
                    <Badge size="xs" color="gray" variant="light">
                      Optional
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="xs" c="dimmed" mb={isPhone ? 'xs' : 'sm'}>
                    Aircraft colors help identify your aircraft and can be used for search and rescue.
                  </Text>
                  <Stack gap={isPhone ? 'xs' : 'sm'}>
                    <ColorInput
                      label="Primary Color"
                      placeholder="Pick color"
                      value={formData.primaryColor}
                      onChange={(value) => handleInputChange('primaryColor', value)}
                      styles={inputStyles}
                      size={isPhone ? 'sm' : 'md'}
                      swatches={['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ffa500', '#808080']}
                    />
                    <ColorInput
                      label="Secondary Color"
                      placeholder="Pick color"
                      value={formData.color2}
                      onChange={(value) => handleInputChange('color2', value)}
                      styles={inputStyles}
                      size={isPhone ? 'sm' : 'md'}
                      swatches={['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ffa500', '#808080']}
                    />
                    <ColorInput
                      label="Accent Color 1"
                      placeholder="Pick color"
                      value={formData.color3}
                      onChange={(value) => handleInputChange('color3', value)}
                      styles={inputStyles}
                      size={isPhone ? 'sm' : 'md'}
                      swatches={['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ffa500', '#808080']}
                    />
                    <ColorInput
                      label="Accent Color 2"
                      placeholder="Pick color"
                      value={formData.color4}
                      onChange={(value) => handleInputChange('color4', value)}
                      styles={inputStyles}
                      size={isPhone ? 'sm' : 'md'}
                      swatches={['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ffa500', '#808080']}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Performance Section */}
              <Accordion.Item value="performance">
                <Accordion.Control>
                  <Group gap="xs">
                    <FaTachometerAlt size={isPhone ? 12 : 14} color="var(--mantine-color-teal-4)" />
                    <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white">
                      Performance Defaults
                    </Text>
                    <Badge size="xs" color="gray" variant="light">
                      Optional
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={isPhone ? 'xs' : 'sm'}>
                    <Stack gap={isPhone ? 'xs' : 'sm'}>
                      <NumberInput
                        label="Default Cruise Altitude"
                        description={isPhone ? undefined : 'Typical cruising altitude'}
                        placeholder="e.g., 5500"
                        value={formData.defaultCruiseAltitude}
                        onChange={(val) => handleInputChange('defaultCruiseAltitude', val)}
                        min={0}
                        max={60000}
                        suffix=" ft"
                        styles={inputStyles}
                        size={isPhone ? 'sm' : 'md'}
                      />

                      <NumberInput
                        label="Maximum Ceiling"
                        description={isPhone ? undefined : 'Service ceiling of the aircraft'}
                        placeholder="e.g., 14000"
                        value={formData.maxCeiling}
                        onChange={(val) => handleInputChange('maxCeiling', val)}
                        min={0}
                        max={60000}
                        suffix=" ft"
                        styles={inputStyles}
                        size={isPhone ? 'sm' : 'md'}
                      />
                    </Stack>

                    {/* Glider-specific fields */}
                    {isGlider && (
                      <Stack gap={isPhone ? 'xs' : 'sm'}>
                        <NumberInput
                          label="Best Glide Speed"
                          description={isPhone ? undefined : 'Speed for maximum glide range'}
                          placeholder="e.g., 65"
                          value={formData.glideSpeed}
                          onChange={(val) => handleInputChange('glideSpeed', val)}
                          min={0}
                          max={300}
                          suffix=" kts"
                          styles={inputStyles}
                          size={isPhone ? 'sm' : 'md'}
                        />

                        <NumberInput
                          label="Glide Ratio"
                          description={isPhone ? undefined : 'L/D ratio (e.g., 40 means 40:1)'}
                          placeholder="e.g., 40"
                          value={formData.glideRatio}
                          onChange={(val) => handleInputChange('glideRatio', val)}
                          min={0}
                          max={100}
                          decimalScale={1}
                          suffix=":1"
                          styles={inputStyles}
                          size={isPhone ? 'sm' : 'md'}
                        />
                      </Stack>
                    )}

                    {!isGlider && (
                      <Text size="xs" c="dimmed">
                        Glide speed and ratio fields are available when category is set to "Glider".
                      </Text>
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Preferences Section */}
              <Accordion.Item value="preferences">
                <Accordion.Control>
                  <Group gap="xs">
                    <FaCog size={isPhone ? 12 : 14} color="var(--mantine-color-orange-4)" />
                    <Text size={isPhone ? 'xs' : 'sm'} fw={500} c="white">
                      Unit Preferences
                    </Text>
                    <Badge size="xs" color="gray" variant="light">
                      Optional
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="xs" c="dimmed" mb={isPhone ? 'xs' : 'sm'}>
                    Set default units for this aircraft. If not set, system defaults will be used.
                  </Text>
                  <Stack gap={isPhone ? 'xs' : 'sm'}>
                    <Select
                      label="Airspeed Units"
                      description={isPhone ? undefined : 'Preferred speed measurement'}
                      placeholder="Select units"
                      value={formData.airspeedUnits}
                      onChange={(value) => handleInputChange('airspeedUnits', value || '')}
                      data={airspeedUnitsOptions}
                      clearable
                      styles={selectStyles}
                      size={isPhone ? 'sm' : 'md'}
                    />

                    <Select
                      label="Altitude/Distance Units"
                      description={isPhone ? undefined : 'Preferred length measurement'}
                      placeholder="Select units"
                      value={formData.lengthUnits}
                      onChange={(value) => handleInputChange('lengthUnits', value || '')}
                      data={lengthUnitsOptions}
                      clearable
                      styles={selectStyles}
                      size={isPhone ? 'sm' : 'md'}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </ScrollArea.Autosize>

        {/* Footer with action buttons */}
        <Box
          p={isPhone ? 'md' : 'lg'}
          style={{
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Stack gap={isPhone ? 'sm' : 'xs'}>
            {!isPhone && (
              <Text size="xs" c="dimmed">
                Fields marked with <Text span c="red" fw={600}>*</Text> are required
              </Text>
            )}
            <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone}>
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={isLoading}
                size={isPhone ? 'sm' : 'md'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                size={isPhone ? 'sm' : 'md'}
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
        </Box>
      </form>
    </Modal>
  );
};

export default AircraftForm;
