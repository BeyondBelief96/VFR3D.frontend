import React from 'react';
import { Center, Stack, Loader, Text, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { FaPlane } from 'react-icons/fa';
import { THEME_COLORS, GRADIENT } from '@/constants/surfaces';

export const FlightPlanCalculationLoading: React.FC = () => {
  return (
    <Center py="xl">
      <Stack align="center" gap="lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: GRADIENT.ICON,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              animate={{
                x: [0, 10, 0, -10, 0],
                y: [0, -5, 0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <FaPlane size={32} color={THEME_COLORS.PRIMARY} />
            </motion.div>
          </Box>
        </motion.div>

        <Stack align="center" gap="xs">
          <Loader size="md" color="blue" type="dots" />
          <Text size="lg" fw={500} c="white">
            Calculating Navigation Log
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={280}>
            Processing route, fetching weather data, and calculating performance...
          </Text>
        </Stack>
      </Stack>
    </Center>
  );
};

export default FlightPlanCalculationLoading;
