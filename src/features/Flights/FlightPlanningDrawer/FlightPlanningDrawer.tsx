import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Button,
  Group,
  Stack,
  Stepper,
  Text,
  Loader,
  Paper,
  ThemeIcon,
  Image,
  Badge,
  Divider,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useIsPhone } from '@/hooks';
import {
  FiMapPin,
  FiClock,
  FiTable,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSave,
  FiEdit2,
  FiPlus,
  FiX,
  FiCheck,
  FiExternalLink,
  FiMap,
} from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { BottomDrawer } from '@/components/Common/BottomDrawer';
import { useSidebar } from '@/components/Layout/SidebarContext';
import { FlightRouteBuilder } from '@/features/Flights';
import { RootState, AppDispatch } from '@/redux/store';
import {
  updateDraftPlanSettings,
  resetToPlanning,
  clearDraftWaypoints,
  clearWaypoints,
  addWaypoint,
  updateNavlogPreview,
  updateReturnNavlogPreview,
  clearNavlogPreviews,
  setDisplayMode,
  startEditingFlight,
  finishEditingFlight,
  startNewFlight,
  setActiveFlightId,
} from '@/redux/slices/flightPlanningSlice';
import { FlightDisplayMode } from '@/utility/enums';
import {
  WaypointDto,
  NavlogRequestDto,
  CreateFlightRequestDto,
  CreateRoundTripFlightRequestDto,
  UpdateFlightRequestDto,
} from '@/redux/api/vfr3d/dtos';
import { useAuth } from '@/components/Auth';
import { useCalculateNavLogMutation } from '@/redux/api/vfr3d/navlog.api';
import {
  useCreateFlightMutation,
  useCreateRoundTripFlightMutation,
  useGetFlightQuery,
  useUpdateFlightMutation,
} from '@/redux/api/vfr3d/flights.api';
import { DrawerAircraftPerformanceProfiles } from './PerformanceProfiles';
import { AltitudeAndDepartureControls } from './AltitudeAndDepartureControls';
import { NavLogTable, analyzeFuelStatus } from './NavLogTable';
import { FlightPlanCalculationLoading } from './FlightPlanCalculationLoading';
import { FlightViewerContent } from './FlightViewerContent';
import { QuickLayerSettings } from './QuickLayerSettings';
import { FiAlertTriangle } from 'react-icons/fi';
import logo from '@/assets/images/logo_2.png';
import classes from './FlightPlanningDrawer.module.css';

// Step enum for clarity
enum FlightPlannerStep {
  ROUTE_BUILDING = 0,
  AIRCRAFT = 1,
  DATE_AND_ALTITUDE = 2,
  NAVLOG_PREVIEW = 3,
}

