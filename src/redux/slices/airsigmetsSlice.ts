import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HazardType = 'CONVECTIVE' | 'ICE' | 'TURB' | 'IFR' | 'MTN OBSCN';

interface AirsigmetState {
  visibleHazards: { [key in HazardType]: boolean };
}

const initialState: AirsigmetState = {
  visibleHazards: {
    CONVECTIVE: false,
    ICE: false,
    TURB: false,
    IFR: false,
    'MTN OBSCN': false,
  },
};

const airsigmetSlice = createSlice({
  name: 'airsigmet',
  initialState,
  reducers: {
    toggleHazardVisibility: (state, action: PayloadAction<HazardType>) => {
      state.visibleHazards[action.payload] = !state.visibleHazards[action.payload];
    },
  },
});

export const { toggleHazardVisibility } = airsigmetSlice.actions;
export default airsigmetSlice.reducer;
