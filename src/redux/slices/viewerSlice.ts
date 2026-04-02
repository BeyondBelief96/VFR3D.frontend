import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ViewerState {
  currentImageryAlpha: number;
  currentImageryBrightness: number;
  selectedImageryLayer: string;
  globeMaximumScreenSpaceError: number;
  terrainFogDensity: number;
  terrainEnabled: boolean;
}

const initialState: ViewerState = {
  currentImageryAlpha: 1,
  currentImageryBrightness: 1,
  selectedImageryLayer: 'vfrImagery',
  globeMaximumScreenSpaceError: 1.3,
  terrainFogDensity: 4,
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
    setTerrainFogDensity: (state, action: PayloadAction<number>) => {
      state.terrainFogDensity = action.payload;
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
  setTerrainFogDensity,
  setTerrainEnabled,
} = viewerSlice.actions;

export default viewerSlice.reducer;
