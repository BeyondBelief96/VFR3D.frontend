import { useState } from 'react';
import { Paper, Text, Group, Collapse, UnstyledButton, ThemeIcon } from '@mantine/core';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';

interface EducationalTipProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export function EducationalTip({ title, content, defaultExpanded = true }: EducationalTipProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}
    >
      <UnstyledButton onClick={() => setIsExpanded(!isExpanded)} style={{ width: '100%' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon
              size="md"
              radius="xl"
              variant="light"
              color="blue"
              style={{ background: 'rgba(59, 130, 246, 0.2)' }}
            >
              <FaLightbulb size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm" c="blue.3">
              {title}
            </Text>
          </Group>
          {isExpanded ? (
            <FiChevronUp size={16} style={{ color: 'var(--mantine-color-blue-4)' }} />
          ) : (
            <FiChevronDown size={16} style={{ color: 'var(--mantine-color-blue-4)' }} />
          )}
        </Group>
      </UnstyledButton>

      <Collapse in={isExpanded}>
        <Text size="sm" c="dimmed" mt="sm" style={{ lineHeight: 1.6 }}>
          {content}
        </Text>
      </Collapse>
    </Paper>
  );
}
