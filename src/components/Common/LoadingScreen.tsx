import { Center, Stack, Loader, Text, Image } from '@mantine/core';
import { motion } from 'framer-motion';
import logo from '@/assets/images/logo_2.png';
import classes from './LoadingScreen.module.css';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Preparing your flight experience...',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <Center
      className={`${classes.container} ${fullScreen ? classes.containerFullScreen : classes.containerRelative}`}
    >
      <Stack align="center" gap="lg">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image src={logo} alt="VFR3D" w={220} fit="contain" />
          </motion.div>
        </motion.div>

        {/* Loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Loader size="md" color="blue" type="bars" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Text size="sm" c="dimmed" ta="center" maw={280}>
            {message}
          </Text>
        </motion.div>
      </Stack>
    </Center>
  );
}

export default LoadingScreen;
