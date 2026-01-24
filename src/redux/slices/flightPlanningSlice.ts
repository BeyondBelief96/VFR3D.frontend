import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FlightDisplayMode } from '@/utility/enums';
import { mapAirportDTOToWaypoint } from '@/utility/utils';
import { fetchAirportByCode } from '@/redux/thunks/airports';
import { NavlogResponseDto, WaypointDto, WaypointType } from '@/redux/api/vfr3d/dtos';

// Types
interface FlightPlan {
  waypoints: WaypointDto[];
  plannedCruisingAltitude: number;
  departureTimeUtc: string;
}

interface DraftFlightPlan extends FlightPlan {
  name: string;
  selectedPerformanceProfileId: string | null;
  isComplete: boolean;
  canCalculateNavlog: boolean;
  currentStep: number;
  roundTrip: boolean;
  returnPlannedCruisingAltitude: number;
  returnDepartureTimeUtc: string;
  returnName?: string;
}

interface EditingFlightPlan extends FlightPlan {
  hasUnsavedChanges: boolean;
}

interface FlightPlanningState {
  displayMode: FlightDisplayMode;
  activeFlightId: string | null;
  draftFlightPlan: DraftFlightPlan;
  editingFlightPlan: EditingFlightPlan | null;
  navlogPreview: NavlogResponseDto | null;
  navlogPreviewReturn: NavlogResponseDto | null;
}

// Initial State
const initialState: FlightPlanningState = {
  displayMode: FlightDisplayMode.PLANNING,
  activeFlightId: null,
  draftFlightPlan: {
    name: '',
    selectedPerformanceProfileId: null,
    plannedCruisingAltitude: 4500,
    departureTimeUtc: new Date().toUTCString(),
    isComplete: false,
    canCalculateNavlog: false,
    currentStep: 0,
    waypoints: [],
    roundTrip: false,
    returnPlannedCruisingAltitude: 4500,
    returnDepartureTimeUtc: new Date().toUTCString(),
  },
  editingFlightPlan: null,
  navlogPreview: null,
  navlogPreviewReturn: null,
};

// Payload Types
interface UpdateWaypointPositionPayload {
  waypointId: string;
  position: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
}

interface UpdateWaypointNamePayload {
  id: string;
  name: string;
}

interface AddWaypointPayload {
  waypoint: WaypointDto;
  index: number;
}

interface ReorderWaypointPayload {
  sourceIndex: number;
  destinationIndex: number;
}

interface StartEditingFlightPayload {
  waypoints: WaypointDto[];
  plannedCruisingAltitude: number;
  departureTimeUtc: string;
}

// Helper Functions
const addWaypointToState = (
  waypoints: WaypointDto[],
  waypoint: WaypointDto,
  index: number
): WaypointDto[] => {
  const updatedWaypoints = [...waypoints];
  updatedWaypoints.splice(index, 0, waypoint);
  return updatedWaypoints;
};

const removeWaypointFromState = (waypoints: WaypointDto[], waypointId: string): WaypointDto[] => {
  return waypoints.filter((point) => point.id !== waypointId);
};

const updateWaypointNameInState = (
  waypoints: WaypointDto[],
  waypointId: string,
  name: string
): WaypointDto[] => {
  return waypoints.map((point) => (point.id === waypointId ? { ...point, name } : point));
};

const updateWaypointPositionInState = (
  waypoints: WaypointDto[],
  waypointId: string,
  position: { latitude: number; longitude: number; altitude?: number }
): WaypointDto[] => {
  return waypoints.map((point) => (point.id === waypointId ? { ...point, ...position } : point));
};

