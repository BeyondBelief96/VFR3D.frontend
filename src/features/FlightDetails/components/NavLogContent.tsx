import { Stack, Group, Button, Center, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiRefreshCw } from 'react-icons/fi';
import { FaRoute } from 'react-icons/fa';
import { useIsPhone } from '@/hooks';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { useRegenerateNavlogMutation } from '@/redux/api/vfr3d/flights.api';
import { NavLogTable } from '@/features/Flights/FlightPlanningDrawer/NavLogTable';
import { mapFlightToNavlogData } from '@/utility/utils';

interface NavLogContentProps {
  flight: FlightDto;
  userId: string;
}

export function NavLogContent({ flight, userId }: NavLogContentProps) {
  const isPhone = useIsPhone();
  const [regenerateNavlog, { isLoading: isRegenerating }] = useRegenerateNavlogMutation();

  const navlogData = mapFlightToNavlogData(flight);

  const handleRegenerate = async () => {
    if (!flight.id) return;

    try {
      await regenerateNavlog({ userId, flightId: flight.id }).unwrap();
      notifications.show({
        title: 'Nav Log Regenerated',
        message: 'The navigation log has been recalculated with current weather data.',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Regeneration Failed',
        message: 'Unable to regenerate the navigation log.',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Regenerate Button */}
      <Group justify={isPhone ? 'center' : 'flex-end'}>
        <Button
          variant="light"
          color="orange"
          size={isPhone ? 'sm' : 'md'}
          leftSection={<FiRefreshCw size={isPhone ? 14 : 16} />}
          onClick={handleRegenerate}
          loading={isRegenerating}
          fullWidth={isPhone}
        >
          {isPhone ? 'Regenerate' : 'Regenerate Nav Log'}
        </Button>
      </Group>

      {/* Nav Log Table or Empty State */}
      {flight.legs && flight.legs.length > 0 ? (
        <NavLogTable navlog={navlogData} isRoundTrip={false} />
      ) : (
        <Center py="xl">
          <Stack align="center" gap="md">
            <FaRoute size={48} style={{ opacity: 0.3 }} />
            <Text c="dimmed">
              No navigation log available. Click "Regenerate Nav Log" to generate one.
            </Text>
          </Stack>
        </Center>
      )}
    </Stack>
  );
}
