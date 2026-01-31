import React from 'react';
import { Center, Stack, Loader, Text, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { FaPlane } from 'react-icons/fa';

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
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
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
              <FaPlane size={32} color="var(--mantine-color-vfr3dBlue-5)" />
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
