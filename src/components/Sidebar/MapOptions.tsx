import { Stack, Select, Text, Slider, Box } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  setImageryAlpha,
  setImageryBrightness,
  setSelectedLayer,
  setGlobeMaximumScreenSpaceError,
} from '@/redux/slices/viewerSlice';
import { IMAGERY_LAYER_OPTIONS } from '@/utility/constants';

export function MapOptions() {
  const dispatch = useAppDispatch();
  const { selectedImageryLayer, currentImageryAlpha, currentImageryBrightness, globeMaximumScreenSpaceError } =
    useAppSelector((state) => state.viewer);

  const layerOptions = IMAGERY_LAYER_OPTIONS.map((option) => ({
    value: option.layerName,
    label: option.displayLabel,
  }));

  return (
    <Stack gap="md">
      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          Aviation Chart Layer
        </Text>
        <Select
          data={layerOptions}
          value={selectedImageryLayer}
          onChange={(value) => value && dispatch(setSelectedLayer(value))}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
            },
            dropdown: {
              backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
          }}
        />
      </Box>

      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          Chart Opacity: {Math.round(currentImageryAlpha * 100)}%
        </Text>
        <Slider
          value={currentImageryAlpha}
          onChange={(value) => dispatch(setImageryAlpha(value))}
          min={0}
          max={1}
          step={0.01}
          marks={[
            { value: 0, label: '0%' },
            { value: 0.5, label: '50%' },
            { value: 1, label: '100%' },
          ]}
          styles={{
            mark: { display: 'none' },
            markLabel: { fontSize: 10, marginTop: 4, color: 'var(--mantine-color-gray-6)' },
          }}
        />
      </Box>

      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          Chart Brightness: {Math.round(currentImageryBrightness * 100)}%
        </Text>
        <Slider
          value={currentImageryBrightness}
          onChange={(value) => dispatch(setImageryBrightness(value))}
          min={0}
          max={2}
          step={0.01}
          marks={[
            { value: 0, label: '0%' },
            { value: 1, label: '100%' },
            { value: 2, label: '200%' },
          ]}
          styles={{
            mark: { display: 'none' },
            markLabel: { fontSize: 10, marginTop: 4, color: 'var(--mantine-color-gray-6)' },
          }}
        />
      </Box>

      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          Globe Detail Level: {globeMaximumScreenSpaceError.toFixed(1)}
        </Text>
        <Slider
          value={globeMaximumScreenSpaceError}
          onChange={(value) => dispatch(setGlobeMaximumScreenSpaceError(value))}
          min={1}
          max={4}
          step={0.1}
          marks={[
            { value: 1, label: 'High' },
            { value: 2.5, label: 'Med' },
            { value: 4, label: 'Low' },
          ]}
          styles={{
            mark: { display: 'none' },
            markLabel: { fontSize: 10, marginTop: 4, marginBottom: 4, color: 'var(--mantine-color-gray-6)' },
          }}
        />
        <Text size="xs" c="white" mt={10}>
          Lower values = more detail (uses more memory)
        </Text>
      </Box>
    </Stack>
  );
}

export default MapOptions;