export const FlightPlanningDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();
  const sidebar = useSidebar();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savedFlightInfo, setSavedFlightInfo] = useState<{
    id: string;
    name: string;
    isRoundTrip: boolean;
  } | null>(null);

  const {
    displayMode,
    draftFlightPlan,
    editingFlightPlan,
    navlogPreview,
    navlogPreviewReturn,
    activeFlightId,
  } = useSelector((state: RootState) => state.flightPlanning);

  // Fetch flight data when viewing a saved flight
  const {
    data: activeFlightData,
    isLoading: isLoadingFlight,
    isError: isFlightError,
  } = useGetFlightQuery(
    { userId, flightId: activeFlightId || '' },
    {
      skip: !userId || !activeFlightId || displayMode === FlightDisplayMode.PLANNING,
    }
  );

  // Auto-open drawer when viewing a flight
  useEffect(() => {
    if (displayMode === FlightDisplayMode.VIEWING && activeFlightId) {
      if (sidebar.isOpen) {
        sidebar.close();
      }
      setIsOpen(true);
    }
  }, [displayMode, activeFlightId, sidebar]);

  const {
    waypoints: flightPlanRoute,
    currentStep,
    selectedPerformanceProfileId,
    plannedCruisingAltitude,
    departureTimeUtc,
    roundTrip,
    returnPlannedCruisingAltitude,
    returnDepartureTimeUtc,
    name: flightName,
  } = draftFlightPlan;

  // API Mutations
  const [calculateNavLog, { isLoading: isCalculating }] = useCalculateNavLogMutation();
  const [createFlight, { isLoading: isCreatingFlight }] = useCreateFlightMutation();
  const [createRoundTripFlight, { isLoading: isCreatingRoundTrip }] =
    useCreateRoundTripFlightMutation();
  const [updateFlight, { isLoading: isUpdatingFlight }] = useUpdateFlightMutation();

  const isSaving = isCreatingFlight || isCreatingRoundTrip || isUpdatingFlight;

  // Analyze fuel status for warnings
  const outboundFuelStatus = navlogPreview ? analyzeFuelStatus(navlogPreview.legs) : null;
  const returnFuelStatus = navlogPreviewReturn ? analyzeFuelStatus(navlogPreviewReturn.legs) : null;
  const hasCriticalFuelIssue =
    outboundFuelStatus?.hasCriticalFuel || returnFuelStatus?.hasCriticalFuel;

  // Determine if we're in viewing or editing mode for a saved flight
  const isViewingMode = displayMode === FlightDisplayMode.VIEWING;
  const isEditingMode = displayMode === FlightDisplayMode.EDITING;

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

  const toggleDrawer = () => {
    const willOpen = !isOpen;
    if (willOpen && sidebar.isOpen) {
      sidebar.close();
    }
    setIsOpen(willOpen);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      dispatch(updateDraftPlanSettings({ currentStep: currentStep + 1 }));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      dispatch(updateDraftPlanSettings({ currentStep: newStep }));

      // If leaving NAVLOG_PREVIEW step, switch back to PLANNING mode and clear saved state
      if (currentStep === FlightPlannerStep.NAVLOG_PREVIEW) {
        dispatch(setDisplayMode(FlightDisplayMode.PLANNING));
        setSavedFlightInfo(null);
      }
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
    dispatch(clearNavlogPreviews());
    dispatch(setDisplayMode(FlightDisplayMode.PLANNING));
  };

  // Calculate Route Handler
  const handleCalculateRoute = async () => {
    if (!selectedPerformanceProfileId) {
      notifications.show({
        title: 'Missing Profile',
        message: 'Please select an aircraft performance profile first.',
        color: 'red',
      });
      return;
    }

    try {
      // Calculate outbound navlog
      const outboundRequest: NavlogRequestDto = {
        waypoints: flightPlanRoute,
        aircraftPerformanceProfileId: selectedPerformanceProfileId,
        plannedCruisingAltitude,
        timeOfDeparture: new Date(departureTimeUtc),
      };

      const outboundResult = await calculateNavLog(outboundRequest).unwrap();
      dispatch(updateNavlogPreview(outboundResult));

      // Calculate return navlog if round trip
      if (roundTrip) {
        const returnWaypoints = [...flightPlanRoute].reverse();
        const returnRequest: NavlogRequestDto = {
          waypoints: returnWaypoints,
          aircraftPerformanceProfileId: selectedPerformanceProfileId,
          plannedCruisingAltitude: returnPlannedCruisingAltitude,
          timeOfDeparture: new Date(returnDepartureTimeUtc),
        };

        const returnResult = await calculateNavLog(returnRequest).unwrap();
        dispatch(updateReturnNavlogPreview(returnResult));
      }

      // Advance to nav log preview step and switch to PREVIEW mode
      dispatch(updateDraftPlanSettings({ currentStep: FlightPlannerStep.NAVLOG_PREVIEW }));
      dispatch(setDisplayMode(FlightDisplayMode.PREVIEW));

      notifications.show({
        title: 'Route Calculated',
        message: 'Your navigation log has been calculated successfully.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Calculation Failed',
        message: 'Unable to calculate navigation log. Please try again.',
        color: 'red',
      });
    }
  };

  // Save Flight Handler
  const handleSaveFlight = async () => {
    if (!userId) {
      notifications.show({
        title: 'Not Authenticated',
        message: 'Please log in to save your flight.',
        color: 'red',
      });
      return;
    }

    try {
      if (roundTrip) {
        // Create round trip flight
        const request: CreateRoundTripFlightRequestDto = {
          outboundName: flightName,
          returnName: `Return: ${flightName}`,
          departureTime: new Date(departureTimeUtc),
          returnDepartureTime: new Date(returnDepartureTimeUtc),
          plannedCruisingAltitude,
          waypoints: flightPlanRoute,
          aircraftPerformanceProfileId: selectedPerformanceProfileId || undefined,
        };

        const result = await createRoundTripFlight({ userId, request }).unwrap();

        notifications.show({
          title: 'Round Trip Saved',
          message: 'Your outbound and return flights have been saved.',
          color: 'green',
        });

        // Store saved flight info for post-save options
        if (result.outbound?.id) {
          setSavedFlightInfo({
            id: result.outbound.id,
            name: flightName,
            isRoundTrip: true,
          });
        }
      } else {
        // Create single flight
        const request: CreateFlightRequestDto = {
          name: flightName,
          departureTime: new Date(departureTimeUtc),
          plannedCruisingAltitude,
          waypoints: flightPlanRoute,
          aircraftPerformanceProfileId: selectedPerformanceProfileId || undefined,
        };

        const result = await createFlight({ userId, flight: request }).unwrap();

        notifications.show({
          title: 'Flight Saved',
          message: 'Your flight has been saved successfully.',
          color: 'green',
        });

        // Store saved flight info for post-save options
        if (result.id) {
          setSavedFlightInfo({
            id: result.id,
            name: flightName,
            isRoundTrip: false,
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Save Failed',
        message: 'Unable to save flight. Please try again.',
        color: 'red',
      });
    }
  };

  // Start editing a saved flight
  const handleStartEditing = () => {
    if (!activeFlightData) return;

    dispatch(
      startEditingFlight({
        waypoints: activeFlightData.waypoints || [],
        plannedCruisingAltitude: activeFlightData.plannedCruisingAltitude || 4500,
        departureTimeUtc: activeFlightData.departureTime || new Date().toISOString(),
      })
    );
  };

  // Cancel editing and return to viewing
  const handleCancelEditing = () => {
    dispatch(finishEditingFlight());
  };

  // Save edited flight
  const handleSaveEditedFlight = async () => {
    if (!userId || !activeFlightId || !editingFlightPlan) return;

    try {
      const request: UpdateFlightRequestDto = {
        waypoints: editingFlightPlan.waypoints,
        plannedCruisingAltitude: editingFlightPlan.plannedCruisingAltitude,
        departureTime: new Date(editingFlightPlan.departureTimeUtc),
      };

      await updateFlight({ userId, flightId: activeFlightId, flight: request }).unwrap();

      notifications.show({
        title: 'Flight Updated',
        message: 'Your flight has been updated successfully.',
        color: 'green',
      });

      dispatch(finishEditingFlight());
    } catch (error) {
      notifications.show({
        title: 'Update Failed',
        message: 'Unable to update flight. Please try again.',
        color: 'red',
      });
    }
  };

  // Start a new flight from viewing mode
  const handleStartNewFlight = () => {
    dispatch(startNewFlight());
    setSavedFlightInfo(null);
  };

  // View saved flight in the viewer (stay on map)
  const handleViewSavedFlight = () => {
    if (!savedFlightInfo) return;
    dispatch(setActiveFlightId(savedFlightInfo.id));
    dispatch(setDisplayMode(FlightDisplayMode.VIEWING));
    setSavedFlightInfo(null);
  };

  // Navigate to flights page
  const handleGoToFlightsPage = () => {
    if (!savedFlightInfo) return;
    dispatch(resetToPlanning());
    setSavedFlightInfo(null);
    navigate({ to: '/flights/$flightId', params: { flightId: savedFlightInfo.id } });
  };

  // Start planning a new flight after saving
  const handlePlanNewFlight = () => {
    dispatch(resetToPlanning());
    setSavedFlightInfo(null);
  };

  const isEditable =
    displayMode === FlightDisplayMode.PLANNING ||
    displayMode === FlightDisplayMode.EDITING;

  // Step definitions with mobile-friendly abbreviated labels
  const steps = [
    { label: isPhone ? 'Route' : 'Route', fullLabel: 'Route', icon: <FiMapPin size={16} /> },
    { label: isPhone ? 'A/C' : 'Aircraft', fullLabel: 'Aircraft', icon: <FaPlane size={14} /> },
    { label: isPhone ? 'Alt' : 'Time & Alt', fullLabel: 'Time & Altitude', icon: <FiClock size={16} /> },
    { label: isPhone ? 'Log' : 'Nav Log', fullLabel: 'Navigation Log', icon: <FiTable size={16} /> },
  ];

  // Validation for step progression
  const canProceedToAircraft = flightPlanRoute.length >= 2;
  const canProceedToAltitude = canProceedToAircraft && !!selectedPerformanceProfileId;
  const canCalculate = canProceedToAltitude && plannedCruisingAltitude > 0;

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
          <DrawerAircraftPerformanceProfiles
            disabled={!isEditable}
            onEditingStateChange={setIsEditingProfile}
          />
        );
      case FlightPlannerStep.DATE_AND_ALTITUDE:
        return <AltitudeAndDepartureControls disabled={!isEditable} />;
      case FlightPlannerStep.NAVLOG_PREVIEW:
        if (isCalculating) {
          return <FlightPlanCalculationLoading />;
        }
        // Show saved flight confirmation
        if (savedFlightInfo) {
          return (
            <Box py="xl" px="md" className={classes.savedConfirmationContainer}>
              <Paper p="xl" radius="lg" className={classes.savedConfirmationPaper}>
                <Stack align="center" gap="lg">
                  {/* Logo */}
                  <Image src={logo} alt="VFR3D" h={48} w="auto" />

                  {/* Success indicator */}
                  <Box ta="center">
                    <Group gap="xs" justify="center" mb="xs">
                      <ThemeIcon size={28} radius="xl" color="green" variant="filled">
                        <FiCheck size={16} />
                      </ThemeIcon>
                      <Text size="lg" fw={600} c="white">
                        Flight Plan Saved
                      </Text>
                    </Group>
                  </Box>

                  {/* Flight details card */}
                  <Paper p="md" radius="md" w="100%" className={classes.flightDetailsPaper}>
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                          Flight
                        </Text>
                        <Text size="md" fw={600} c="white">
                          {savedFlightInfo.name}
                        </Text>
                      </Box>
                      {savedFlightInfo.isRoundTrip && (
                        <Badge variant="light" color="blue" size="sm">
                          Round Trip
                        </Badge>
                      )}
                    </Group>
                  </Paper>

                  <Divider
                    w="100%"
                    color="rgba(148, 163, 184, 0.15)"
                    label={
                      <Text size="xs" c="dimmed">
                        Continue with
                      </Text>
                    }
                    labelPosition="center"
                  />

                  {/* Action buttons */}
                  <Stack gap="xs" w="100%">
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<FiMap size={18} />}
                      onClick={handleViewSavedFlight}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    >
                      View on Map
                    </Button>
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<FiExternalLink size={18} />}
                      onClick={handleGoToFlightsPage}
                      variant="light"
                      color="gray"
                    >
                      Flight Details Page
                    </Button>
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<FiPlus size={18} />}
                      onClick={handlePlanNewFlight}
                      variant="subtle"
                      color="dimmed"
                    >
                      Plan New Flight
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          );
        }
        if (!navlogPreview) {
          return (
            <Box ta="center" py="xl">
              <FiTable size={48} style={{ opacity: 0.3 }} />
              <Text size="lg" fw={500} mt="md" c="white">
                No Navigation Log
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Go back and calculate your route to see the navigation log.
              </Text>
            </Box>
          );
        }
        return (
          <>
            <QuickLayerSettings />
            <NavLogTable
              navlog={navlogPreview}
              returnNavlog={navlogPreviewReturn || undefined}
              isRoundTrip={roundTrip}
            />
          </>
        );
      default:
        return null;
    }
  };

  // Get drawer title based on mode
  const getDrawerTitle = () => {
    if (isViewingMode) return 'Flight Details';
    if (isEditingMode) return 'Edit Flight';
    return 'Flight Planner';
  };

  // Render viewing mode content
  const renderViewingContent = () => (
    <Stack h="100%" gap={0}>
      {/* Content area */}
      <Box flex={1} p="md" style={{ overflowY: 'auto' }}>
        <QuickLayerSettings />
        <FlightViewerContent
          flight={activeFlightData}
          isLoading={isLoadingFlight}
          isError={isFlightError}
        />
      </Box>

      {/* Actions */}
      <Group justify="space-between" px="md" py="sm" className={classes.borderTop}>
        <Button
          variant="light"
          color="gray"
          leftSection={<FiPlus size={16} />}
          onClick={handleStartNewFlight}
        >
          New Flight
        </Button>

        <Button
          leftSection={<FiEdit2 size={16} />}
          onClick={handleStartEditing}
          disabled={isLoadingFlight || isFlightError || !activeFlightData}
        >
          Edit Flight
        </Button>
      </Group>
    </Stack>
  );

  // Render editing mode content (similar to planning but for saved flights)
  const renderEditingContent = () => {
    if (!editingFlightPlan) return null;

    return (
      <Stack h="100%" gap={0}>
        {/* Content - show route builder for editing waypoints */}
        <Box flex={1} p="md" style={{ overflowY: 'auto' }}>
          <FlightRouteBuilder
            routePoints={editingFlightPlan.waypoints}
            onRoutePointsChange={(points) => {
              // For editing, we need to update the editing flight plan
              // clearWaypoints respects displayMode, so it clears editingFlightPlan.waypoints
              dispatch(clearWaypoints());
              points.forEach((point, index) => {
                dispatch(addWaypoint({ waypoint: point, index }));
              });
            }}
            disabled={false}
          />
        </Box>

        {/* Actions */}
        <Group justify="space-between" px="md" py="sm" className={classes.borderTop}>
          <Button
            variant="subtle"
            leftSection={<FiX size={16} />}
            onClick={handleCancelEditing}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            leftSection={isSaving ? <Loader size="xs" color="white" /> : <FiSave size={16} />}
            onClick={handleSaveEditedFlight}
            disabled={
              isSaving ||
              !editingFlightPlan.hasUnsavedChanges ||
              editingFlightPlan.waypoints.length < 2
            }
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Group>
      </Stack>
    );
  };

  // Render planning/preview mode content (existing stepper flow)
  const renderPlanningContent = () => (
    <Stack h="100%" gap={0}>
      {/* Stepper */}
      <Box px="md" py="sm" className={classes.borderBottom}>
        <Stepper
          active={currentStep}
          onStepClick={(step) => {
            // Don't allow step navigation when editing a profile or after saving
            if (isEditingProfile || savedFlightInfo) return;
            if (step <= currentStep) {
              dispatch(updateDraftPlanSettings({ currentStep: step }));

              // If leaving NAVLOG_PREVIEW step, switch back to PLANNING mode
              if (currentStep === FlightPlannerStep.NAVLOG_PREVIEW && step < currentStep) {
                dispatch(setDisplayMode(FlightDisplayMode.PLANNING));
                setSavedFlightInfo(null);
              }
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
            <Tooltip key={index} label={step.fullLabel} disabled={!isPhone}>
              <Stepper.Step
                icon={step.icon}
                label={step.label}
                allowStepSelect={index <= currentStep}
              />
            </Tooltip>
          ))}
        </Stepper>
      </Box>

      {/* Content area */}
      <Box flex={1} p="md" style={{ overflowY: 'auto' }}>
        {renderStepContent()}
      </Box>

      {/* Navigation - hide when showing saved confirmation */}
      {!savedFlightInfo && (
        <Group justify="space-between" px="md" py="sm" className={classes.borderTop}>
          <Button
            variant="subtle"
            leftSection={<FiChevronLeft size={16} />}
            onClick={handlePreviousStep}
            disabled={currentStep === 0 || isCalculating || isSaving || isEditingProfile}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            Back
          </Button>

          <Group gap="sm">
            {currentStep === FlightPlannerStep.NAVLOG_PREVIEW ? (
            <>
              {/* Fuel Warning Badge */}
              {hasCriticalFuelIssue && (
                <Group gap={4} c="ifrRed.5">
                  <FiAlertTriangle size={16} />
                  <Text size="xs" fw={600} c="red.4">
                    FUEL ISSUE
                  </Text>
                </Group>
              )}
              <Button
                variant="light"
                color="gray"
                leftSection={<FiRefreshCw size={16} />}
                onClick={handleResetPlanning}
                disabled={isSaving}
              >
                New Flight
              </Button>
              <Button
                leftSection={isSaving ? <Loader size="xs" color="white" /> : <FiSave size={16} />}
                onClick={handleSaveFlight}
                disabled={!navlogPreview || isSaving || !userId}
                color={hasCriticalFuelIssue ? 'red' : undefined}
                variant={hasCriticalFuelIssue ? 'outline' : 'filled'}
              >
                {isSaving ? 'Saving...' : hasCriticalFuelIssue ? 'Save Anyway' : 'Save Flight'}
              </Button>
            </>
          ) : currentStep === FlightPlannerStep.DATE_AND_ALTITUDE ? (
            <Button
              onClick={handleCalculateRoute}
              disabled={!canCalculate || isCalculating}
              leftSection={isCalculating ? <Loader size="xs" color="white" /> : undefined}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Route'}
            </Button>
          ) : (
            <Button
              rightSection={<FiChevronRight size={16} />}
              onClick={handleNextStep}
              disabled={
                isEditingProfile ||
                (currentStep === FlightPlannerStep.ROUTE_BUILDING && !canProceedToAircraft) ||
                (currentStep === FlightPlannerStep.AIRCRAFT && !canProceedToAltitude) ||
                currentStep === 3
              }
            >
              Next
            </Button>
          )}
        </Group>
        </Group>
      )}
    </Stack>
  );

  return (
    <BottomDrawer
      isOpen={isOpen}
      toggleOpen={toggleDrawer}
      title={getDrawerTitle()}
    >
      {isViewingMode && renderViewingContent()}
      {isEditingMode && renderEditingContent()}
      {!isViewingMode && !isEditingMode && renderPlanningContent()}
    </BottomDrawer>
  );
};

export default FlightPlanningDrawer;
