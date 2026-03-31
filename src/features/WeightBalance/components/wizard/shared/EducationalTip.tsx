import { useState } from 'react';
import { Paper, Text, Group, Collapse, UnstyledButton, ThemeIcon } from '@mantine/core';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaLightbulb } from 'react-icons/fa';
import { GRADIENT, HIGHLIGHT, THEME_COLORS } from '@/constants/surfaces';

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
        background: GRADIENT.TIP,
        border: `1px solid ${HIGHLIGHT.STRONG}`,
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
              style={{ background: HIGHLIGHT.DEFAULT }}
            >
              <FaLightbulb size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm" c="blue.3">
              {title}
            </Text>
          </Group>
          {isExpanded ? (
            <FiChevronUp size={16} style={{ color: THEME_COLORS.BLUE_4 }} />
          ) : (
            <FiChevronDown size={16} style={{ color: THEME_COLORS.BLUE_4 }} />
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
