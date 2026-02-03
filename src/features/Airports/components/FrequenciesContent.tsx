import { Center, Group, Loader, Text } from '@mantine/core';
import { CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';
import { FrequencyTable } from '@/components/Frequencies';

interface FrequenciesContentProps {
  frequencies?: CommunicationFrequencyDto[];
  isLoading: boolean;
  isPhone: boolean;
}

export function FrequenciesContent({ frequencies, isLoading, isPhone }: FrequenciesContentProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading frequencies...
          </Text>
        </Group>
      </Center>
    );
  }

  return (
    <FrequencyTable
      frequencies={frequencies}
      variant={isPhone ? 'compact' : 'full'}
      showGroupHeader={true}
      showGroupPaper={true}
    />
  );
}
