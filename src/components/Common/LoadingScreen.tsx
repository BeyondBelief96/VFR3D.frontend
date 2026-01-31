import { Center, Stack, Loader, Text, Box } from '@mantine/core';
import { FaPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import classes from './LoadingScreen.module.css';

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
      className={`${classes.container} ${fullScreen ? classes.containerFullScreen : classes.containerRelative}`}
    >
      <Stack align="center" gap="xl">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box className={classes.logoBox}>
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
              <FaPlane size={40} color="white" className={classes.planeIcon} />
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
