import { Stack, Select, Text, Slider, Box, Switch, Group } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  setImageryAlpha,
  setImageryBrightness,
  setSelectedLayer,
  setGlobeMaximumScreenSpaceError,
  setTerrainFogDensity,
  setTerrainEnabled,
} from '@/redux/slices/viewerSlice';
import { IMAGERY_LAYER_OPTIONS } from '@/utility/constants';
import { SURFACE, BORDER, THEME_COLORS } from '@/constants/surfaces';

export function MapOptions() {
  const dispatch = useAppDispatch();
  const {
    selectedImageryLayer,
    currentImageryAlpha,
    currentImageryBrightness,
    globeMaximumScreenSpaceError,
    terrainFogDensity = 4,
    terrainEnabled,
  } = useAppSelector((state) => state.viewer);

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
              backgroundColor: SURFACE.INPUT,
              borderColor: BORDER.DEFAULT,
              color: 'white',
            },
            dropdown: {
              backgroundColor: THEME_COLORS.SURFACE_8,
              borderColor: BORDER.DEFAULT,
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
            markLabel: { fontSize: 10, marginTop: 4, color: THEME_COLORS.GRAY_6 },
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
            markLabel: { fontSize: 10, marginTop: 4, color: THEME_COLORS.GRAY_6 },
          }}
        />
      </Box>

      <Box>
        <Text size="sm" c="dimmed" mb={4}>
          Chart Detail Level: {globeMaximumScreenSpaceError.toFixed(1)}
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
            markLabel: { fontSize: 10, marginTop: 4, marginBottom: 4, color: THEME_COLORS.GRAY_6 },
          }}
        />
        <Text size="xs" c="white" mt={10}>
          Lower values = more detail (uses more memory)
        </Text>
      </Box>

      <Box>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            3D Terrain
          </Text>
          <Switch
            checked={terrainEnabled}
            onChange={(event) => dispatch(setTerrainEnabled(event.currentTarget.checked))}
            size="sm"
            color="vfr3dBlue"
          />
        </Group>
        <Text size="xs" c="white" mt={4}>
          Renders real-world elevation data (ArcGIS World Elevation)
        </Text>
      </Box>

      {terrainEnabled && (
        <Box>
          <Text size="sm" c="dimmed" mb={4}>
            Terrain Fog: {terrainFogDensity.toFixed(1)}
          </Text>
          <Slider
            value={terrainFogDensity}
            onChange={(value) => dispatch(setTerrainFogDensity(value))}
            min={1}
            max={8}
            step={0.5}
            marks={[
              { value: 1, label: 'Light' },
              { value: 4, label: 'Med' },
              { value: 8, label: 'Heavy' },
            ]}
            styles={{
              mark: { display: 'none' },
              markLabel: { fontSize: 10, marginTop: 4, marginBottom: 4, color: THEME_COLORS.GRAY_6 },
            }}
          />
          <Text size="xs" c="white" mt={10}>
            Heavier fog skips loading distant terrain tiles for better performance
          </Text>
        </Box>
      )}
    </Stack>
  );
}

export default MapOptions;
