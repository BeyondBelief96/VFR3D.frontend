import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ObstaclesState {
  showObstacles: boolean;
  selectedState: string;
  minHeightFilter: number;
  showRouteObstacles: boolean;
  heightExaggeration: number;
  showObstacleLabels: boolean;
}

const initialState: ObstaclesState = {
  showObstacles: false,
  selectedState: '',
  minHeightFilter: 200, // Default to 200ft AGL minimum
  showRouteObstacles: true,
  heightExaggeration: 1, // Default 1x (true scale) for safety
  showObstacleLabels: true,
};

const obstaclesSlice = createSlice({
  name: 'obstacles',
  initialState,
  reducers: {
    toggleShowObstacles: (state, action: PayloadAction<boolean>) => {
      state.showObstacles = action.payload;
    },
    setObstacleState: (state, action: PayloadAction<string>) => {
      state.selectedState = action.payload;
    },
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
  },
});

export const {
  toggleShowObstacles,
  setObstacleState,
  setMinHeightFilter,
  toggleShowRouteObstacles,
  setHeightExaggeration,
  toggleShowObstacleLabels,
} = obstaclesSlice.actions;
export default obstaclesSlice.reducer;