const flightPlanningSlice = createSlice({
  name: 'flightPlanning',
  initialState,
  reducers: {
    // Mode and ID Management
    setDisplayMode: (state, action: PayloadAction<FlightDisplayMode>) => {
      state.displayMode = action.payload;
    },

    setActiveFlightId: (state, action: PayloadAction<string | null>) => {
      state.activeFlightId = action.payload;
      if (action.payload) {
        state.displayMode = FlightDisplayMode.VIEWING;
      }
    },

    // Unified Waypoint Operations
    addWaypoint: (state, action: PayloadAction<AddWaypointPayload>) => {
      const { waypoint, index } = action.payload;

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = addWaypointToState(
          state.draftFlightPlan.waypoints,
          waypoint,
          index
        );
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        state.editingFlightPlan.waypoints = addWaypointToState(
          state.editingFlightPlan.waypoints,
          waypoint,
          index
        );
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    removeWaypoint: (state, action: PayloadAction<string>) => {
      const waypointId = action.payload;

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = removeWaypointFromState(
          state.draftFlightPlan.waypoints,
          waypointId
        );
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        state.editingFlightPlan.waypoints = removeWaypointFromState(
          state.editingFlightPlan.waypoints,
          waypointId
        );
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    reorderWaypoint: (state, action: PayloadAction<ReorderWaypointPayload>) => {
      const { sourceIndex, destinationIndex } = action.payload;

      const move = (arr: WaypointDto[]): WaypointDto[] => {
        const updated = [...arr];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(destinationIndex, 0, moved);
        return updated;
      };

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = move(state.draftFlightPlan.waypoints);
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        state.editingFlightPlan.waypoints = move(state.editingFlightPlan.waypoints);
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    updateWaypointName: (state, action: PayloadAction<UpdateWaypointNamePayload>) => {
      const { id, name } = action.payload;

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = updateWaypointNameInState(
          state.draftFlightPlan.waypoints,
          id,
          name
        );
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        state.editingFlightPlan.waypoints = updateWaypointNameInState(
          state.editingFlightPlan.waypoints,
          id,
          name
        );
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    updateWaypointPosition: (state, action: PayloadAction<UpdateWaypointPositionPayload>) => {
      const { waypointId, position } = action.payload;

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = updateWaypointPositionInState(
          state.draftFlightPlan.waypoints,
          waypointId,
          position
        );
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        state.editingFlightPlan.waypoints = updateWaypointPositionInState(
          state.editingFlightPlan.waypoints,
          waypointId,
          position
        );
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    setWaypointRefuel: (
      state,
      action: PayloadAction<{
        waypointId: string;
        isRefuel: boolean;
        refuelToFull?: boolean;
        refuelGallons?: number;
      }>
    ) => {
      const { waypointId, isRefuel, refuelToFull, refuelGallons } = action.payload;
      const apply = (arr: WaypointDto[]) => {
        const idx = arr.findIndex((w) => w.id === waypointId);
        if (idx >= 0) {
          const current = arr[idx];
          const isAirportType = current.waypointType === WaypointType.Airport;
          if (!isAirportType) return;
          const updated: WaypointDto = {
            ...current,
            isRefuelingStop: isRefuel,
            refuelToFull: isRefuel ? refuelToFull ?? current.refuelToFull ?? true : undefined,
            refuelGallons: isRefuel ? refuelGallons ?? current.refuelGallons : undefined,
          };
          arr[idx] = updated;
        }
      };

      if (state.displayMode === FlightDisplayMode.PLANNING) {
        apply(state.draftFlightPlan.waypoints);
      } else if (state.editingFlightPlan && state.displayMode === FlightDisplayMode.EDITING) {
        apply(state.editingFlightPlan.waypoints);
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    // Draft Flight Plan Operations
    updateDraftPlanSettings: (state, action: PayloadAction<Partial<DraftFlightPlan>>) => {
      Object.assign(state.draftFlightPlan, action.payload);
    },

    clearDraftWaypoints: (state) => {
      state.draftFlightPlan.waypoints = [];
    },

    clearWaypoints: (state) => {
      if (state.displayMode === FlightDisplayMode.PLANNING) {
        state.draftFlightPlan.waypoints = [];
      } else if (state.displayMode === FlightDisplayMode.EDITING && state.editingFlightPlan) {
        state.editingFlightPlan.waypoints = [];
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    // Editing Flight Plan Operations
    startEditingFlight: (state, action: PayloadAction<StartEditingFlightPayload>) => {
      state.displayMode = FlightDisplayMode.EDITING;
      state.editingFlightPlan = {
        ...action.payload,
        hasUnsavedChanges: false,
      };
    },

    updateEditingPlanSettings: (
      state,
      action: PayloadAction<Partial<Omit<EditingFlightPlan, 'hasUnsavedChanges'>>>
    ) => {
      if (state.editingFlightPlan) {
        Object.assign(state.editingFlightPlan, action.payload);
        state.editingFlightPlan.hasUnsavedChanges = true;
      }
    },

    finishEditingFlight: (state) => {
      if (state.displayMode === FlightDisplayMode.EDITING) {
        state.displayMode = FlightDisplayMode.VIEWING;
        state.editingFlightPlan = null;
      }
    },

    // Navlog and State Operations
    updateNavlogPreview: (state, action: PayloadAction<NavlogResponseDto>) => {
      state.navlogPreview = action.payload;
    },
    updateReturnNavlogPreview: (state, action: PayloadAction<NavlogResponseDto>) => {
      state.navlogPreviewReturn = action.payload;
    },
    clearNavlogPreviews: (state) => {
      state.navlogPreview = null;
      state.navlogPreviewReturn = null;
    },

    // Reset Operations
    startNewFlight: (state) => {
      state.displayMode = FlightDisplayMode.PLANNING;
      state.activeFlightId = null;
      state.draftFlightPlan = initialState.draftFlightPlan;
      state.navlogPreview = null;
      state.navlogPreviewReturn = null;
    },

    viewFlightInMap: (state, action: PayloadAction<string>) => {
      state.activeFlightId = action.payload;
      state.displayMode = FlightDisplayMode.VIEWING;
      state.draftFlightPlan = initialState.draftFlightPlan;
    },

    resetToPlanning: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAirportByCode.fulfilled, (state, action) => {
      const airport = action.payload;
      if (airport && state.displayMode === FlightDisplayMode.PLANNING) {
        const existingAirport = state.draftFlightPlan.waypoints.find(
          (point) => point.name === airport.icaoId || point.name === airport.arptId
        );
        if (!existingAirport) {
          state.draftFlightPlan.waypoints.push(mapAirportDTOToWaypoint(airport));
        }
      }
    });
  },
});

export const {
  // Mode and ID Management
  setDisplayMode,
  setActiveFlightId,

  // Unified Waypoint Operations
  addWaypoint,
  removeWaypoint,
  updateWaypointName,
  updateWaypointPosition,
  reorderWaypoint,
  setWaypointRefuel,

  // Draft Plan Operations
  updateDraftPlanSettings,
  clearDraftWaypoints,
  clearWaypoints,

  // Editing Operations
  startEditingFlight,
  updateEditingPlanSettings,
  finishEditingFlight,

  // Navlog and State Operations
  updateNavlogPreview,
  updateReturnNavlogPreview,
  clearNavlogPreviews,

  // Reset Operations
  startNewFlight,
  viewFlightInMap,
  resetToPlanning,
} = flightPlanningSlice.actions;

export default flightPlanningSlice.reducer;
