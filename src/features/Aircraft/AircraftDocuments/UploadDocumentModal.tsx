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
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';
import { MODAL_STYLES, SURFACE_INNER, BORDER, HIGHLIGHT, THEME_COLORS } from '@/constants/surfaces';
import { DocumentCategory } from '@/redux/api/vfr3d/dtos';
import { useUploadAircraftDocumentMutation } from '@/redux/api/vfr3d/aircraftDocuments.api';
import { useIsPhone, useIsTablet } from '@/hooks';
import { notifyError, notifySuccess, notifyWarning } from '@/utility/notifications';
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
      notifyWarning('Validation Error', 'Please enter a display name');
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

      notifySuccess('Document Uploaded', 'Your document has been uploaded successfully.');
      onClose();
    } catch (error) {
      notifyError({ error, operation: 'upload document' });
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
          ...MODAL_STYLES.header,
          padding: isPhone ? '12px 16px' : '16px 20px',
        },
        title: {
          fontWeight: 600,
          color: 'white',
          fontSize: isPhone ? '1rem' : undefined,
        },
        body: {
          ...MODAL_STYLES.body,
          padding: isPhone ? '16px' : '20px',
        },
        content: MODAL_STYLES.content,
        close: MODAL_STYLES.close,
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
              backgroundColor: SURFACE_INNER.DEFAULT,
              borderColor: fileError ? THEME_COLORS.ERROR : BORDER.DEFAULT,
              color: 'white',
              '&::placeholder': {
                color: THEME_COLORS.TEXT_MUTED,
              },
            },
            label: {
              color: THEME_COLORS.TEXT,
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
              backgroundColor: SURFACE_INNER.DEFAULT,
              borderColor: BORDER.DEFAULT,
              color: 'white',
              '&::placeholder': {
                color: THEME_COLORS.TEXT_MUTED,
              },
            },
            label: {
              color: THEME_COLORS.TEXT,
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
              backgroundColor: SURFACE_INNER.DEFAULT,
              borderColor: BORDER.DEFAULT,
              color: 'white',
            },
            label: {
              color: THEME_COLORS.TEXT,
            },
            dropdown: {
              backgroundColor: THEME_COLORS.SURFACE_8,
              borderColor: BORDER.DEFAULT,
            },
            option: {
              '&[data-selected]': {
                backgroundColor: THEME_COLORS.PRIMARY,
              },
              '&[data-hovered]': {
                backgroundColor: HIGHLIGHT.LIGHT,
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
              backgroundColor: SURFACE_INNER.DEFAULT,
              borderColor: BORDER.DEFAULT,
              color: 'white',
              '&::placeholder': {
                color: THEME_COLORS.TEXT_MUTED,
              },
            },
            label: {
              color: THEME_COLORS.TEXT,
            },
          }}
        />

        {fileError && (
          <Alert color="red" variant="light" icon={<FiAlertCircle size={16} />}>
            {fileError}
          </Alert>
        )}

        <Group justify={isPhone ? 'center' : 'flex-end'} gap="sm" grow={isPhone} mt="sm">
          <Button variant="subtle" color={BUTTON_COLORS.SECONDARY} onClick={onClose} size={isPhone ? 'md' : 'sm'}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={BUTTON_GRADIENTS.PRIMARY}
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
