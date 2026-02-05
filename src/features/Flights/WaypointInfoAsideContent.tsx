import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, TextInput, Text, Group, Button, Stack, ActionIcon, Badge, ScrollArea } from '@mantine/core';
import { WaypointDto, WaypointType } from '@/redux/api/vfr3d/dtos';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { FlightDisplayMode } from '@/utility/enums';
import { addWaypoint, removeWaypoint, updateWaypointName } from '@/redux/slices/flightPlanningSlice';
import { clearSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { FiX } from 'react-icons/fi';
import { FaPlane, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import classes from './WaypointInfoAsideContent.module.css';
import { ACTION_ICON_COLORS, BUTTON_COLORS } from '@/constants/colors';
import { THEME_COLORS } from '@/constants/surfaces';

interface WaypointInfoAsideContentProps {
  selectedWaypoint: WaypointDto;
  onClose: () => void;
}

const WaypointInfoAsideContent: React.FC<WaypointInfoAsideContentProps> = ({ selectedWaypoint, onClose }) => {
  const dispatch = useDispatch();
  const { draftFlightPlan, displayMode } = useSelector((s: RootState) => s.flightPlanning);
  const selectedContext = useSelector((s: RootState) => s.selectedEntity.context);
  const isExisting = selectedContext?.mode === 'existing';
  const isCalculatedPoint = selectedContext?.isCalculatedPoint || selectedWaypoint.waypointType === WaypointType.CalculatedPoint;
  const isPreviewMode = displayMode === FlightDisplayMode.PREVIEW;
  const canEdit = (displayMode === FlightDisplayMode.PLANNING || displayMode === FlightDisplayMode.EDITING) && !isCalculatedPoint;

  const waypointName = selectedWaypoint.name?.toLowerCase() || '';
  const isToc = waypointName.includes('toc') || waypointName.includes('top of climb');
  const isTod = waypointName.includes('tod') || waypointName.includes('top of descent');
  const initialName = isExisting
    ? selectedWaypoint.name || ''
    : 'New waypoint';
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const { latitude, longitude } = selectedWaypoint;

  const originalName = useMemo(() => (isExisting ? selectedContext?.originalName ?? selectedWaypoint.name ?? '' : ''), [isExisting, selectedContext?.originalName, selectedWaypoint.name]);
  const hasNameChanged = isExisting ? name.trim() !== (originalName || '') : false;

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!canEdit) return;
      if (isExisting) {
        if (hasNameChanged) {
          saveEdit();
        }
      } else {
        if (name.trim()) {
          addSmart();
        }
      }
    }
  };

  useEffect(() => {
    if (!isExisting && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isExisting]);

  const addSmart = () => {
    if (!draftFlightPlan.waypoints || draftFlightPlan.waypoints.length === 0) {
      dispatch(
        addWaypoint({
          waypoint: { ...selectedWaypoint, id: `wp-${Date.now()}`, name, waypointType: WaypointType.Custom },
          index: 0,
        })
      );
      dispatch(clearSelectedEntity());
      return;
    }

    if (typeof selectedContext?.insertIndex === 'number') {
      dispatch(
        addWaypoint({
          waypoint: { ...selectedWaypoint, id: `wp-${Date.now()}`, name, waypointType: WaypointType.Custom },
          index: Math.max(0, Math.min(selectedContext.insertIndex, draftFlightPlan.waypoints.length)),
        })
      );
      dispatch(clearSelectedEntity());
      return;
    }

    let bestIndex = draftFlightPlan.waypoints.length;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < draftFlightPlan.waypoints.length - 1; i++) {
      const a = draftFlightPlan.waypoints[i];
      const b = draftFlightPlan.waypoints[i + 1];
      const score = distanceNm(a, selectedWaypoint) + distanceNm(selectedWaypoint, b);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = i + 1;
      }
    }

    dispatch(
      addWaypoint({
        waypoint: { ...selectedWaypoint, id: `wp-${Date.now()}`, name, waypointType: WaypointType.Custom },
        index: bestIndex,
      })
    );
    dispatch(clearSelectedEntity());
  };

  const cancel = () => dispatch(clearSelectedEntity());

  const saveEdit = () => {
    if (!name.trim() || selectedContext?.mode !== 'existing' || !selectedContext?.waypointId) {
      dispatch(clearSelectedEntity());
      return;
    }
    dispatch(updateWaypointName({ id: selectedContext.waypointId, name }));
    dispatch(clearSelectedEntity());
  };

  const deleteExisting = () => {
    if (selectedContext?.mode === 'existing' && selectedContext?.waypointId) {
      dispatch(removeWaypoint(selectedContext.waypointId));
    }
    dispatch(clearSelectedEntity());
  };

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between">
          <Group gap="xs">
            {isToc && <FaArrowUp size={14} color={THEME_COLORS.SUCCESS} />}
            {isTod && <FaArrowDown size={14} color={THEME_COLORS.ICON_ORANGE} />}
            {!isToc && !isTod && isCalculatedPoint && <FaPlane size={14} color={THEME_COLORS.CYAN_5} />}
            <Text fw={600}>
              {isToc ? 'Top of Climb' : isTod ? 'Top of Descent' : 'Waypoint'}
            </Text>
          </Group>
          <ActionIcon variant="subtle" color={ACTION_ICON_COLORS.CLOSE} onClick={onClose}>
            <FiX size={18} />
          </ActionIcon>
        </Group>
        {isCalculatedPoint && (
          <Badge
            size="xs"
            variant="light"
            color={isToc ? 'green' : isTod ? 'orange' : 'cyan'}
            mt="xs"
          >
            Calculated Point
          </Badge>
        )}
      </Box>

      {/* Content */}
      <ScrollArea flex={1} scrollbarSize={6}>
        <Stack gap="sm" p="md">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Name
            </Text>
            {canEdit ? (
              <TextInput
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter name"
                size="sm"
              />
            ) : (
              <Text size="sm" fw={500}>
                {selectedWaypoint.name || ''}
              </Text>
            )}
          </Box>

          <Group grow>
            <Box>
              <Text size="xs" c="dimmed">
                Latitude
              </Text>
              <Text size="sm" ff="monospace">
                {latitude?.toFixed(6)}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed">
                Longitude
              </Text>
              <Text size="sm" ff="monospace">
                {longitude?.toFixed(6)}
              </Text>
            </Box>
          </Group>

          {(isPreviewMode || isCalculatedPoint) && selectedWaypoint.altitude !== undefined && (
            <Box>
              <Text size="xs" c="dimmed">
                Altitude
              </Text>
              <Text size="sm" fw={500} c={isToc ? 'green.4' : isTod ? 'orange.4' : undefined}>
                {Math.round(selectedWaypoint.altitude).toLocaleString()} ft MSL
              </Text>
            </Box>
          )}

          {canEdit && (
            isExisting ? (
              <Group gap="sm" mt="xs">
                <Button size="xs" onClick={saveEdit} disabled={!hasNameChanged}>
                  Save
                </Button>
                <Button size="xs" color={BUTTON_COLORS.DESTRUCTIVE} variant="light" onClick={deleteExisting}>
                  Delete
                </Button>
              </Group>
            ) : (
              <Group gap="sm" mt="xs">
                <Button size="xs" onClick={addSmart} disabled={!name.trim()}>
                  Add to route
                </Button>
                <Button size="xs" variant="light" onClick={cancel}>
                  Cancel
                </Button>
              </Group>
            )
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

function distanceNm(a: WaypointDto, b: WaypointDto): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const Rnm = 3440.065;
  const dLat = toRad((b.latitude ?? 0) - (a.latitude ?? 0));
  const dLon = toRad((b.longitude ?? 0) - (a.longitude ?? 0));
  const lat1 = toRad(a.latitude ?? 0);
  const lat2 = toRad(b.latitude ?? 0);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Rnm * c;
}

export default WaypointInfoAsideContent;
