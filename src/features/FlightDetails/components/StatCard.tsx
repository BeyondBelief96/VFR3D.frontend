import { Paper, Group, Box, Text } from '@mantine/core';
import { useIsPhone } from '@/hooks';
import { getIconBgColor } from '@/constants/colors';
import { SURFACE, BORDER } from '@/constants/surfaces';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  bgColor?: string;
}

export function StatCard({ icon, label, value, subtext, bgColor = 'blue' }: StatCardProps) {
  const isPhone = useIsPhone();
  const iconSize = isPhone ? 36 : 48;

  return (
    <Paper
      p={isPhone ? 'sm' : 'md'}
      style={{
        backgroundColor: SURFACE.CARD,
        border: `1px solid ${BORDER.SUBTLE}`,
      }}
    >
      <Group gap={isPhone ? 'sm' : 'md'} wrap="nowrap">
        <Box
          style={{
            width: iconSize,
            height: iconSize,
            minWidth: iconSize,
            borderRadius: '50%',
            backgroundColor: getIconBgColor(bgColor),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} lineClamp={1}>
            {label}
          </Text>
          <Text size={isPhone ? 'lg' : 'xl'} fw={700} c="white" lineClamp={1}>
            {value}
          </Text>
          {subtext && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {subtext}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  );
}
