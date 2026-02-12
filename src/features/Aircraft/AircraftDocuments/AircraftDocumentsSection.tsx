import React, { useState } from 'react';
import { Box, Button, Collapse, Stack, Text, SimpleGrid, Loader, Center } from '@mantine/core';
import { FiChevronDown, FiChevronUp, FiPlus, FiFileText } from 'react-icons/fi';
import { AircraftDocumentListDto } from '@/redux/api/vfr3d/dtos';
import { SURFACE_INNER } from '@/constants/surfaces';
import {
  useGetAircraftDocumentsQuery,
  useLazyGetAircraftDocumentUrlQuery,
} from '@/redux/api/vfr3d/aircraftDocuments.api';
import { useIsPhone } from '@/hooks';
import { DocumentListItem } from './DocumentListItem';
import { UploadDocumentModal } from './UploadDocumentModal';
import { EditDocumentModal } from './EditDocumentModal';
import { DeleteDocumentModal } from './DeleteDocumentModal';

interface AircraftDocumentsSectionProps {
  userId: string;
  aircraftId: string;
  expanded: boolean;
  onToggle: () => void;
}

export const AircraftDocumentsSection: React.FC<AircraftDocumentsSectionProps> = ({
  userId,
  aircraftId,
  expanded,
  onToggle,
}) => {
  const isPhone = useIsPhone();

  // Fetch documents
  const { data: documents = [], isLoading, isFetching } = useGetAircraftDocumentsQuery(
    { userId, aircraftId },
    { skip: !userId || !aircraftId }
  );

  // Lazy query for getting presigned URL
  const [getDocumentUrl, { isFetching: isLoadingUrl }] = useLazyGetAircraftDocumentUrlQuery();

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AircraftDocumentListDto | null>(null);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);

  const handleView = async (document: AircraftDocumentListDto) => {
    if (!document.id) return;

    setViewingDocumentId(document.id);
    try {
      const result = await getDocumentUrl({ userId, aircraftId, documentId: document.id }).unwrap();
      if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      // Error notification is handled by RTK Query
    } finally {
      setViewingDocumentId(null);
    }
  };

  const handleEdit = (document: AircraftDocumentListDto) => {
    setSelectedDocument(document);
    setEditModalOpen(true);
  };

  const handleDelete = (document: AircraftDocumentListDto) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedDocument(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <>
      <Box>
        <Button
          variant="subtle"
          color="gray"
          size={isPhone ? 'xs' : 'sm'}
          fullWidth
          justify="space-between"
          rightSection={
            expanded ? (
              <FiChevronUp size={isPhone ? 14 : 16} />
            ) : (
              <FiChevronDown size={isPhone ? 14 : 16} />
            )
          }
          onClick={onToggle}
          styles={{
            root: {
              backgroundColor: SURFACE_INNER.DEFAULT,
              padding: isPhone ? '8px 12px' : undefined,
              '&:hover': {
                backgroundColor: SURFACE_INNER.DARK,
              },
            },
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-xs)',
            }}
          >
            <FiFileText size={isPhone ? 12 : 14} />
            <Text size={isPhone ? 'xs' : 'sm'} c="white">
              Documents ({documents.length})
            </Text>
          </Box>
        </Button>

        <Collapse in={expanded}>
          <Stack gap={isPhone ? 'xs' : 'sm'} mt={isPhone ? 'xs' : 'sm'}>
            {isLoading ? (
              <Center py="md">
                <Loader size="sm" color="blue" />
              </Center>
            ) : documents.length === 0 ? (
              <Text size={isPhone ? 'xs' : 'sm'} c="dimmed" ta="center" py={isPhone ? 'sm' : 'md'}>
                No documents uploaded
              </Text>
            ) : (
              <SimpleGrid cols={1} spacing="xs">
                {documents.map((doc) => (
                  <DocumentListItem
                    key={doc.id}
                    document={doc}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoadingUrl && viewingDocumentId === doc.id}
                  />
                ))}
              </SimpleGrid>
            )}

            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              size="xs"
              leftSection={<FiPlus size={isPhone ? 12 : 14} />}
              onClick={() => setUploadModalOpen(true)}
              fullWidth={isPhone}
              loading={isFetching && !isLoading}
            >
              Add Document
            </Button>
          </Stack>
        </Collapse>
      </Box>

      {/* Modals */}
      <UploadDocumentModal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        userId={userId}
        aircraftId={aircraftId}
      />

      <EditDocumentModal
        opened={editModalOpen}
        onClose={closeEditModal}
        userId={userId}
        aircraftId={aircraftId}
        document={selectedDocument}
      />

      <DeleteDocumentModal
        opened={deleteModalOpen}
        onClose={closeDeleteModal}
        userId={userId}
        aircraftId={aircraftId}
        document={selectedDocument}
      />
    </>
  );
};

export default AircraftDocumentsSection;
