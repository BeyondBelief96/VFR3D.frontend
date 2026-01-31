import { Stack, Text, Box, ColorSwatch, Group, Popover, Button } from '@mantine/core';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setLineColor, setEndPointColor } from '@/redux/slices/routeStyleSlice';
import { rgbaToHex } from '@/utility/utils';
import { Color } from 'cesium';

export function RouteOptions() {
  const dispatch = useAppDispatch();
  const { lineColor, pointColor } = useAppSelector((state) => state.routeStyle);
  const [linePickerOpen, setLinePickerOpen] = useState(false);
  const [pointPickerOpen, setPointPickerOpen] = useState(false);

  const handleLineColorChange = (hex: string) => {
    try {
      const color = Color.fromCssColorString(hex);
      const colorString = `rgba(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)}, ${color.alpha})`;
      dispatch(setLineColor(colorString));
    } catch {
      // Invalid color
    }
  };

  const handlePointColorChange = (hex: string) => {
    try {
      const color = Color.fromCssColorString(hex);
      const colorString = `rgba(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)}, ${color.alpha})`;
      dispatch(setEndPointColor(colorString));
    } catch {
      // Invalid color
    }
  };

  return (
    <Stack gap="md">
      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" c="dimmed">
            Route Line Color
          </Text>
          <Popover opened={linePickerOpen} onChange={setLinePickerOpen} position="bottom-end">
            <Popover.Target>
              <ColorSwatch
                color={lineColor}
                onClick={() => setLinePickerOpen((o) => !o)}
                style={{ cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
                size={28}
              />
            </Popover.Target>
            <Popover.Dropdown
              style={{ backgroundColor: 'var(--mantine-color-vfr3dSurface-8)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
            >
              <Stack gap="sm">
                <HexColorPicker color={rgbaToHex(lineColor)} onChange={handleLineColorChange} />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {rgbaToHex(lineColor)}
                  </Text>
                  <Button size="xs" variant="subtle" onClick={() => setLinePickerOpen(false)}>
                    Done
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
        <Text size="xs" c="dimmed">
          Color used for the flight route polyline
        </Text>
      </Box>

      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" c="dimmed">
            Waypoint Color
          </Text>
          <Popover opened={pointPickerOpen} onChange={setPointPickerOpen} position="bottom-end">
            <Popover.Target>
              <ColorSwatch
                color={pointColor}
                onClick={() => setPointPickerOpen((o) => !o)}
                style={{ cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
                size={28}
              />
            </Popover.Target>
            <Popover.Dropdown
              style={{ backgroundColor: 'var(--mantine-color-vfr3dSurface-8)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
            >
              <Stack gap="sm">
                <HexColorPicker color={rgbaToHex(pointColor)} onChange={handlePointColorChange} />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {rgbaToHex(pointColor)}
                  </Text>
                  <Button size="xs" variant="subtle" onClick={() => setPointPickerOpen(false)}>
                    Done
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
        <Text size="xs" c="dimmed">
          Color used for waypoint markers
        </Text>
      </Box>
    </Stack>
  );
}

export default RouteOptions;
