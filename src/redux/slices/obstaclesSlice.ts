import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ObstacleAirportEntry {
  icaoOrIdent: string;
  displayName: string; // "KJFK - John F Kennedy Intl"
  lat: number;
  lon: number;
}

interface ObstaclesState {
  minHeightFilter: number;
  showRouteObstacles: boolean;
  heightExaggeration: number;
  showObstacleLabels: boolean;
  // Global radius for airport context obstacles
  airportObstacleRadiusNm: number;
  // Airport context obstacles (separate from airspaces)
  obstacleAirports: ObstacleAirportEntry[];
}

const initialState: ObstaclesState = {
  minHeightFilter: 200, // Default to 200ft AGL minimum
  showRouteObstacles: true,
  heightExaggeration: 1, // Default 1x (true scale) for safety
  showObstacleLabels: true,
  // Global radius for airport context obstacles
  airportObstacleRadiusNm: 5, // Default 5 NM radius
  // Airport context obstacles
  obstacleAirports: [],
};

const obstaclesSlice = createSlice({
  name: 'obstacles',
  initialState,
  reducers: {
    setMinHeightFilter: (state, action: PayloadAction<number>) => {
      state.minHeightFilter = action.payload;
    },
    toggleShowRouteObstacles: (state, action: PayloadAction<boolean>) => {
      state.showRouteObstacles = action.payload;
    },
    setHeightExaggeration: (state, action: PayloadAction<number>) => {
      state.heightExaggeration = action.payload;
    },
    toggleShowObstacleLabels: (state, action: PayloadAction<boolean>) => {
      state.showObstacleLabels = action.payload;
    },
    setAirportObstacleRadius: (state, action: PayloadAction<number>) => {
      state.airportObstacleRadiusNm = action.payload;
    },
    // Obstacle airport actions
    addObstacleAirport: (state, action: PayloadAction<ObstacleAirportEntry>) => {
      const exists = state.obstacleAirports.some(
        (a) => a.icaoOrIdent === action.payload.icaoOrIdent
      );
      if (!exists) {
        state.obstacleAirports.push(action.payload);
      }
    },
    removeObstacleAirport: (state, action: PayloadAction<string>) => {
      state.obstacleAirports = state.obstacleAirports.filter(
        (a) => a.icaoOrIdent !== action.payload
      );
    },
    clearAllObstacleAirports: (state) => {
      state.obstacleAirports = [];
    },
  },
});

export const {
  setMinHeightFilter,
  toggleShowRouteObstacles,
  setHeightExaggeration,
  toggleShowObstacleLabels,
  setAirportObstacleRadius,
  addObstacleAirport,
  removeObstacleAirport,
  clearAllObstacleAirports,
} = obstaclesSlice.actions;
export default obstaclesSlice.reducer;
