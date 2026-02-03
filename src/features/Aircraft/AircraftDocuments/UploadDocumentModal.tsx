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
  Alert,
} from '@mantine/core';
import { FiUpload, FiFile, FiAlertCircle } from 'react-icons/fi';
import { DocumentCategory } from '@/redux/api/vfr3d/dtos';
import { useUploadAircraftDocumentMutation } from '@/redux/api/vfr3d/aircraftDocuments.api';
import { useIsPhone, useIsTablet } from '@/hooks';
import { notifications } from '@mantine/notifications';
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  formatFileSize,
  validateFile,
  getCategoryLabel,
} from './utils';

interface UploadDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  userId: string;
  aircraftId: string;
}

const categoryOptions = Object.values(DocumentCategory).map((cat) => ({
  value: cat,
  label: getCategoryLabel(cat),
}));

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  opened,
  onClose,
  userId,
  aircraftId,
}) => {
  const isPhone = useIsPhone();
  const isTablet = useIsTablet();

  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.Other);
  const [description, setDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploadDocument, { isLoading }] = useUploadAircraftDocumentMutation();

  // Auto-populate display name from filename
  useEffect(() => {
    if (file && !displayName) {
      // Remove extension from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setDisplayName(nameWithoutExt);
    }
  }, [file, displayName]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setFile(null);
      setDisplayName('');
      setCategory(DocumentCategory.Other);
      setDescription('');
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
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    if (!displayName.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please enter a display name',
        color: 'red',
      });
      return;
    }

    try {
      await uploadDocument({
        userId,
        aircraftId,
        file,
        displayName: displayName.trim(),
        category,
        description: description.trim() || undefined,
      }).unwrap();

      notifications.show({
        title: 'Document Uploaded',
        message: 'Your document has been uploaded successfully.',
        color: 'green',
      });

      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { title?: string; detail?: string } };
      const errorMessage = err?.data?.title || err?.data?.detail || 'Upload failed';
      notifications.show({
        title: 'Upload Failed',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload Document"
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
        <FileInput
          label="File"
          placeholder="Select a file to upload"
          required
          value={file}
          onChange={handleFileChange}
          accept={ACCEPTED_EXTENSIONS}
          leftSection={<FiFile size={isPhone ? 16 : 18} />}
          error={fileError}
          size={isPhone ? 'md' : 'sm'}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderColor: fileError ? 'var(--mantine-color-red-6)' : 'rgba(148, 163, 184, 0.2)',
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

        <Text size="xs" c="dimmed">
          Max file size: {formatFileSize(MAX_FILE_SIZE_BYTES)}. Accepted: PDF, images, Word docs,
          text files.
        </Text>

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

        {fileError && (
          <Alert color="red" variant="light" icon={<FiAlertCircle size={16} />}>
            {fileError}
          </Alert>
        )}

        <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone} mt="sm">
          <Button variant="subtle" color="gray" onClick={onClose} size={isPhone ? 'md' : 'sm'}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            onClick={handleSubmit}
            loading={isLoading}
            leftSection={<FiUpload size={isPhone ? 16 : 14} />}
            size={isPhone ? 'md' : 'sm'}
          >
            Upload
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default UploadDocumentModal;
