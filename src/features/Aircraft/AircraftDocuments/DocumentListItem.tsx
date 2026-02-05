import React from 'react';
import { Paper, Group, Box, Text, Badge, ActionIcon, Stack, Tooltip } from '@mantine/core';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { AircraftDocumentListDto } from '@/redux/api/vfr3d/dtos';
import { useIsPhone } from '@/hooks';
import { SURFACE_INNER, ICON_BG, THEME_COLORS } from '@/constants/surfaces';
import {
  formatFileSize,
  formatDate,
  getFileIcon,
  getCategoryColor,
  getCategoryLabel,
} from './utils';

interface DocumentListItemProps {
  document: AircraftDocumentListDto;
  onView: (document: AircraftDocumentListDto) => void;
  onEdit: (document: AircraftDocumentListDto) => void;
  onDelete: (document: AircraftDocumentListDto) => void;
  isLoading?: boolean;
}

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  onView,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const isPhone = useIsPhone();
  const FileIcon = getFileIcon(document.contentType);
  const categoryColor = getCategoryColor(document.category);

  if (isPhone) {
    return (
      <Paper
        p="sm"
        style={{
          backgroundColor: SURFACE_INNER.DEFAULT,
          borderRadius: 'var(--mantine-radius-md)',
        }}
      >
        <Stack gap="xs">
          {/* Top row: icon, name, category */}
          <Group gap="xs" wrap="nowrap">
            <Box
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: 'var(--mantine-radius-sm)',
                backgroundColor: ICON_BG.BLUE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileIcon size={20} color={THEME_COLORS.PRIMARY} />
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} c="white" lineClamp={2}>
                {document.displayName || document.fileName}
              </Text>
              <Group gap="xs" mt={2}>
                <Badge size="xs" variant="light" color={categoryColor}>
                  {getCategoryLabel(document.category)}
                </Badge>
              </Group>
            </Box>
          </Group>

          {/* Metadata row */}
          <Text size="xs" c="dimmed">
            {formatFileSize(document.fileSizeBytes)} &bull; {formatDate(document.uploadedAt)}
          </Text>

          {/* Action buttons */}
          <Group gap="xs">
            <Tooltip label="View/Download" position="top" withArrow>
              <ActionIcon
                size="xl"
                variant="light"
                color="blue"
                onClick={() => onView(document)}
                loading={isLoading}
              >
                <FiExternalLink size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit" position="top" withArrow>
              <ActionIcon
                size="xl"
                variant="light"
                color="gray"
                onClick={() => onEdit(document)}
              >
                <FiEdit2 size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete" position="top" withArrow>
              <ActionIcon
                size="xl"
                variant="light"
                color="red"
                onClick={() => onDelete(document)}
              >
                <FiTrash2 size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Paper>
    );
  }

  // Desktop layout
  return (
    <Paper
      p="md"
      style={{
        backgroundColor: SURFACE_INNER.DEFAULT,
        borderRadius: 'var(--mantine-radius-md)',
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        {/* Left: icon + name + metadata */}
        <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <Box
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 'var(--mantine-radius-sm)',
              backgroundColor: ICON_BG.BLUE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileIcon size={22} color={THEME_COLORS.PRIMARY} />
          </Box>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text size="sm" fw={500} c="white">
              {document.displayName || document.fileName}
            </Text>
            <Group gap="sm" mt={4}>
              <Badge size="sm" variant="light" color={categoryColor}>
                {getCategoryLabel(document.category)}
              </Badge>
              <Text size="xs" c="dimmed">
                {formatFileSize(document.fileSizeBytes)}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDate(document.uploadedAt)}
              </Text>
            </Group>
          </Box>
        </Group>

        {/* Right: action buttons */}
        <Group gap="sm" wrap="nowrap">
          <Tooltip label="View/Download" position="top" withArrow>
            <ActionIcon
              size="lg"
              variant="light"
              color="blue"
              onClick={() => onView(document)}
              loading={isLoading}
            >
              <FiExternalLink size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit" position="top" withArrow>
            <ActionIcon
              size="lg"
              variant="light"
              color="gray"
              onClick={() => onEdit(document)}
            >
              <FiEdit2 size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete" position="top" withArrow>
            <ActionIcon
              size="lg"
              variant="light"
              color="red"
              onClick={() => onDelete(document)}
            >
              <FiTrash2 size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
};

export default DocumentListItem;
