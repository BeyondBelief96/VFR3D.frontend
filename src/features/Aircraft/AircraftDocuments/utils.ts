import { DocumentCategory } from '@/redux/api/vfr3d/dtos';
import { FiFile, FiFileText, FiImage } from 'react-icons/fi';
import { IconType } from 'react-icons';

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return 'Unknown';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get icon component for file type based on content type
 */
export function getFileIcon(contentType?: string): IconType {
  if (!contentType) return FiFile;

  if (contentType === 'application/pdf') {
    return FiFileText;
  }

  if (contentType.startsWith('image/')) {
    return FiImage;
  }

  if (
    contentType === 'application/msword' ||
    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return FiFile;
  }

  return FiFile;
}

/**
 * Get color for document category badge
 */
export function getCategoryColor(category?: DocumentCategory): string {
  switch (category) {
    case DocumentCategory.POH:
      return 'blue';
    case DocumentCategory.Manual:
      return 'cyan';
    case DocumentCategory.Checklist:
      return 'teal';
    case DocumentCategory.Maintenance:
      return 'orange';
    case DocumentCategory.Insurance:
      return 'grape';
    case DocumentCategory.Registration:
      return 'green';
    case DocumentCategory.Other:
    default:
      return 'gray';
  }
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(category?: DocumentCategory): string {
  switch (category) {
    case DocumentCategory.POH:
      return 'POH';
    case DocumentCategory.Manual:
      return 'Manual';
    case DocumentCategory.Checklist:
      return 'Checklist';
    case DocumentCategory.Maintenance:
      return 'Maintenance';
    case DocumentCategory.Insurance:
      return 'Insurance';
    case DocumentCategory.Registration:
      return 'Registration';
    case DocumentCategory.Other:
    default:
      return 'Other';
  }
}

/**
 * Maximum file size in bytes (100 MB)
 */
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Accepted file types for document upload
 */
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

/**
 * File extension mapping for accept attribute
 */
export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt';

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${formatFileSize(MAX_FILE_SIZE_BYTES)}`,
    };
  }

  // Check file type
  const isAcceptedType = ACCEPTED_FILE_TYPES.includes(file.type);
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.split(',').some((ext) =>
    file.name.toLowerCase().endsWith(ext.replace('.', ''))
  );

  if (!isAcceptedType && !hasAcceptedExtension) {
    return {
      valid: false,
      error: 'File type not supported. Please upload a PDF, image, or document file.',
    };
  }

  return { valid: true };
}

/**
 * Format date for display
 */
export function formatDate(date?: Date | string): string {
  if (!date) return 'Unknown';

  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
