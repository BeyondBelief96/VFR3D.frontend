import { useMediaQuery } from '@mantine/hooks';

export type DeviceType = 'phone' | 'tablet' | 'desktop';

export const DEVICE_BREAKPOINTS = {
  phone: 768, // < 768px
  tablet: 1024, // 768px - 1024px
  desktop: 1024, // > 1024px
} as const;

/**
 * Returns the current device type based on screen width.
 * SSR-safe - defaults to 'desktop' on server.
 */
export function useDeviceType(): DeviceType {
  // Check if we're on a phone (< 768px)
  const isPhone = useMediaQuery(`(max-width: ${DEVICE_BREAKPOINTS.phone - 1}px)`, false);
  // Check if we're on a tablet (768px - 1024px)
  const isTablet = useMediaQuery(
    `(min-width: ${DEVICE_BREAKPOINTS.phone}px) and (max-width: ${DEVICE_BREAKPOINTS.tablet}px)`,
    false
  );

  if (isPhone) return 'phone';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Returns true if the current device is a phone (< 768px).
 * SSR-safe - defaults to false on server.
 */
export function useIsPhone(): boolean {
  return useMediaQuery(`(max-width: ${DEVICE_BREAKPOINTS.phone - 1}px)`, false) ?? false;
}

/**
 * Returns true if the current device is a tablet (768px - 1024px).
 * SSR-safe - defaults to false on server.
 */
export function useIsTablet(): boolean {
  return (
    useMediaQuery(
      `(min-width: ${DEVICE_BREAKPOINTS.phone}px) and (max-width: ${DEVICE_BREAKPOINTS.tablet}px)`,
      false
    ) ?? false
  );
}

/**
 * Returns true if the current device is a desktop (> 1024px).
 * SSR-safe - defaults to true on server.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${DEVICE_BREAKPOINTS.desktop + 1}px)`, true) ?? true;
}
