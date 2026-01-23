import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SpecialUseAirspaceTypeCode = 'MOA' | 'R' | 'W' | 'A' | 'P' | 'D';
export type AirspaceClass = 'B' | 'C' | 'D' | 'E';

interface AirspaceState {
  visibleClasses: {
    [key in AirspaceClass]: boolean;
  };
  visibleTypeCodes: {
    [key in SpecialUseAirspaceTypeCode]: boolean;
  };
  selectedCity: string | null;
  selectedState: string | null;
  showRouteAirspaces: boolean;
}

const initialState: AirspaceState = {
  visibleClasses: {
    B: false,
    C: false,
    D: false,
    E: false,
  },
  visibleTypeCodes: {
    MOA: false,
    R: false,
    W: false,
    A: false,
    P: false,
    D: false,
  },
  selectedCity: null,
  selectedState: null,
  showRouteAirspaces: true,
};

const airspaceSlice = createSlice({
  name: 'airspace',
  initialState,
  reducers: {
    toggleAirspaceClass: (state, action: PayloadAction<AirspaceClass>) => {
      state.visibleClasses[action.payload] = !state.visibleClasses[action.payload];
    },
    toggleSpecialUseAirspaceTypeCode: (
      state,
      action: PayloadAction<SpecialUseAirspaceTypeCode>
    ) => {
      state.visibleTypeCodes[action.payload] = !state.visibleTypeCodes[action.payload];
    },
    setSelectedCity: (state, action: PayloadAction<string | null>) => {
      state.selectedCity = action.payload;
      state.selectedState = null;
    },
    setSelectedState: (state, action: PayloadAction<string | null>) => {
      state.selectedState = action.payload;
      state.selectedCity = null;
    },
    toggleShowRouteAirspaces: (state) => {
      state.showRouteAirspaces = !state.showRouteAirspaces;
    },
  },
});

export const {
  toggleAirspaceClass,
  toggleSpecialUseAirspaceTypeCode,
  setSelectedCity,
  setSelectedState,
  toggleShowRouteAirspaces,
} = airspaceSlice.actions;
export default airspaceSlice.reducer;
