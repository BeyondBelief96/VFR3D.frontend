import React from 'react';
import { Alert, List, Text, Stack } from '@mantine/core';
import { FiAlertCircle } from 'react-icons/fi';

export interface ValidationErrorsProps {
  /** Validation errors from the API response */
  errors?: Record<string, string[]>;
  /** Optional mapping of field names to user-friendly labels */
  fieldLabels?: Record<string, string>;
  /** Optional title override (defaults to "Please fix the following errors:") */
  title?: string;
}

/**
 * Displays validation errors from an API response in a user-friendly format
 *
 * @example
 * const { getFieldErrors } = useApiError();
 *
 * <ValidationErrors
 *   errors={getFieldErrors(submitError)}
 *   fieldLabels={{ tailNumber: 'Tail Number', aircraftType: 'Aircraft Type' }}
 * />
 */
export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  fieldLabels = {},
  title = 'Please fix the following errors:',
}) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  /**
   * Convert a field name to a user-friendly label
   */
  const getFieldLabel = (fieldName: string): string => {
    // Check for custom label
    if (fieldLabels[fieldName]) {
      return fieldLabels[fieldName];
    }

    // Handle nested field names (e.g., "waypoints[0].name")
    const cleanName = fieldName
      .replace(/\[\d+\]/g, '') // Remove array indices
      .split('.')
      .pop() || fieldName; // Get the last part

    // Convert camelCase/PascalCase to Title Case
    return cleanName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Flatten all errors into a single list with field context
  const allErrors: Array<{ field: string; message: string }> = [];

  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach((message) => {
      allErrors.push({ field, message });
    });
  });

  // Group errors: show field name only if there are multiple fields
  const hasMultipleFields = Object.keys(errors).length > 1;

  return (
    <Alert
      color="red"
      variant="light"
      icon={<FiAlertCircle size={18} />}
      title={title}
    >
      <Stack gap="xs" mt="xs">
        {hasMultipleFields ? (
          // Show errors grouped by field
          Object.entries(errors).map(([field, messages]) => (
            <div key={field}>
              <Text size="sm" fw={600} c="red.7">
                {getFieldLabel(field)}:
              </Text>
              <List size="sm" withPadding>
                {messages.map((message, idx) => (
                  <List.Item key={idx}>
                    <Text size="sm">{message}</Text>
                  </List.Item>
                ))}
              </List>
            </div>
          ))
        ) : (
          // Single field - just show the messages
          <List size="sm" withPadding={false}>
            {allErrors.map((error, idx) => (
              <List.Item key={idx}>
                <Text size="sm">{error.message}</Text>
              </List.Item>
            ))}
          </List>
        )}
      </Stack>
    </Alert>
  );
};

export default ValidationErrors;
