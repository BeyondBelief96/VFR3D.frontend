/**
 * Format a duration in hours to a human-readable string.
 */
export const formatDuration = (hours: number | null | undefined): string => {
  if (!hours) return '--';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Format a wind component (headwind/tailwind) to a human-readable string.
 */
export const formatWindComponent = (headwindKt: number | null | undefined): string => {
  if (headwindKt === null || headwindKt === undefined) return '--';
  const isHeadwind = headwindKt >= 0;
  const abs = Math.abs(headwindKt);
  return `${isHeadwind ? '+' : '-'}${abs.toFixed(0)} kt ${isHeadwind ? 'headwind' : 'tailwind'}`;
};
