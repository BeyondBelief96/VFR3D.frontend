import { Center, Stack, Loader, Text, Box } from '@mantine/core';
import { FaPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  title = 'Loading VFR3D',
  message = 'Get ready to Plan, Fly, Repeat...',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <Center
      h={fullScreen ? '100vh' : '100%'}
      style={{
        backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
        position: fullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Stack align="center" gap="xl">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
            }}
          >
            <motion.div
              animate={{
                y: [-5, 5, -5],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <FaPlane size={40} color="white" style={{ transform: 'rotate(-45deg)' }} />
            </motion.div>
          </Box>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Text
            size="xl"
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          >
            {title}
          </Text>
        </motion.div>

        {/* Loader */}
        <Loader size="lg" color="blue" type="dots" />

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Text size="sm" c="dimmed" ta="center" maw={300}>
            {message}
          </Text>
        </motion.div>
      </Stack>
    </Center>
  );
}

export default LoadingScreen;
