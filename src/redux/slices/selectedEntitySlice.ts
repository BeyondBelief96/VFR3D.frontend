import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectableEntities, SelectedEntityType } from '@/utility/types';
import { WaypointDto } from '@/redux/api/vfr3d/dtos';

interface SelectedEntityState {
  entity: SelectedEntityType;
  type: SelectableEntities;
  context?: {
    insertIndex?: number;
    waypointId?: string;
    mode?: 'existing' | 'new';
    originalName?: string;
    originalLat?: number;
    originalLon?: number;
  };
}

const initialState: SelectedEntityState = {
  entity: null,
  type: null,
};

const selectedEntitySlice = createSlice({
  name: 'selectedEntity',
  initialState,
  reducers: {
    setSelectedEntity: (state, action: PayloadAction<SelectedEntityState>) => {
      state.entity = action.payload.entity;
      state.type = action.payload.type;
      state.context = action.payload.context;
    },
    clearSelectedEntity: (state) => {
      state.entity = null;
      state.type = null;
      state.context = undefined;
    },
    updateSelectedWaypointPosition: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number; altitude?: number }>
    ) => {
      if (state.type === 'Waypoint' && state.entity) {
        const { latitude, longitude, altitude } = action.payload;
        const waypoint = state.entity as WaypointDto;
        waypoint.latitude = latitude;
        waypoint.longitude = longitude;
        if (typeof altitude === 'number') waypoint.altitude = altitude;
      }
    },
  },
});

export const { setSelectedEntity, clearSelectedEntity, updateSelectedWaypointPosition } =
  selectedEntitySlice.actions;
export default selectedEntitySlice.reducer;
