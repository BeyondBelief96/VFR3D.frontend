import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ViewerState {
  currentImageryAlpha: number;
  currentImageryBrightness: number;
  selectedImageryLayer: string;
  globeMaximumScreenSpaceError: number;
  terrainEnabled: boolean;
}

const initialState: ViewerState = {
  currentImageryAlpha: 1,
  currentImageryBrightness: 1,
  selectedImageryLayer: 'vfrImagery',
  globeMaximumScreenSpaceError: 1.3,
  terrainEnabled: false,
};

const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    setImageryAlpha: (state, action: PayloadAction<number>) => {
      state.currentImageryAlpha = action.payload;
    },
    setImageryBrightness: (state, action: PayloadAction<number>) => {
      state.currentImageryBrightness = action.payload;
    },
    setSelectedLayer: (state, action: PayloadAction<string>) => {
      state.selectedImageryLayer = action.payload;
    },
    setGlobeMaximumScreenSpaceError: (state, action: PayloadAction<number>) => {
      state.globeMaximumScreenSpaceError = action.payload;
    },
    setTerrainEnabled: (state, action: PayloadAction<boolean>) => {
      state.terrainEnabled = action.payload;
    },
  },
});

export const {
  setImageryAlpha,
  setImageryBrightness,
  setSelectedLayer,
  setGlobeMaximumScreenSpaceError,
  setTerrainEnabled,
} = viewerSlice.actions;

export default viewerSlice.reducer;
