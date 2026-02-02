import { Box, Text } from '@mantine/core';

interface QuickStatProps {
  label: string;
  value: string;
  highlight?: boolean;
}

/**
 * Quick Stat for header (desktop)
 */
export function QuickStat({ label, value, highlight }: QuickStatProps) {
  return (
    <Box ta="center">
      <Text size="xs" c="blue.3" tt="uppercase" fw={500}>
        {label}
      </Text>
      <Text size="xl" c={highlight ? 'yellow' : 'white'} fw={700}>
        {value}
      </Text>
    </Box>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  highlight?: boolean;
}

/**
 * Stat Box for mobile card
 */
export function StatBox({ label, value, highlight }: StatBoxProps) {
  return (
    <Box ta="center">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
        {label}
      </Text>
      <Text size="lg" c={highlight ? 'yellow' : 'white'} fw={600}>
        {value}
      </Text>
    </Box>
  );
}
