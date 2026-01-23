import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Group,
  Stack,
  Stepper,
  Text,
  Paper,
} from '@mantine/core';
import {
  FiMapPin,
  FiClock,
  FiTable,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { BottomDrawer } from '@/components/Common/BottomDrawer';
import { FlightRouteBuilder } from '@/features/Flights';
import { RootState, AppDispatch } from '@/redux/store';
import {
  updateDraftPlanSettings,
  resetToPlanning,
  clearDraftWaypoints,
  addWaypoint,
} from '@/redux/slices/flightPlanningSlice';
import { FlightDisplayMode } from '@/utility/enums';
import { WaypointDto } from '@/redux/api/vfr3d/dtos';

// Step enum for clarity
enum FlightPlannerStep {
  ROUTE_BUILDING = 0,
  AIRCRAFT = 1,
  DATE_AND_ALTITUDE = 2,
  NAVLOG_PREVIEW = 3,
}

export const FlightPlanningDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);

  const {
    displayMode,
    draftFlightPlan: {
      waypoints: flightPlanRoute,
      currentStep,
      canCalculateNavlog,
    },
  } = useSelector((state: RootState) => state.flightPlanning);

  // Update canCalculateNavlog based on route
  useEffect(() => {
    const navlogCalcEnabled = flightPlanRoute.length >= 2;
    dispatch(updateDraftPlanSettings({ canCalculateNavlog: navlogCalcEnabled }));
  }, [dispatch, flightPlanRoute]);

  // Auto-generate flight name from waypoints
  useEffect(() => {
    if (flightPlanRoute.length >= 2) {
      const startName = flightPlanRoute[0].name ?? '';
      const endName = flightPlanRoute[flightPlanRoute.length - 1].name ?? '';
      const outbound = `${startName} → ${endName}`;
      dispatch(updateDraftPlanSettings({ name: outbound }));
    }
  }, [dispatch, flightPlanRoute]);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleNextStep = () => {
    if (currentStep < 3) {
      dispatch(updateDraftPlanSettings({ currentStep: currentStep + 1 }));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      dispatch(updateDraftPlanSettings({ currentStep: currentStep - 1 }));
    }
  };

  const handleRoutePointsChange = (points: WaypointDto[]) => {
    dispatch(clearDraftWaypoints());
    points.forEach((point, index) => {
      dispatch(addWaypoint({ waypoint: point, index }));
    });
  };

  const handleResetPlanning = () => {
    dispatch(resetToPlanning());
  };

  const isEditable =
    displayMode === FlightDisplayMode.PLANNING ||
    displayMode === FlightDisplayMode.EDITING;

  // Step definitions
  const steps = [
    { label: 'Route', icon: <FiMapPin size={16} /> },
    { label: 'Aircraft', icon: <FaPlane size={14} /> },
    { label: 'Time & Alt', icon: <FiClock size={16} /> },
    { label: 'Nav Log', icon: <FiTable size={16} /> },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case FlightPlannerStep.ROUTE_BUILDING:
        return (
          <FlightRouteBuilder
            routePoints={flightPlanRoute}
            onRoutePointsChange={handleRoutePointsChange}
            disabled={!isEditable}
          />
        );
      case FlightPlannerStep.AIRCRAFT:
        return (
          <Paper p="xl" ta="center" withBorder>
            <FaPlane size={48} style={{ opacity: 0.3 }} />
            <Text size="lg" fw={500} mt="md">
              Aircraft Selection
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Aircraft performance profiles coming soon...
            </Text>
          </Paper>
        );
      case FlightPlannerStep.DATE_AND_ALTITUDE:
        return (
          <Paper p="xl" ta="center" withBorder>
            <FiClock size={48} style={{ opacity: 0.3 }} />
            <Text size="lg" fw={500} mt="md">
              Departure Time & Altitude
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Set your departure time and cruising altitude...
            </Text>
          </Paper>
        );
      case FlightPlannerStep.NAVLOG_PREVIEW:
        return (
          <Paper p="xl" ta="center" withBorder>
            <FiTable size={48} style={{ opacity: 0.3 }} />
            <Text size="lg" fw={500} mt="md">
              Navigation Log
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              Your calculated navigation log will appear here...
            </Text>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <BottomDrawer
      isOpen={isOpen}
      toggleOpen={toggleDrawer}
      title="Flight Planner"
    >
      <Stack h="100%" gap={0}>
        {/* Stepper */}
        <Box px="md" py="sm" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Stepper
            active={currentStep}
            onStepClick={(step) => {
              if (step <= currentStep) {
                dispatch(updateDraftPlanSettings({ currentStep: step }));
              }
            }}
            size="sm"
            styles={{
              step: {
                padding: 0,
              },
              stepIcon: {
                borderWidth: 2,
              },
              separator: {
                marginLeft: 4,
                marginRight: 4,
              },
            }}
          >
            {steps.map((step, index) => (
              <Stepper.Step
                key={index}
                icon={step.icon}
                label={step.label}
                allowStepSelect={index <= currentStep}
              />
            ))}
          </Stepper>
        </Box>

        {/* Content area */}
        <Box flex={1} p="md" style={{ overflow: 'auto' }}>
          {renderStepContent()}
        </Box>

        {/* Navigation */}
        <Group
          justify="space-between"
          px="md"
          py="sm"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <Button
            variant="subtle"
            leftSection={<FiChevronLeft size={16} />}
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            Back
          </Button>

          <Group gap="sm">
            {currentStep === FlightPlannerStep.NAVLOG_PREVIEW ? (
              <>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<FiRefreshCw size={16} />}
                  onClick={handleResetPlanning}
                >
                  New Flight
                </Button>
                <Button disabled>
                  Save Flight
                </Button>
              </>
            ) : currentStep === FlightPlannerStep.DATE_AND_ALTITUDE ? (
              <Button disabled={!canCalculateNavlog}>
                Calculate Route
              </Button>
            ) : (
              <Button
                rightSection={<FiChevronRight size={16} />}
                onClick={handleNextStep}
                disabled={currentStep === 3}
              >
                Next
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </BottomDrawer>
  );
};

export default FlightPlanningDrawer;
