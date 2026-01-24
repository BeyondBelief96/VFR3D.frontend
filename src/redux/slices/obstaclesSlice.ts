import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ObstaclesState {
  showObstacles: boolean;
  selectedState: string;
  minHeightFilter: number;
}

const initialState: ObstaclesState = {
  showObstacles: false,
  selectedState: '',
  minHeightFilter: 200, // Default to 200ft AGL minimum
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
  },
});

export const { toggleShowObstacles, setObstacleState, setMinHeightFilter } = obstaclesSlice.actions;
export default obstaclesSlice.reducer;
