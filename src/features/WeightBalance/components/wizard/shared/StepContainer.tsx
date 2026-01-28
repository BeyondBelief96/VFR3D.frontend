import { ReactNode } from 'react';
import { Box, Stack, Title, Text } from '@mantine/core';
import { EducationalTip } from './EducationalTip';

interface StepContainerProps {
  title: string;
  description?: string;
  tip?: {
    title: string;
    content: string;
  };
  children: ReactNode;
}

export function StepContainer({ title, description, tip, children }: StepContainerProps) {
  return (
    <Stack gap="lg">
      <Box>
        <Title order={3} c="gray.1" mb={4}>
          {title}
        </Title>
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
      </Box>

      {tip && <EducationalTip title={tip.title} content={tip.content} />}

      <Box>{children}</Box>
    </Stack>
  );
}
