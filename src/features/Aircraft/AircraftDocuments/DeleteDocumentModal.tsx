import React from 'react';
import { Modal, Stack, Button, Group, Text, Alert, Box, Badge } from '@mantine/core';
import { FiAlertTriangle } from 'react-icons/fi';
import { AircraftDocumentListDto } from '@/redux/api/vfr3d/dtos';
import { useDeleteAircraftDocumentMutation } from '@/redux/api/vfr3d/aircraftDocuments.api';
import { useIsPhone, useIsTablet } from '@/hooks';
import { notifications } from '@mantine/notifications';
import { formatFileSize, getFileIcon, getCategoryColor, getCategoryLabel, formatDate } from './utils';

interface DeleteDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
  aircraftId: string;
  document: AircraftDocumentListDto | null;
}

export const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({
  opened,
  onClose,
  userId,
  aircraftId,
  document,
}) => {
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [deleteDocument, { isLoading }] = useDeleteAircraftDocumentMutation();

  const handleDelete = async () => {
    if (!document?.id) return;

    try {
      await deleteDocument({
        userId,
        aircraftId,
        documentId: document.id,
      }).unwrap();

      notifications.show({
        title: 'Document Deleted',
        message: 'The document has been deleted.',
        color: 'green',
      });

      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { title?: string; detail?: string } };
      const errorMessage = err?.data?.title || err?.data?.detail || 'Delete failed';
      notifications.show({
        title: 'Delete Failed',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const FileIcon = document ? getFileIcon(document.contentType) : null;
  const categoryColor = document ? getCategoryColor(document.category) : 'gray';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Document"
      centered
      size={isPhone ? '100%' : isTablet ? 'lg' : 'md'}
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
          padding: isPhone ? '16px' : '20px',
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
      <Stack gap={isPhone ? 'sm' : 'md'}>
        {/* Document preview */}
        {document && FileIcon && (
          <Box
            p={isPhone ? 'sm' : 'md'}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <Box
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: 'var(--mantine-radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileIcon size={18} color="var(--mantine-color-blue-5)" />
              </Box>
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Text c="white" fw={600} size={isPhone ? 'sm' : 'md'} lineClamp={1}>
                  {document.displayName || document.fileName}
                </Text>
                <Group gap="xs" mt={4} wrap="wrap">
                  <Badge size="xs" variant="light" color={categoryColor}>
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
          </Box>
        )}

        <Alert color="orange" variant="light" icon={<FiAlertTriangle size={isPhone ? 14 : 16} />}>
          <Text size={isPhone ? 'xs' : 'sm'}>
            This will permanently delete the document. This action cannot be undone.
          </Text>
        </Alert>

        <Text c="dimmed" size={isPhone ? 'xs' : 'sm'}>
          Are you sure you want to delete this document?
        </Text>

        <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone} mt="sm">
          <Button variant="subtle" color="gray" onClick={onClose} size={isPhone ? 'md' : 'sm'}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={isLoading} size={isPhone ? 'md' : 'sm'}>
            Delete Document
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DeleteDocumentModal;
