import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SpecialUseAirspaceTypeCode = 'MOA' | 'R' | 'W' | 'A' | 'P' | 'D';
export type AirspaceClass = 'B' | 'C' | 'D' | 'E';

export interface AirspaceAirportEntry {
  icaoOrIdent: string;
  displayName: string; // "KJFK - John F Kennedy Intl"
  lat: number;
  lon: number;
}

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
  // Airport context airspaces (separate from obstacles)
  airspaceAirports: AirspaceAirportEntry[];
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
  // Airport context airspaces
  airspaceAirports: [],
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
    // Airspace airport actions
    addAirspaceAirport: (state, action: PayloadAction<AirspaceAirportEntry>) => {
      const exists = state.airspaceAirports.some(
        (a) => a.icaoOrIdent === action.payload.icaoOrIdent
      );
      if (!exists) {
        state.airspaceAirports.push(action.payload);
      }
    },
    removeAirspaceAirport: (state, action: PayloadAction<string>) => {
      state.airspaceAirports = state.airspaceAirports.filter(
        (a) => a.icaoOrIdent !== action.payload
      );
    },
    clearAllAirspaceAirports: (state) => {
      state.airspaceAirports = [];
    },
  },
});

export const {
  toggleAirspaceClass,
  toggleSpecialUseAirspaceTypeCode,
  setSelectedCity,
  setSelectedState,
  toggleShowRouteAirspaces,
  addAirspaceAirport,
  removeAirspaceAirport,
  clearAllAirspaceAirports,
} = airspaceSlice.actions;
export default airspaceSlice.reducer;
