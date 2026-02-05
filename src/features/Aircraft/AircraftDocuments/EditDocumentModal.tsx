import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Text,
  FileInput,
  Box,
  Badge,
  Divider,
} from '@mantine/core';
import { FiSave, FiFile } from 'react-icons/fi';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';
import { DocumentCategory, AircraftDocumentListDto } from '@/redux/api/vfr3d/dtos';
import {
  useGetAircraftDocumentQuery,
  useUpdateAircraftDocumentMutation,
  useReplaceAircraftDocumentMutation,
} from '@/redux/api/vfr3d/aircraftDocuments.api';
import { useIsPhone, useIsTablet } from '@/hooks';
import { notifyError, notifySuccess, notifyWarning } from '@/utility/notifications';
import {
  getCategoryLabel,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  formatFileSize,
  validateFile,
  getFileIcon,
  getCategoryColor,
} from './utils';

interface EditDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
  aircraftId: string;
  document: AircraftDocumentListDto | null;
}

const categoryOptions = Object.values(DocumentCategory).map((cat) => ({
  value: cat,
  label: getCategoryLabel(cat),
}));

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  opened,
  onClose,
  userId,
  aircraftId,
  document,
}) => {
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.Other);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Fetch full document details when editing
  const { data: fullDocument } = useGetAircraftDocumentQuery(
    { userId, aircraftId, documentId: document?.id || '' },
    { skip: !opened || !document?.id }
  );

  const [updateDocument, { isLoading: isUpdating }] = useUpdateAircraftDocumentMutation();
  const [replaceDocument, { isLoading: isReplacing }] = useReplaceAircraftDocumentMutation();

  const isLoading = isUpdating || isReplacing;

  // Populate form when document data loads
  useEffect(() => {
    if (fullDocument) {
      setDisplayName(fullDocument.displayName || '');
      setCategory(fullDocument.category || DocumentCategory.Other);
      setDescription(fullDocument.description || '');
    } else if (document) {
      // Use list item data as fallback
      setDisplayName(document.displayName || '');
      setCategory(document.category || DocumentCategory.Other);
      setDescription('');
    }
  }, [fullDocument, document]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setDisplayName('');
      setCategory(DocumentCategory.Other);
      setDescription('');
      setFile(null);
      setFileError(null);
    }
  }, [opened]);

  const handleFileChange = (newFile: File | null) => {
    setFileError(null);
    if (newFile) {
      const validation = validateFile(newFile);
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        setFile(null);
        return;
      }
    }
    setFile(newFile);
  };

  const handleSubmit = async () => {
    if (!document?.id) return;

    if (!displayName.trim()) {
      notifyWarning('Validation Error', 'Please enter a display name');
      return;
    }

    try {
      // If a new file is selected, replace the file first
      if (file) {
        await replaceDocument({
          userId,
          aircraftId,
          documentId: document.id,
          file,
        }).unwrap();
      }

      // Update metadata
      await updateDocument({
        userId,
        aircraftId,
        documentId: document.id,
        request: {
          displayName: displayName.trim(),
          category,
          description: description.trim() || undefined,
        },
      }).unwrap();

      notifySuccess(
        'Document Updated',
        file
          ? 'Document file and metadata have been updated.'
          : 'Document metadata has been updated.'
      );
      onClose();
    } catch (error) {
      notifyError({ error, operation: 'update document' });
    }
  };

  const FileIcon = document ? getFileIcon(document.contentType) : FiFile;
  const categoryColor = document ? getCategoryColor(document.category) : 'gray';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Document"
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
        {/* Current document info */}
        {document && (
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
                <Text c="dimmed" size="xs">
                  Current file
                </Text>
                <Text c="white" size={isPhone ? 'sm' : 'md'} lineClamp={1}>
                  {document.fileName}
                </Text>
                <Group gap="xs" mt={4}>
                  <Badge size="xs" variant="light" color={categoryColor}>
                    {getCategoryLabel(document.category)}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {formatFileSize(document.fileSizeBytes)}
                  </Text>
                </Group>
              </Box>
            </Group>
          </Box>
        )}

        <TextInput
          label="Display Name"
          placeholder="Enter a name for the document"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          size={isPhone ? 'md' : 'sm'}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
              '&::placeholder': {
                color: 'var(--mantine-color-gray-5)',
              },
            },
            label: {
              color: 'var(--mantine-color-gray-3)',
            },
          }}
        />

        <Select
          label="Category"
          placeholder="Select a category"
          required
          value={category}
          onChange={(value) => setCategory(value as DocumentCategory)}
          data={categoryOptions}
          size={isPhone ? 'md' : 'sm'}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
            },
            label: {
              color: 'var(--mantine-color-gray-3)',
            },
            dropdown: {
              backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
            option: {
              '&[data-selected]': {
                backgroundColor: 'var(--mantine-color-blue-9)',
              },
              '&[data-hovered]': {
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
              },
            },
          }}
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          size={isPhone ? 'md' : 'sm'}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
              '&::placeholder': {
                color: 'var(--mantine-color-gray-5)',
              },
            },
            label: {
              color: 'var(--mantine-color-gray-3)',
            },
          }}
        />

        <Divider
          label="Replace File (Optional)"
          labelPosition="center"
          color="rgba(148, 163, 184, 0.2)"
          styles={{
            label: {
              color: 'var(--mantine-color-gray-5)',
              fontSize: isPhone ? '0.75rem' : '0.8rem',
            },
          }}
        />

        <FileInput
          placeholder="Select a new file to replace the current one"
          value={file}
          onChange={handleFileChange}
          accept={ACCEPTED_EXTENSIONS}
          leftSection={<FiFile size={isPhone ? 16 : 18} />}
          error={fileError}
          size={isPhone ? 'md' : 'sm'}
          clearable
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderColor: fileError ? 'var(--mantine-color-red-6)' : 'rgba(148, 163, 184, 0.2)',
              color: 'white',
              '&::placeholder': {
                color: 'var(--mantine-color-gray-5)',
              },
            },
          }}
        />

        <Text size="xs" c="dimmed">
          Max file size: {formatFileSize(MAX_FILE_SIZE_BYTES)}. Leave empty to keep the current
          file.
        </Text>

        <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone} mt="sm">
          <Button variant="subtle" color={BUTTON_COLORS.SECONDARY} onClick={onClose} size={isPhone ? 'md' : 'sm'}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={BUTTON_GRADIENTS.PRIMARY}
            onClick={handleSubmit}
            loading={isLoading}
            leftSection={<FiSave size={isPhone ? 16 : 14} />}
            size={isPhone ? 'md' : 'sm'}
          >
            {file ? 'Save & Replace File' : 'Save Changes'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditDocumentModal;
