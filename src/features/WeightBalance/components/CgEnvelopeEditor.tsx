import React, { useState } from 'react';
import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Button,
  ActionIcon,
  Paper,
  Text,
  Box,
  Tabs,
  Tooltip,
  Table,
  SegmentedControl,
} from '@mantine/core';
import { FiPlus, FiTrash2, FiMove, FiInfo } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CgEnvelopeDto, CgEnvelopePointDto, ArmUnits, WeightUnits, CgEnvelopeFormat } from '@/redux/api/vfr3d/dtos';
import { ARM_UNIT_LABELS, WEIGHT_UNIT_LABELS } from '../constants/defaults';

interface CgEnvelopeEditorProps {
  envelopes: CgEnvelopeDto[];
  armUnits: ArmUnits;
  weightUnits: WeightUnits;
  onChange: (envelopes: CgEnvelopeDto[]) => void;
}

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
    fontSize: '12px',
  },
};

// Sortable point row component
interface SortablePointRowProps {
  id: string;
  point: CgEnvelopePointDto;
  index: number;
  weightLabel: string;
  xAxisLabel: string;
  format: CgEnvelopeFormat;
  onWeightChange: (value: number) => void;
  onXAxisChange: (value: number) => void;
  onRemove: () => void;
}

function SortablePointRow({
  id,
  point,
  index,
  weightLabel,
  xAxisLabel,
  format,
  onWeightChange,
  onXAxisChange,
  onRemove,
}: SortablePointRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isMomentFormat = format === CgEnvelopeFormat.MomentDividedBy1000;

  // Get the X-axis value based on format
  const xAxisValue = isMomentFormat
    ? point.momentDividedBy1000 ?? ''
    : point.arm ?? '';

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td style={{ width: 40 }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          style={{ cursor: 'grab' }}
          {...attributes}
          {...listeners}
        >
          <FiMove size={12} />
        </ActionIcon>
      </Table.Td>
      <Table.Td style={{ width: 40 }}>
        <Text size="xs" c="dimmed">{index + 1}</Text>
      </Table.Td>
      <Table.Td>
        <NumberInput
          placeholder="0"
          value={point.weight ?? ''}
          onChange={(value) => onWeightChange(Number(value) || 0)}
          min={0}
          styles={inputStyles}
          size="xs"
          rightSection={<Text size="xs" c="dimmed">{weightLabel}</Text>}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          placeholder={isMomentFormat ? "0.0" : "0.0"}
          value={xAxisValue}
          onChange={(value) => onXAxisChange(Number(value) || 0)}
          decimalScale={isMomentFormat ? 1 : 2}
          styles={inputStyles}
          size="xs"
          rightSection={<Text size="xs" c="dimmed">{xAxisLabel}</Text>}
        />
      </Table.Td>
      <Table.Td style={{ width: 40 }}>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          onClick={onRemove}
        >
          <FiTrash2 size={12} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

export const CgEnvelopeEditor: React.FC<CgEnvelopeEditorProps> = ({
  envelopes,
  armUnits,
  weightUnits,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(envelopes.length > 0 ? '0' : null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const armLabel = ARM_UNIT_LABELS[armUnits] || 'in';
  const weightLabel = WEIGHT_UNIT_LABELS[weightUnits] || 'lbs';

  const handleEnvelopeNameChange = (index: number, name: string) => {
    const newEnvelopes = [...envelopes];
    newEnvelopes[index] = { ...newEnvelopes[index], name };
    onChange(newEnvelopes);
  };

  const handleFormatChange = (index: number, format: CgEnvelopeFormat) => {
    const newEnvelopes = [...envelopes];
    const envelope = { ...newEnvelopes[index] };
    const oldFormat = envelope.format;
    envelope.format = format;

    // Migrate existing points to use the correct field for the new format
    if (oldFormat !== format && envelope.limits && envelope.limits.length > 0) {
      const isMomentFormat = format === CgEnvelopeFormat.MomentDividedBy1000;
      envelope.limits = envelope.limits.map(point => {
        // Get the current X value from whichever field has it
        const currentXValue = point.arm ?? point.momentDividedBy1000 ?? 0;

        if (isMomentFormat) {
          // Switching to Moment format - move value to momentDividedBy1000
          return { ...point, momentDividedBy1000: currentXValue, arm: undefined };
        } else {
          // Switching to Arm format - move value to arm
          return { ...point, arm: currentXValue, momentDividedBy1000: undefined };
        }
      });
    }

    newEnvelopes[index] = envelope;
    onChange(newEnvelopes);
  };

  const handlePointChange = (envelopeIndex: number, pointIndex: number, field: keyof CgEnvelopePointDto, value: number) => {
    const newEnvelopes = [...envelopes];
    const envelope = { ...newEnvelopes[envelopeIndex] };
    const points = [...(envelope.limits || [])];
    points[pointIndex] = { ...points[pointIndex], [field]: value };
    envelope.limits = points;
    newEnvelopes[envelopeIndex] = envelope;
    onChange(newEnvelopes);
  };

  // Handler for X-axis value changes that stores in correct field based on format
  const handleXAxisChange = (envelopeIndex: number, pointIndex: number, value: number) => {
    const envelope = envelopes[envelopeIndex];
    const isMomentFormat = envelope.format === CgEnvelopeFormat.MomentDividedBy1000;
    const newEnvelopes = [...envelopes];
    const newEnvelope = { ...newEnvelopes[envelopeIndex] };
    const points = [...(newEnvelope.limits || [])];

    if (isMomentFormat) {
      points[pointIndex] = { ...points[pointIndex], momentDividedBy1000: value, arm: undefined };
    } else {
      points[pointIndex] = { ...points[pointIndex], arm: value, momentDividedBy1000: undefined };
    }

    newEnvelope.limits = points;
    newEnvelopes[envelopeIndex] = newEnvelope;
    onChange(newEnvelopes);
  };

  const handleAddPoint = (envelopeIndex: number) => {
    const newEnvelopes = [...envelopes];
    const envelope = { ...newEnvelopes[envelopeIndex] };
    const points = [...(envelope.limits || [])];
    const isMomentFormat = envelope.format === CgEnvelopeFormat.MomentDividedBy1000;

    if (isMomentFormat) {
      points.push({ weight: 0, arm: undefined, momentDividedBy1000: 0 });
    } else {
      points.push({ weight: 0, arm: 0, momentDividedBy1000: undefined });
    }

    envelope.limits = points;
    newEnvelopes[envelopeIndex] = envelope;
    onChange(newEnvelopes);
  };

  const handleRemovePoint = (envelopeIndex: number, pointIndex: number) => {
    const newEnvelopes = [...envelopes];
    const envelope = { ...newEnvelopes[envelopeIndex] };
    const points = (envelope.limits || []).filter((_, i) => i !== pointIndex);
    envelope.limits = points;
    newEnvelopes[envelopeIndex] = envelope;
    onChange(newEnvelopes);
  };

  const handleDragEnd = (envelopeIndex: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const envelope = envelopes[envelopeIndex];
    const points = envelope.limits || [];
    const oldIndex = points.findIndex((_, i) => `point-${i}` === active.id);
    const newIndex = points.findIndex((_, i) => `point-${i}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newEnvelopes = [...envelopes];
      newEnvelopes[envelopeIndex] = {
        ...newEnvelopes[envelopeIndex],
        limits: arrayMove(points, oldIndex, newIndex),
      };
      onChange(newEnvelopes);
    }
  };

  const handleAddEnvelope = () => {
    const newEnvelope: CgEnvelopeDto = {
      name: envelopes.length === 0 ? 'Normal' : `Envelope ${envelopes.length + 1}`,
      format: CgEnvelopeFormat.Arm,
      limits: [],
    };
    onChange([...envelopes, newEnvelope]);
    setActiveTab(String(envelopes.length));
  };

  const handleRemoveEnvelope = (index: number) => {
    const newEnvelopes = envelopes.filter((_, i) => i !== index);
    onChange(newEnvelopes);
    if (activeTab === String(index)) {
      setActiveTab(newEnvelopes.length > 0 ? '0' : null);
    } else if (Number(activeTab) > index) {
      setActiveTab(String(Number(activeTab) - 1));
    }
  };

  // Sort points clockwise starting from top-left (highest weight, lowest x-axis value)
  const handleSortPoints = (envelopeIndex: number) => {
    const envelope = envelopes[envelopeIndex];
    const points = [...(envelope.limits || [])];

    if (points.length < 3) return;

    const isMomentFormat = envelope.format === CgEnvelopeFormat.MomentDividedBy1000;

    // Helper to get X value based on format
    const getX = (p: CgEnvelopePointDto) =>
      isMomentFormat ? (p.momentDividedBy1000 || 0) : (p.arm || 0);

    // Find centroid
    const centroid = {
      weight: points.reduce((sum, p) => sum + (p.weight || 0), 0) / points.length,
      x: points.reduce((sum, p) => sum + getX(p), 0) / points.length,
    };

    // Sort by angle from centroid (clockwise from top)
    points.sort((a, b) => {
      const angleA = Math.atan2(getX(a) - centroid.x, (a.weight || 0) - centroid.weight);
      const angleB = Math.atan2(getX(b) - centroid.x, (b.weight || 0) - centroid.weight);
      return angleB - angleA;
    });

    const newEnvelopes = [...envelopes];
    newEnvelopes[envelopeIndex] = { ...newEnvelopes[envelopeIndex], limits: points };
    onChange(newEnvelopes);
  };

  return (
    <Stack gap="md">
      {envelopes.length === 0 ? (
        <Paper
          p="lg"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.3)',
            border: '1px dashed rgba(148, 163, 184, 0.3)',
            borderRadius: 'var(--mantine-radius-md)',
          }}
        >
          <Stack align="center" gap="sm">
            <Text size="sm" c="dimmed" ta="center">
              No CG envelopes defined. Add at least one envelope to define safe weight and balance limits.
            </Text>
            <Button
              variant="light"
              size="sm"
              leftSection={<FiPlus size={14} />}
              onClick={handleAddEnvelope}
            >
              Add Envelope
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            styles={{
              tab: {
                color: 'var(--mantine-color-gray-4)',
                '&[data-active]': {
                  color: 'white',
                  borderColor: 'var(--vfr3d-primary)',
                },
              },
              panel: {
                paddingTop: 'var(--mantine-spacing-md)',
              },
            }}
          >
            <Group justify="space-between" align="flex-end" mb="xs">
              <Tabs.List>
                {envelopes.map((envelope, index) => (
                  <Tabs.Tab key={index} value={String(index)}>
                    {envelope.name || `Envelope ${index + 1}`}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<FiPlus size={12} />}
                onClick={handleAddEnvelope}
              >
                Add
              </Button>
            </Group>

            {envelopes.map((envelope, envelopeIndex) => (
              <Tabs.Panel key={envelopeIndex} value={String(envelopeIndex)}>
                <Paper
                  p="md"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: 'var(--mantine-radius-md)',
                  }}
                >
                  <Stack gap="md">
                    {/* Envelope name and format */}
                    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                      <Group gap="md" align="flex-end">
                        <TextInput
                          label="Envelope Name"
                          placeholder="e.g., Normal, Utility"
                          value={envelope.name || ''}
                          onChange={(e) => handleEnvelopeNameChange(envelopeIndex, e.target.value)}
                          styles={inputStyles}
                          size="sm"
                          style={{ minWidth: 180 }}
                        />
                        <Box>
                          <Text size="xs" c="gray.4" mb={4}>X-Axis Format</Text>
                          <SegmentedControl
                            size="xs"
                            value={envelope.format || CgEnvelopeFormat.Arm}
                            onChange={(value) => handleFormatChange(envelopeIndex, value as CgEnvelopeFormat)}
                            data={[
                              { label: 'CG Arm', value: CgEnvelopeFormat.Arm },
                              { label: 'Moment ÷ 1000', value: CgEnvelopeFormat.MomentDividedBy1000 },
                            ]}
                            styles={{
                              root: {
                                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                              },
                              label: {
                                color: 'var(--mantine-color-gray-4)',
                                '&[data-active]': {
                                  color: 'white',
                                },
                              },
                            }}
                          />
                        </Box>
                      </Group>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        leftSection={<FiTrash2 size={12} />}
                        onClick={() => handleRemoveEnvelope(envelopeIndex)}
                      >
                        Delete Envelope
                      </Button>
                    </Group>

                    {/* Points section */}
                    <Box>
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <Text size="sm" c="white" fw={500}>
                            Boundary Points
                          </Text>
                          <Tooltip
                            label={
                              envelope.format === CgEnvelopeFormat.MomentDividedBy1000
                                ? "Enter points as Weight vs Moment÷1000. Moment÷1000 = (Weight × Arm) ÷ 1000. Use values from your POH loading graph. Points should form a closed shape."
                                : "Define the polygon boundary of the CG envelope. Points should form a closed shape around the acceptable CG range. Drag to reorder or use 'Auto-sort' to arrange clockwise."
                            }
                            multiline
                            w={300}
                          >
                            <ActionIcon variant="subtle" size="xs">
                              <FiInfo size={12} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                        {(envelope.limits || []).length >= 3 && (
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => handleSortPoints(envelopeIndex)}
                          >
                            Auto-sort Clockwise
                          </Button>
                        )}
                      </Group>

                      {envelope.format === CgEnvelopeFormat.MomentDividedBy1000 && (
                        <Text size="xs" c="yellow" mb="xs">
                          Enter MOMENT ÷ 1000 values (in {weightLabel}-{armLabel}) from your POH loading graph.
                        </Text>
                      )}

                      {(() => {
                        const isMomentFormat = envelope.format === CgEnvelopeFormat.MomentDividedBy1000;
                        const xAxisHeader = isMomentFormat
                          ? `Moment ÷ 1000 (${weightLabel}-${armLabel})`
                          : `CG Arm (${armLabel})`;
                        const xAxisLabel = isMomentFormat ? '' : armLabel;

                        return (envelope.limits || []).length === 0 ? (
                          <Text size="sm" c="dimmed" ta="center" py="md">
                            Add points to define the envelope boundary. Minimum 3 points required.
                          </Text>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(envelopeIndex, e)}
                          >
                            <SortableContext
                              items={(envelope.limits || []).map((_, i) => `point-${i}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              <Table
                                horizontalSpacing="xs"
                                verticalSpacing="xs"
                                styles={{
                                  table: {
                                    backgroundColor: 'transparent',
                                  },
                                  th: {
                                    color: 'var(--mantine-color-gray-5)',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                                  },
                                  td: {
                                    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                                  },
                                }}
                              >
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th style={{ width: 40 }}></Table.Th>
                                    <Table.Th style={{ width: 40 }}>#</Table.Th>
                                    <Table.Th>Weight ({weightLabel})</Table.Th>
                                    <Table.Th>{xAxisHeader}</Table.Th>
                                    <Table.Th style={{ width: 40 }}></Table.Th>
                                  </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                  {(envelope.limits || []).map((point, pointIndex) => (
                                    <SortablePointRow
                                      key={`point-${pointIndex}`}
                                      id={`point-${pointIndex}`}
                                      point={point}
                                      index={pointIndex}
                                      weightLabel={weightLabel}
                                      xAxisLabel={xAxisLabel}
                                      format={envelope.format || CgEnvelopeFormat.Arm}
                                      onWeightChange={(value) => handlePointChange(envelopeIndex, pointIndex, 'weight', value)}
                                      onXAxisChange={(value) => handleXAxisChange(envelopeIndex, pointIndex, value)}
                                      onRemove={() => handleRemovePoint(envelopeIndex, pointIndex)}
                                    />
                                  ))}
                                </Table.Tbody>
                              </Table>
                            </SortableContext>
                          </DndContext>
                        );
                      })()}

                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<FiPlus size={12} />}
                        onClick={() => handleAddPoint(envelopeIndex)}
                        mt="sm"
                      >
                        Add Point
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </Tabs.Panel>
            ))}
          </Tabs>
        </>
      )}
    </Stack>
  );
};

export default CgEnvelopeEditor;
