import { CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';

/**
 * Comprehensive frequency use translations (full names for detail views)
 */
export const FREQUENCY_USE_TRANSLATIONS: Record<string, string> = {
  'APCH/P': 'Approach',
  'DEP/P': 'Departure',
  'LCL/P': 'Tower',
  'GND/P': 'Ground',
  'CD PRE TAXI CLNC': 'Clearance Delivery',
  'CD/P': 'Clearance',
  'D-ATIS': 'ATIS',
  UNICOM: 'UNICOM',
  CTAF: 'CTAF',
  EMERG: 'Emergency',
  'APP/DEP': 'Approach/Departure',
};

/**
 * Abbreviated frequency use translations (for compact displays like popups)
 */
export const FREQUENCY_USE_ABBREVIATIONS: Record<string, string> = {
  'APCH/P': 'APCH',
  'DEP/P': 'DEP',
  'LCL/P': 'TWR',
  'GND/P': 'GND',
  'CD PRE TAXI CLNC': 'CD',
  'CD/P': 'CD',
  'D-ATIS': 'ATIS',
  UNICOM: 'UNICOM',
  CTAF: 'CTAF',
  EMERG: 'EMERG',
  'APP/DEP': 'APP/DEP',
};

/**
 * Sort order for frequency groups (most important first)
 */
export const FREQUENCY_SORT_ORDER = [
  'CTAF',
  'UNICOM',
  'Tower',
  'Ground',
  'Clearance Delivery',
  'Clearance',
  'ATIS',
  'Approach',
  'Departure',
  'Approach/Departure',
  'Emergency',
];

/**
 * Translate a raw frequency use code to its full display name
 * @param freqUse - The raw frequency use code from the API
 * @returns The human-readable translation or the original value if no translation exists
 */
export const translateFrequencyUse = (freqUse: string | null | undefined): string => {
  return FREQUENCY_USE_TRANSLATIONS[freqUse || ''] || freqUse || 'Other';
};

/**
 * Translate a raw frequency use code to its abbreviated form
 * @param freqUse - The raw frequency use code from the API
 * @returns The abbreviated translation or the original value if no translation exists
 */
export const abbreviateFrequencyUse = (freqUse: string | null | undefined): string => {
  return FREQUENCY_USE_ABBREVIATIONS[freqUse || ''] || freqUse || 'Unknown';
};

/**
 * Sort frequency group names according to the standard order
 * @param groups - Array of translated frequency group names
 * @returns Sorted array with known groups first in priority order, then unknown groups alphabetically
 */
export const sortFrequencyGroups = (groups: string[]): string[] => {
  return groups.sort((a, b) => {
    const indexA = FREQUENCY_SORT_ORDER.indexOf(a);
    const indexB = FREQUENCY_SORT_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

/**
 * Group frequencies by their translated use type
 * @param frequencies - Array of communication frequency DTOs
 * @returns Object with translated use names as keys and arrays of frequencies as values
 */
export const groupFrequenciesByUse = (
  frequencies: CommunicationFrequencyDto[]
): Record<string, CommunicationFrequencyDto[]> => {
  return frequencies.reduce(
    (acc, freq) => {
      const use = translateFrequencyUse(freq.frequencyUse ?? '');
      if (!acc[use]) acc[use] = [];
      acc[use].push(freq);
      return acc;
    },
    {} as Record<string, CommunicationFrequencyDto[]>
  );
};

/**
 * Sort raw frequencies by their importance/use priority
 * @param frequencies - Array of communication frequency DTOs
 * @returns Sorted array with frequencies ordered by importance
 */
export const sortFrequencies = (frequencies: CommunicationFrequencyDto[]): CommunicationFrequencyDto[] => {
  const rawOrder = [
    'APCH/P',
    'DEP/P',
    'LCL/P',
    'GND/P',
    'EMERG',
    'UNICOM',
    'CTAF',
    'CD PRE TAXI CLNC',
    'CD/P',
    'D-ATIS',
    'APP/DEP',
    'ALCP',
  ];

  return [...frequencies].sort((a, b) => {
    const indexA = rawOrder.indexOf(a.frequencyUse ?? '');
    const indexB = rawOrder.indexOf(b.frequencyUse ?? '');
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};
