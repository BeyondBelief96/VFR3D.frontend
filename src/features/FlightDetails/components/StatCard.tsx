import { Paper, Group, Box, Text } from '@mantine/core';
import { getIconBgColor } from '@/constants/colors';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  bgColor?: string;
}

export function StatCard({ icon, label, value, subtext, bgColor = 'blue' }: StatCardProps) {
  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Group gap="md" wrap="nowrap">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: getIconBgColor(bgColor),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {label}
          </Text>
          <Text size="xl" fw={700} c="white">
            {value}
          </Text>
          {subtext && (
            <Text size="xs" c="dimmed">
              {subtext}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  );
}
